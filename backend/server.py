from fastapi import FastAPI, APIRouter, HTTPException, Response, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import bcrypt
import jwt
import httpx
from datetime import datetime, timezone, timedelta
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', uuid.uuid4().hex)
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str

class SessionRequest(BaseModel):
    session_id: str

class CheckoutRequest(BaseModel):
    items: List[Dict]
    origin_url: str

class NewsletterRequest(BaseModel):
    email: str

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def get_current_user(request: Request) -> Optional[dict]:
    session_token = request.cookies.get("session_token")
    if session_token:
        session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
        if session:
            expires_at = session["expires_at"]
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at > datetime.now(timezone.utc):
                user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
                if user:
                    return user
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            # Try JWT first
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            user = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
            return user
        except jwt.PyJWTError:
            # Try session token as fallback
            session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
            if session:
                expires_at = session["expires_at"]
                if isinstance(expires_at, str):
                    expires_at = datetime.fromisoformat(expires_at)
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                if expires_at > datetime.now(timezone.utc):
                    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
                    return user
    return None

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(data: UserCreate):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(400, "Email ya registrado")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": data.email,
        "name": data.name,
        "password_hash": hash_password(data.password),
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_id, data.email)
    return {
        "token": token,
        "user": {"user_id": user_id, "email": data.email, "name": data.name, "picture": None}
    }

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(401, "Credenciales inválidas")
    token = create_token(user["user_id"], user["email"])
    return {
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "picture": user.get("picture")
        }
    }

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(401, "No autenticado")
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "picture": user.get("picture")
    }

# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
@api_router.post("/auth/session")
async def exchange_session(data: SessionRequest, response: Response):
    try:
        async with httpx.AsyncClient() as http_client:
            resp = await http_client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": data.session_id}
            )
            if resp.status_code != 200:
                raise HTTPException(400, "Sesión inválida")
            oauth_data = resp.json()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OAuth error: {e}")
        raise HTTPException(400, "Error de verificación")

    email = oauth_data["email"]
    name = oauth_data.get("name", "")
    picture = oauth_data.get("picture", "")
    session_token = oauth_data.get("session_token", "")

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"email": email}, {"$set": {"name": name, "picture": picture}})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id, "email": email, "name": name,
            "picture": picture, "created_at": datetime.now(timezone.utc).isoformat()
        })

    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    response.set_cookie(
        key="session_token", value=session_token,
        httponly=True, secure=True, samesite="none", path="/", max_age=7*24*60*60
    )
    return {"user_id": user_id, "email": email, "name": name, "picture": picture, "token": session_token}

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"message": "Sesión cerrada"}


# ==================== CART + WISHLIST MODELS ====================

# NOTE: We store display fields (name/price/image) in cart/wishlist docs to keep the current UI unchanged.

class CartItem(BaseModel):
    product_id: str
    name: str
    price: float
    image: str
    size: str = ""
    color: str = ""
    quantity: int = 1

class CartReplaceRequest(BaseModel):
    items: List[CartItem]

class CartMergeRequest(BaseModel):
    guest_items: List[CartItem]

class WishlistItem(BaseModel):
    product_id: str
    name: str
    price: float
    image: str
    gender: Optional[str] = None

class WishlistReplaceRequest(BaseModel):
    items: List[WishlistItem]

class WishlistMergeRequest(BaseModel):
    guest_items: List[WishlistItem]

# ==================== PRODUCTS ====================

@api_router.get("/products")
async def get_products(
    category: Optional[str] = None,
    gender: Optional[str] = None,
    sort: Optional[str] = None,
    search: Optional[str] = None,
    is_new: Optional[bool] = None,
    is_featured: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    collection: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    query = {}
    if category:
        query["category"] = category
    if gender:
        query["gender"] = {"$in": [gender, "unisex"]}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if is_new:
        query["is_new"] = True
    if is_featured:
        query["is_featured"] = True
    if collection:
        query["collections"] = collection
    if min_price or max_price:
        price_q = {}
        if min_price:
            price_q["$gte"] = min_price
        if max_price:
            price_q["$lte"] = max_price
        query["price"] = price_q

    sort_field = [("created_at", -1)]
    if sort == "price_asc":
        sort_field = [("price", 1)]
    elif sort == "price_desc":
        sort_field = [("price", -1)]
    elif sort == "name":
        sort_field = [("name", 1)]

    skip = (page - 1) * limit
    total = await db.products.count_documents(query)
    products = await db.products.find(query, {"_id": 0}).sort(sort_field).skip(skip).limit(limit).to_list(limit)
    return {"products": products, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(404, "Producto no encontrado")
    related = await db.products.find(
        {"category": {"$in": product.get("category", [])}, "product_id": {"$ne": product_id}}, {"_id": 0}
    ).limit(4).to_list(4)
    return {**product, "related_products": related}

@api_router.post("/products/replace")
async def replace_product(payload: Dict):
    """Admin helper (no auth) to replace one product_id with another.

    Expected payload:
    {
      "old_product_id": "sandalia-venus",
      "new_product": { ... full product doc ... }
    }
    """
    old_product_id = payload.get("old_product_id")
    new_product = payload.get("new_product")
    if not old_product_id or not new_product:
        raise HTTPException(400, "old_product_id y new_product son requeridos")

    new_id = new_product.get("product_id")
    if not new_id:
        raise HTTPException(400, "new_product.product_id es requerido")

    # Replace atomically: delete old, upsert new
    await db.products.delete_one({"product_id": old_product_id})
    await db.products.replace_one({"product_id": new_id}, new_product, upsert=True)
    return {"message": "ok", "deleted": old_product_id, "upserted": new_id}


# ==================== CHECKOUT ====================

@api_router.post("/checkout/create-session")
async def create_checkout_session(request: Request, data: CheckoutRequest):
    if not STRIPE_API_KEY:
        raise HTTPException(500, "Stripe no configurado")

    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest as StripeReq

    total = 0.0
    order_items = []
    for item in data.items:
        product = await db.products.find_one({"product_id": item["product_id"]}, {"_id": 0})
        if not product:
            raise HTTPException(400, f"Producto {item['product_id']} no encontrado")
        qty = item.get("quantity", 1)
        item_total = product["price"] * qty
        total += item_total
        order_items.append({
            "product_id": item["product_id"], "name": product["name"],
            "price": product["price"], "quantity": qty,
            "size": item.get("size", ""), "color": item.get("color", "")
        })

    user = await get_current_user(request)
    user_id = user["user_id"] if user else None

    origin = data.origin_url
    success_url = f"{origin}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/carrito"

    metadata = {"order_items_count": str(len(order_items)), "source": "tambvrini_web"}
    if user_id:
        metadata["user_id"] = user_id

    webhook_url = f"{str(request.base_url)}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)

    checkout_req = StripeReq(
        amount=float(total), currency="eur",
        success_url=success_url, cancel_url=cancel_url, metadata=metadata
    )
    session = await stripe_checkout.create_checkout_session(checkout_req)

    await db.payment_transactions.insert_one({
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "session_id": session.session_id,
        "user_id": user_id,
        "amount": total,
        "currency": "eur",
        "items": order_items,
        "payment_status": "initiated",
        "status": "pending",
        "metadata": metadata,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request):
    if not STRIPE_API_KEY:
        raise HTTPException(500, "Stripe no configurado")

    from emergentintegrations.payments.stripe.checkout import StripeCheckout

    webhook_url = f"{str(request.base_url)}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    status = await stripe_checkout.get_checkout_status(session_id)

    existing_paid = await db.payment_transactions.find_one(
        {"session_id": session_id, "payment_status": "paid"}
    )
    if not existing_paid:
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "payment_status": status.payment_status,
                "status": status.status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
        webhook_url = f"{str(request.base_url)}api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        if webhook_response.payment_status == "paid":
            existing = await db.payment_transactions.find_one(
                {"session_id": webhook_response.session_id, "payment_status": "paid"}
            )
            if not existing:
                await db.payment_transactions.update_one(
                    {"session_id": webhook_response.session_id},
                    {"$set": {
                        "payment_status": "paid",
                        "status": "complete",
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
    except Exception as e:
        logger.error(f"Webhook error: {e}")
    return {"status": "ok"}

# ==================== CART + WISHLIST ROUTES ====================

# Cart + wishlist items store display fields too (name/price/image) to keep UI unchanged.

def _merge_cart_items(existing: List[dict], guest: List[dict]) -> List[dict]:
    merged: Dict[str, dict] = {}

    def _key(item: dict) -> str:
        return f"{item.get('product_id','')}|{item.get('size','')}|{item.get('color','')}"

    for item in existing:
        k = _key(item)
        merged[k] = {
            "product_id": item.get("product_id", ""),
            "name": item.get("name", ""),
            "price": float(item.get("price", 0)),
            "image": item.get("image", ""),
            "size": item.get("size", ""),
            "color": item.get("color", ""),
            "quantity": int(item.get("quantity", 1)),
        }

    for item in guest:
        k = _key(item)
        if k in merged:
            merged[k]["quantity"] += int(item.get("quantity", 1))
        else:
            merged[k] = {
                "product_id": item.get("product_id", ""),
                "name": item.get("name", ""),
                "price": float(item.get("price", 0)),
                "image": item.get("image", ""),
                "size": item.get("size", ""),
                "color": item.get("color", ""),
                "quantity": int(item.get("quantity", 1)),
            }

    return list(merged.values())

@api_router.get("/cart")
async def get_cart(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(401, "No autenticado")
    doc = await db.carts.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return {"items": doc.get("items", []) if doc else []}

@api_router.put("/cart")
async def replace_cart(request: Request, data: CartReplaceRequest):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(401, "No autenticado")
    items = [i.model_dump() for i in data.items]
    await db.carts.update_one(
        {"user_id": user["user_id"]},
        {
            "$set": {
                "user_id": user["user_id"],
                "items": items,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            },
            "$setOnInsert": {"created_at": datetime.now(timezone.utc).isoformat()},
        },
        upsert=True,
    )
    return {"items": items}

@api_router.post("/cart/merge")
async def merge_cart(request: Request, data: CartMergeRequest):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(401, "No autenticado")
    existing = await db.carts.find_one({"user_id": user["user_id"]}, {"_id": 0})
    merged_items = _merge_cart_items(
        existing.get("items", []) if existing else [],
        [i.model_dump() for i in data.guest_items],
    )
    await db.carts.update_one(
        {"user_id": user["user_id"]},
        {
            "$set": {
                "user_id": user["user_id"],
                "items": merged_items,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            },
            "$setOnInsert": {"created_at": datetime.now(timezone.utc).isoformat()},
        },
        upsert=True,
    )
    return {"items": merged_items}

@api_router.get("/wishlist")
async def get_wishlist(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(401, "No autenticado")
    doc = await db.wishlists.find_one({"user_id": user["user_id"]}, {"_id": 0})
    return {"items": doc.get("items", []) if doc else []}

@api_router.put("/wishlist")
async def replace_wishlist(request: Request, data: WishlistReplaceRequest):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(401, "No autenticado")
    seen = set()
    items: List[dict] = []
    for it in data.items:
        if it.product_id in seen:
            continue
        seen.add(it.product_id)
        items.append(it.model_dump())

    await db.wishlists.update_one(
        {"user_id": user["user_id"]},
        {
            "$set": {
                "user_id": user["user_id"],
                "items": items,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            },
            "$setOnInsert": {"created_at": datetime.now(timezone.utc).isoformat()},
        },
        upsert=True,
    )
    return {"items": items}

@api_router.post("/wishlist/merge")
async def merge_wishlist(request: Request, data: WishlistMergeRequest):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(401, "No autenticado")
    existing = await db.wishlists.find_one({"user_id": user["user_id"]}, {"_id": 0})
    merged: Dict[str, dict] = {}
    for it in (existing.get("items", []) if existing else []):
        merged[it.get("product_id", "")] = it
    for it in [i.model_dump() for i in data.guest_items]:
        pid = it.get("product_id", "")
        if pid and pid not in merged:
            merged[pid] = it

    items = list(merged.values())
    await db.wishlists.update_one(
        {"user_id": user["user_id"]},
        {
            "$set": {
                "user_id": user["user_id"],
                "items": items,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            },
            "$setOnInsert": {"created_at": datetime.now(timezone.utc).isoformat()},
        },
        upsert=True,
    )
    return {"items": items}

# ==================== NEWSLETTER ====================

@api_router.post("/newsletter/subscribe")
async def subscribe_newsletter(data: NewsletterRequest):
    existing = await db.newsletter.find_one({"email": data.email})
    if existing:
        return {"message": "Ya estás suscrito", "status": "already_subscribed"}
    await db.newsletter.insert_one({
        "email": data.email,
        "subscribed_at": datetime.now(timezone.utc).isoformat()
    })
    return {"message": "Bienvenido a la Casa TAMBVRINI", "status": "subscribed"}

# ==================== SEED DATA ====================

SEED_PRODUCTS = [
    {
        "product_id": "polo-roma",
        "name": "Polo Roma",
        "description": "Polo de piqué de algodón premium con bordado del escudo Tennis Club. Inspirado en los clubes de tenis de la Roma clásica, esta pieza combina la elegancia deportiva con el lujo mediterráneo.",
        "price": 395.00,
        "currency": "EUR",
        "images": [
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
            "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80"
        ],
        "category": ["novedades", "tennis-club"],
        "gender": "hombre",
        "sizes": ["S", "M", "L", "XL"],
        "colors": [{"name": "Marfil", "hex": "#F5F5F0"}, {"name": "Verde Bosque", "hex": "#1B4D3E"}],
        "composition": "100% Algodón Piqué Egipcio",
        "care": "Lavado a máquina 30°. No usar secadora.",
        "is_new": True,
        "is_featured": True,
        "collections": ["tennis-club", "resort-2026"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "blazer-hispania",
        "name": "Blazer Hispania",
        "description": "Blazer de lino italiano desestructurado con forro de seda. Cortado en Nápoles siguiendo la tradición sartorial mediterránea. Una pieza atemporal para el caballero moderno.",
        "price": 1250.00,
        "currency": "EUR",
        "images": [
            "https://images.unsplash.com/photo-1638908220035-a011183f43f0?w=800&q=80",
            "https://images.unsplash.com/photo-1644084947842-248e0fc0a8ab?w=800&q=80"
        ],
        "category": ["novedades", "resort"],
        "gender": "hombre",
        "sizes": ["46", "48", "50", "52", "54"],
        "colors": [{"name": "Negro", "hex": "#0A0A0A"}, {"name": "Azul Noche", "hex": "#1a1a2e"}],
        "composition": "100% Lino Italiano. Forro: 100% Seda",
        "care": "Solo limpieza en seco",
        "is_new": True,
        "is_featured": True,
        "collections": ["resort-2026", "roma"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "camisa-augusto",
        "name": "Camisa Augusto",
        "description": "Camisa de popelín de algodón con cuello italiano y puños franceses. Confeccionada artesanalmente en talleres de Milán. El epítome de la elegancia clásica.",
        "price": 485.00,
        "currency": "EUR",
        "images": [
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80",
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80"
        ],
        "category": ["novedades"],
        "gender": "hombre",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "colors": [{"name": "Blanco", "hex": "#FFFFFF"}, {"name": "Celeste", "hex": "#B0C4DE"}],
        "composition": "100% Algodón Popelín Sea Island",
        "care": "Lavado a mano. Planchar a temperatura media.",
        "is_new": False,
        "is_featured": False,
        "collections": ["roma", "atelier"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "pantalon-riviera",
        "name": "Pantalón Riviera",
        "description": "Pantalón de lino con pinzas y cintura alta. Diseñado para las tardes en la Riviera, esta pieza evoca la elegancia despreocupada de los años 70.",
        "price": 595.00,
        "currency": "EUR",
        "images": [
            "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
            "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80"
        ],
        "category": ["resort"],
        "gender": "hombre",
        "sizes": ["44", "46", "48", "50", "52"],
        "colors": [{"name": "Arena", "hex": "#C2B280"}, {"name": "Marfil", "hex": "#F5F5F0"}],
        "composition": "100% Lino Premium",
        "care": "Lavado a máquina delicado. Secar al aire.",
        "is_new": False,
        "is_featured": True,
        "collections": ["resort-2026"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "chaqueta-montecarlo",
        "name": "Chaqueta Montecarlo",
        "description": "Chaqueta de verano en gabardina de algodón con botones de nácar. Inspirada en el glamour de Montecarlo, perfecta para noches mediterráneas.",
        "price": 1495.00,
        "currency": "EUR",
        "images": [
            "https://images.unsplash.com/photo-1732842430197-0ecd55fe98ea?w=800&q=80",
            "https://images.unsplash.com/photo-1693071093573-9e8e342aebeb?w=800&q=80"
        ],
        "category": ["novedades", "resort"],
        "gender": "hombre",
        "sizes": ["46", "48", "50", "52"],
        "colors": [{"name": "Beige", "hex": "#D2B48C"}, {"name": "Blanco Roto", "hex": "#FAF0E6"}],
        "composition": "100% Algodón Gabardina. Forro: Cupro",
        "care": "Solo limpieza en seco",
        "is_new": True,
        "is_featured": True,
        "collections": ["resort-2026", "limited"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "vestido-atenea",
        "name": "Vestido Atenea",
        "description": "Vestido largo de seda con drapeado inspirado en las túnicas grecorromanas. Una pieza de alta costura que celebra la feminidad clásica.",
        "price": 1890.00,
        "currency": "EUR",
        "images": [
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
            "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80"
        ],
        "category": ["novedades"],
        "gender": "mujer",
        "sizes": ["34", "36", "38", "40", "42"],
        "colors": [{"name": "Dorado", "hex": "#C5A059"}, {"name": "Champán", "hex": "#F7E7CE"}],
        "composition": "100% Seda Natural",
        "care": "Solo limpieza en seco",
        "is_new": True,
        "is_featured": True,
        "collections": ["roma", "atelier", "limited"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "blusa-sicilia",
        "name": "Blusa Sicilia",
        "description": "Blusa de seda con estampado floral mediterráneo, inspirada en los jardines de Sicilia. Acabado artesanal con botones forrados.",
        "price": 685.00,
        "currency": "EUR",
        "images": [
            "https://images.unsplash.com/photo-1765269303556-b53ff8bd8a8a?w=800&q=80",
            "https://images.unsplash.com/photo-1627910002409-b90bb356ff4e?w=800&q=80"
        ],
        "category": ["novedades", "resort"],
        "gender": "mujer",
        "sizes": ["XS", "S", "M", "L"],
        "colors": [{"name": "Estampado Floral", "hex": "#2E8B57"}, {"name": "Marfil", "hex": "#F5F5F0"}],
        "composition": "100% Seda de Morera",
        "care": "Lavado a mano con agua fría",
        "is_new": True,
        "is_featured": False,
        "collections": ["resort-2026"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "falda-olimpia",
        "name": "Falda Olimpia",
        "description": "Falda midi plisada de crepé con cintura alta y caída fluida. Una pieza versátil que rinde homenaje a la gracia de las musas olímpicas.",
        "price": 745.00,
        "currency": "EUR",
        "images": [
            "https://images.unsplash.com/photo-1656383118558-686bfb79b5ae?w=800&q=80",
            "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80"
        ],
        "category": ["novedades"],
        "gender": "mujer",
        "sizes": ["34", "36", "38", "40", "42"],
        "colors": [{"name": "Blanco", "hex": "#FFFFFF"}, {"name": "Negro", "hex": "#0A0A0A"}],
        "composition": "100% Crepé de Seda",
        "care": "Solo limpieza en seco",
        "is_new": False,
        "is_featured": True,
        "collections": ["roma"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "vestido-amalfi",
        "name": "Vestido Amalfi",
        "description": "Vestido de verano en lino ligero con escote cruzado. Evoca las puestas de sol en la Costa Amalfitana. Perfecto para la temporada de resort.",
        "price": 1350.00,
        "currency": "EUR",
        "images": [
            "https://images.unsplash.com/photo-1661340686159-6a64eb997298?w=800&q=80",
            "https://images.pexels.com/photos/15011406/pexels-photo-15011406.jpeg?auto=compress&cs=tinysrgb&w=800"
        ],
        "category": ["resort"],
        "gender": "mujer",
        "sizes": ["34", "36", "38", "40"],
        "colors": [{"name": "Terracota", "hex": "#A0522D"}, {"name": "Coral", "hex": "#FF7F50"}],
        "composition": "100% Lino Orgánico",
        "care": "Lavado a mano. Secar al aire.",
        "is_new": True,
        "is_featured": False,
        "collections": ["resort-2026"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "bolso-colosseum",
        "name": "Bolso Colosseum",
        "description": "Bolso tote de piel de becerro con acabado semi-mate y herrajes en oro antiguo. Fabricado artesanalmente en talleres de Florencia.",
        "price": 2150.00,
        "currency": "EUR",
        "images": [
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80"
        ],
        "category": ["accesorios", "marroquineria"],
        "gender": "unisex",
        "sizes": ["Único"],
        "colors": [{"name": "Cognac", "hex": "#834A22"}, {"name": "Negro", "hex": "#0A0A0A"}],
        "composition": "Piel de Becerro. Interior: Ante",
        "care": "Limpiar con paño suave. Almacenar en bolsa de algodón.",
        "is_new": True,
        "is_featured": True,
        "collections": ["roma", "limited"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "panuelo-mediterraneo",
        "name": "Pañuelo Mediterráneo",
        "description": "Pañuelo de seda con estampado exclusivo inspirado en los mosaicos romanos. Impreso a mano en Como, Italia.",
        "price": 385.00,
        "currency": "EUR",
        "images": [
            "https://images.unsplash.com/photo-1677779817420-b3ad7a4a1f2c?w=800&q=80",
            "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80"
        ],
        "category": ["accesorios"],
        "gender": "unisex",
        "sizes": ["70x70 cm", "90x90 cm"],
        "colors": [{"name": "Oro/Verde", "hex": "#C5A059"}, {"name": "Azul/Marfil", "hex": "#4169E1"}],
        "composition": "100% Seda Twill",
        "care": "Solo limpieza en seco",
        "is_new": False,
        "is_featured": False,
        "collections": ["roma"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "gafas-riviera",
        "name": "Gafas Riviera",
        "description": "Gafas de sol con montura de acetato italiano y lentes polarizadas. Diseño inspirado en los iconos del estilo europeo de los años 70.",
        "price": 395.00,
        "currency": "EUR",
        "images": [
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80"
        ],
        "category": ["accesorios"],
        "gender": "unisex",
        "sizes": ["Único"],
        "colors": [{"name": "Carey", "hex": "#8B4513"}, {"name": "Negro", "hex": "#0A0A0A"}],
        "composition": "Acetato Italiano. Lentes: CR39 Polarizadas",
        "care": "Limpiar con gamuza incluida. Almacenar en estuche.",
        "is_new": True,
        "is_featured": False,
        "collections": ["resort-2026"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "cinturon-centurion",
        "name": "Cinturón Centurión",
        "description": "Cinturón de piel de cocodrilo con hebilla artesanal en latón antiguo. Cada pieza es única, elaborada por maestros artesanos.",
        "price": 445.00,
        "currency": "EUR",
        "images": [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
            "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80"
        ],
        "category": ["accesorios", "marroquineria"],
        "gender": "hombre",
        "sizes": ["85", "90", "95", "100", "105"],
        "colors": [{"name": "Marrón Oscuro", "hex": "#3E2723"}, {"name": "Negro", "hex": "#0A0A0A"}],
        "composition": "Piel de Cocodrilo. Hebilla: Latón",
        "care": "Tratar con crema para piel exótica.",
        "is_new": False,
        "is_featured": False,
        "collections": ["roma", "atelier"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "mocasin-augustus",
        "name": "Mocasín Augustus",
        "description": "Mocasín de piel de becerro con suela de cuero cosida a mano Goodyear. La máxima expresión del calzado artesanal italiano.",
        "price": 895.00,
        "currency": "EUR",
        "images": [
            "https://images.unsplash.com/photo-1760616172899-0681b97a2de3?w=800&q=80",
            "https://images.unsplash.com/photo-1653868250450-b83e6263d427?w=800&q=80"
        ],
        "category": ["calzado"],
        "gender": "hombre",
        "sizes": ["39", "40", "41", "42", "43", "44", "45"],
        "colors": [{"name": "Negro", "hex": "#0A0A0A"}, {"name": "Cognac", "hex": "#834A22"}],
        "composition": "Exterior: Piel de Becerro. Suela: Cuero",
        "care": "Usar hormas de cedro. Aplicar crema nutritiva regularmente.",
        "is_new": True,
        "is_featured": True,
        "collections": ["roma", "atelier"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "traje-monograma-tambvrini",
        "name": "Traje Monograma Tambvrini",
        "description": "Set de traje Tambvrini con bordado monograma romano integral. Sastrería contemporánea de inspiración italiana con silueta elegante y estructura ligera.",
        "price": 399.00,
        "currency": "EUR",
        "images": [
            "https://customer-assets.emergentagent.com/job_8de41a80-b224-42fd-8fc4-51d1d3d41b34/artifacts/j8yehypp_hf_20260208_220603_61c0624c-085d-470b-9e36-3b1d627c6093.jpeg",
            "https://customer-assets.emergentagent.com/job_8de41a80-b224-42fd-8fc4-51d1d3d41b34/artifacts/13w6alad_hf_20260208_221349_74b1b08f-1ec5-41f5-bf8f-915f5855630a.jpeg",
            "https://customer-assets.emergentagent.com/job_8de41a80-b224-42fd-8fc4-51d1d3d41b34/artifacts/f0lyuia5_hf_20260208_222545_269ad1ab-bb74-4e4a-b589-045346511340.jpeg",
            "https://customer-assets.emergentagent.com/job_8de41a80-b224-42fd-8fc4-51d1d3d41b34/artifacts/5jns2eeo_hf_20260208_221348_52bbd817-b422-409d-a7ef-5348747545fa.png",
            "https://customer-assets.emergentagent.com/job_8de41a80-b224-42fd-8fc4-51d1d3d41b34/artifacts/4zxsm680_hf_20260208_222552_13824fcc-dd57-4738-a486-3b9513d40709.png"
        ],
        "category": ["sastrería", "set"],
        "gender": "unisex",
        "sizes": ["S", "M", "L", "XL"],
        "colors": [{"name": "Blanco", "hex": "#FFFFFF"}],
        "composition": "Algodón premium jacquard con monograma bordado. Forro interior de viscosa suave. Botones nacarados tono marfil.",
        "care": "Limpieza en seco. Planchar a baja temperatura con paño.",
        "is_new": True,
        "is_featured": True,
        "is_sold_out": True,
        "collections": ["drop"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "top-tennis-club",
        "name": "Top Tennis Club",
        "description": "Top deportivo de punto fino con el monograma TAMBVRINI bordado. Diseñado para el rendimiento en pista con la estética de un club privado.",
        "price": 345.00,
        "currency": "EUR",
        "images": [
            "https://images.unsplash.com/photo-1646649851780-d9701b7c3c04?w=800&q=80",
            "https://images.unsplash.com/photo-1737231808355-bd79f733e670?w=800&q=80"
        ],
        "category": ["tennis-club", "novedades"],
        "gender": "mujer",
        "sizes": ["XS", "S", "M", "L"],
        "colors": [{"name": "Blanco", "hex": "#FFFFFF"}, {"name": "Verde Club", "hex": "#1B4D3E"}],
        "composition": "95% Algodón Orgánico, 5% Elastano",
        "care": "Lavado a máquina 30°",
        "is_new": True,
        "is_featured": True,
        "collections": ["tennis-club"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]

@api_router.post("/seed")
async def seed_products():
    count = await db.products.count_documents({})
    if count > 0:
        return {"message": "Productos ya cargados", "count": count}
    for p in SEED_PRODUCTS:
        await db.products.insert_one(p)
    return {"message": f"Cargados {len(SEED_PRODUCTS)} productos"}

# ==================== STARTUP ====================

@app.on_event("startup")
async def startup():
    count = await db.products.count_documents({})
    if count == 0:
        for p in SEED_PRODUCTS:
            await db.products.insert_one(dict(p))
        logger.info(f"Seeded {len(SEED_PRODUCTS)} products")
    await db.users.create_index("email", unique=True, sparse=True)
    await db.products.create_index("product_id", unique=True)
    await db.products.create_index("category")
    await db.products.create_index("gender")

app.include_router(api_router)

# ==================== CORS ====================
# NOTE: When allow_credentials=True, the CORS response cannot use '*' as Access-Control-Allow-Origin.
# If CORS_ORIGINS is set to '*', we switch to allow_origin_regex so Starlette echoes back the request Origin.
cors_origins = [o.strip() for o in os.environ.get('CORS_ORIGINS', '*').split(',') if o.strip()]
allow_origin_regex = None
allow_origins = cors_origins
if '*' in cors_origins:
    allow_origins = []
    allow_origin_regex = r".*"

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allow_origins,
    allow_origin_regex=allow_origin_regex,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
