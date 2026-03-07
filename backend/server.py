from fastapi import FastAPI, APIRouter, HTTPException, Response, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import bcrypt
import jwt
import stripe
from datetime import datetime, timezone, timedelta
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional, Dict
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value

mongo_url = require_env('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[require_env('DB_NAME')]

JWT_SECRET = require_env('JWT_SECRET')
STRIPE_API_KEY = require_env('STRIPE_API_KEY')
STRIPE_WEBHOOK_SECRET = require_env("STRIPE_WEBHOOK_SECRET")
CORS_ORIGINS = require_env('CORS_ORIGINS')
ASSET_BASE_URL = require_env("ASSET_BASE_URL").rstrip("/")
LEGACY_ASSET_BASE_URL = os.environ.get("LEGACY_ASSET_BASE_URL", "").rstrip("/")
GOOGLE_CLIENT_ID = require_env("GOOGLE_CLIENT_ID")
MIN_GOOGLE_TOKEN_TTL_SECONDS = 60
GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"

def resolve_asset_url(url: str) -> str:
    if LEGACY_ASSET_BASE_URL and url.startswith(f"{LEGACY_ASSET_BASE_URL}/"):
        return f"{ASSET_BASE_URL}{url[len(LEGACY_ASSET_BASE_URL):]}"
    return url

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

class GoogleAuthRequest(BaseModel):
    id_token: str

class CheckoutRequest(BaseModel):
    items: List[Dict]
    origin_url: str

class NewsletterRequest(BaseModel):
    email: str

# ==================== AUTH HELPERS ====================

@api_router.get("/health")
async def health():
    """Simple API health check for deployment and monitoring."""
    return {"status": "ok"}

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

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"message": "Sesión cerrada"}

@api_router.post("/auth/google")
async def login_with_google(data: GoogleAuthRequest):
    id_token = data.id_token.strip()
    if not id_token:
        raise HTTPException(400, "Token inválido")
    async with httpx.AsyncClient(timeout=10.0) as client:
        token_info_response = await client.get(
            GOOGLE_TOKENINFO_URL,
            params={"id_token": id_token}
        )
        if token_info_response.status_code != 200:
            raise HTTPException(401, "Token de Google inválido")
        token_info = token_info_response.json()
        audience = token_info.get("aud") or token_info.get("audience")
        if audience != GOOGLE_CLIENT_ID:
            raise HTTPException(401, "Token de Google no corresponde al cliente")
        try:
            exp_timestamp = float(token_info.get("exp", 0))
        except (TypeError, ValueError) as exc:
            logger.warning(
                "Invalid exp from Google token info (%s): %s.",
                token_info.get("exp"),
                exc
            )
            exp_timestamp = 0
        seconds_until_expiration = exp_timestamp - datetime.now(timezone.utc).timestamp()
        if seconds_until_expiration < MIN_GOOGLE_TOKEN_TTL_SECONDS:
            raise HTTPException(401, "Token de Google inválido o expirado")
    email = token_info.get("email")
    if not email:
        raise HTTPException(400, "Email no disponible")
    email_verified = token_info.get("email_verified")
    # Token info may return email_verified as boolean or "true" string; handle both defensively.
    is_email_verified = email_verified is True or (
        isinstance(email_verified, str) and email_verified.lower() == "true"
    )
    if not is_email_verified:
        raise HTTPException(401, "Email no verificado")
    google_sub = token_info.get("sub")
    name = token_info.get("name") or email
    picture = token_info.get("picture")

    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "password_hash": None,
            "picture": picture,
            "google_sub": google_sub,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        user = user_doc
    else:
        updates = {}
        if google_sub is not None and user.get("google_sub") != google_sub:
            updates["google_sub"] = google_sub
        if picture is not None and user.get("picture") != picture:
            updates["picture"] = picture
        if not user.get("name") and name is not None and user.get("name") != name:
            updates["name"] = name
        if updates:
            await db.users.update_one({"user_id": user["user_id"]}, {"$set": updates})
            user.update(updates)

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
        if category == "2026":
            query["product_id"] = {
                "$in": ["camiseta-sport-club", "polo-golf", "sueter-captain"]
            }
        elif category == "sueteres":
            query["category"] = "knitwear"
        else:
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

    total = 0.0
    order_items = []
    line_items = []
    for item in data.items:
        product = await db.products.find_one({"product_id": item["product_id"]}, {"_id": 0})
        if not product:
            raise HTTPException(400, f"Producto {item['product_id']} no encontrado")
        qty = item.get("quantity", 1)
        item_total = product["price"] * qty
        total += item_total
        size = item.get("size", "")
        color = item.get("color", "")
        description_parts = []
        if size:
            description_parts.append(f"Talla {size}")
        if color:
            description_parts.append(f"Color {color}")
        product_data = {"name": product["name"]}
        if description_parts:
            product_data["description"] = " · ".join(description_parts)
        line_items.append({
            "price_data": {
                "currency": "eur",
                "product_data": product_data,
                "unit_amount": int(product["price"] * 100)
            },
            "quantity": qty
        })
        order_items.append({
            "product_id": item["product_id"], "name": product["name"],
            "price": product["price"], "quantity": qty,
            "size": size, "color": color
        })

    user = await get_current_user(request)
    if not user:
        raise HTTPException(401, "Debes iniciar sesión para pagar")
    user_id = user["user_id"]

    origin = data.origin_url
    success_url = f"{origin}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/carrito"

    metadata = {"order_items_count": str(len(order_items)), "source": "tambvrini_web"}
    if user_id:
        metadata["user_id"] = user_id

    stripe.api_key = STRIPE_API_KEY

    shipping_address_collection = {
        "allowed_countries": ["ES"]
    }
    standard_amount = 0 if total >= 75 else 499
    shipping_options = [
        {
            "shipping_rate_data": {
                "type": "fixed_amount",
                "fixed_amount": {"amount": standard_amount, "currency": "eur"},
                "display_name": "Envío estándar",
                "delivery_estimate": {
                    "minimum": {"unit": "business_day", "value": 2},
                    "maximum": {"unit": "business_day", "value": 4}
                }
            }
        },
        {
            "shipping_rate_data": {
                "type": "fixed_amount",
                "fixed_amount": {"amount": 799, "currency": "eur"},
                "display_name": "Envío exprés",
                "delivery_estimate": {
                    "minimum": {"unit": "business_day", "value": 1},
                    "maximum": {"unit": "business_day", "value": 2}
                }
            }
        }
    ]

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=line_items,
        mode="payment",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
        shipping_address_collection=shipping_address_collection,
        shipping_options=shipping_options
    )

    await db.payment_transactions.insert_one({
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "session_id": session.id,
        "user_id": user_id,
        "amount": total,
        "currency": "eur",
        "items": order_items,
        "payment_status": "initiated",
        "status": "pending",
        "metadata": metadata,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"url": session.url, "session_id": session.id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str):
    if not STRIPE_API_KEY:
        raise HTTPException(500, "Stripe no configurado")

    stripe.api_key = STRIPE_API_KEY
    session = stripe.checkout.Session.retrieve(session_id)
    payment_status = session.get("payment_status")
    status = "complete" if payment_status == "paid" else "pending"

    existing_paid = await db.payment_transactions.find_one(
        {"session_id": session_id, "payment_status": "paid"}
    )
    if not existing_paid:
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "payment_status": payment_status,
                "status": status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    return {
        "status": status,
        "payment_status": payment_status,
        "amount_total": session.get("amount_total"),
        "currency": session.get("currency")
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    if not STRIPE_API_KEY:
        raise HTTPException(500, "Stripe no configurado")

    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    stripe.api_key = STRIPE_API_KEY
    try:
        event = stripe.Webhook.construct_event(body, signature, STRIPE_WEBHOOK_SECRET)

        if event.get("type") == "checkout.session.completed":
            session_data = event.get("data", {}).get("object", {})
            session_id = session_data.get("id")
            if not session_id:
                return {"status": "ok"}
            existing = await db.payment_transactions.find_one(
                {"session_id": session_id, "payment_status": "paid"}
            )
            if not existing:
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
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
    # ── Real products with Emergent asset URLs ──
    {
        "product_id": "traje-monograma-tambvrini",
        "name": "Traje Monograma Tambvrini",
        "description": "Set de traje Tambvrini con bordado monograma romano integral. Sastrería contemporánea de inspiración italiana con silueta elegante y estructura ligera.",
        "price": 399.00,
        "currency": "EUR",
        "images": [
            f"{ASSET_BASE_URL}/job_8de41a80-b224-42fd-8fc4-51d1d3d41b34/artifacts/j8yehypp_hf_20260208_220603_61c0624c-085d-470b-9e36-3b1d627c6093.jpeg",
            f"{ASSET_BASE_URL}/job_8de41a80-b224-42fd-8fc4-51d1d3d41b34/artifacts/4zxsm680_hf_20260208_222552_13824fcc-dd57-4738-a486-3b9513d40709.png",
            f"{ASSET_BASE_URL}/job_8de41a80-b224-42fd-8fc4-51d1d3d41b34/artifacts/f0lyuia5_hf_20260208_222545_269ad1ab-bb74-4e4a-b589-045346511340.jpeg",
            f"{ASSET_BASE_URL}/job_8de41a80-b224-42fd-8fc4-51d1d3d41b34/artifacts/qhsouwh0_hf_20260208_224916_24111877-953c-44b9-a4bc-ae56ca0ce547.jpeg",
            f"{ASSET_BASE_URL}/job_8de41a80-b224-42fd-8fc4-51d1d3d41b34/artifacts/5jns2eeo_hf_20260208_221348_52bbd817-b422-409d-a7ef-5348747545fa.png",
            f"{ASSET_BASE_URL}/job_8de41a80-b224-42fd-8fc4-51d1d3d41b34/artifacts/13w6alad_hf_20260208_221349_74b1b08f-1ec5-41f5-bf8f-915f5855630a.jpeg",
            f"{ASSET_BASE_URL}/job_8de41a80-b224-42fd-8fc4-51d1d3d41b34/artifacts/m52og20p_hf_20260208_234900_3f14961d-1c72-4047-86f4-58b0ebda6f0c%20%282%29.png"
        ],
        "thumbnail_image": f"{ASSET_BASE_URL}/job_8de41a80-b224-42fd-8fc4-51d1d3d41b34/artifacts/m52og20p_hf_20260208_234900_3f14961d-1c72-4047-86f4-58b0ebda6f0c%20%282%29.png",
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
        "product_id": "bolso-monograma-tambvrini",
        "name": "Bolso Monograma Tambvrini",
        "description": "El Bolso Monograma Tambvrini representa la visión contemporánea del lujo clásico de la casa.\nUna pieza diseñada para viajes elegantes y uso diario refinado, donde el equilibrio entre estructura, textura y detalles define su carácter.\n\nSu silueta arquitectónica se combina con un lienzo monograma exclusivo y bandas centrales en tonos pastel que aportan identidad visual distintiva. Cada elemento ha sido pensado para transmitir presencia, sofisticación y durabilidad.\n\nDiseñado para acompañar movimiento, viajes y estilo con una estética limpia y atemporal.",
        "price": 299.00,
        "currency": "EUR",
        "images": [
            f"{ASSET_BASE_URL}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/u6zqjmsq_3.png",
            f"{ASSET_BASE_URL}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/y7v5nwm1_2.png",
            f"{ASSET_BASE_URL}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/q6ej9bx3_hf_20260209_005423_81aed519-78ff-4ad0-a98c-31ded5afb2f1.png",
            f"{ASSET_BASE_URL}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/xyu4i868_1.jpeg",
            f"{ASSET_BASE_URL}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/qt1e9qlx_hf_20260210_013900_45cb2e8a-fe02-498b-826c-fa5c03b904e1.png",
            f"{ASSET_BASE_URL}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/gfxx8pdm_4.png",
            f"{ASSET_BASE_URL}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/ahyaof7a_5.png"
        ],
        "thumbnail_image": f"{ASSET_BASE_URL}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/xyu4i868_1.jpeg",
        "category": ["accesorios", "marroquineria"],
        "gender": "unisex",
        "sizes": ["Única"],
        "colors": [{"name": "Beige / Blanco", "hex": "#E7DDCF"}],
        "composition": "Canvas premium monogramado de alta resistencia\nDetalles en piel tratada\nHerrajes metálicos dorados\nCremalleras reforzadas\nInterior textil de alta durabilidad\n\nHecho para mantener estructura y elegancia con el uso.",
        "care": "Limpiar con paño suave. Almacenar en bolsa de algodón.",
        "is_new": True,
        "is_featured": False,
        "collections": ["roma", "limited"],
        "is_sold_out": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "camiseta-sport-club",
        "name": "Camiseta Sport Club",
        "description": "Camiseta Sport Club de inspiración europea clásica.\nAlgodón premium de alto gramaje con caída estructurada y tacto suave.\n\nDiseño minimalista frontal con emblema romano y gráfica trasera de gran formato estilo sport club europeo.\nPensada para un equilibrio entre lujo relajado, estética deportiva y cultura contemporánea.\n\nAjuste regular elegante.\nFabricación premium.\nUso diario o editorial.\n\nComposición:\n100% algodón premium pesado.\n\nFit: regular luxury fit.",
        "price": 895.00,
        "currency": "EUR",
        "images": [
            f"{ASSET_BASE_URL}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/79qq3jhd_hf_20260212_010716_e54abf26-8fbd-407b-a1a1-d841e2e3946d.png",
            f"{ASSET_BASE_URL}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/4qb570r6_hf_20260212_010024_44d8a05a-42ab-47b3-8108-336617ff9a07.jpeg",
            f"{ASSET_BASE_URL}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/fj5208jf_hf_20260212_010238_58178657-ba5a-4aea-a92b-7d3895ba334b.png",
            f"{ASSET_BASE_URL}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/6nqsv06s_hf_20260212_005309_5351456d-b40e-4e56-a6ba-4aefda582ec8.png",
            f"{ASSET_BASE_URL}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/kuf48n49_hf_20260212_005319_45c4a329-ec62-4e20-848f-4fe0d03812b2.jpeg",
            f"{ASSET_BASE_URL}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/fhe2l2xc_hf_20260212_010115_9a4c25de-deef-4847-892e-b4dc16d78ba0.png",
            f"{ASSET_BASE_URL}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/qjdgn1uj_hf_20260212_001854_d4114cf5-7dca-411a-a8b3-046e68c293e6.png",
            f"{ASSET_BASE_URL}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/7bb8vczl_hf_20260212_000927_165fb028-8aab-48b4-80af-974531a1f414.jpeg"
        ],
        "thumbnail_image": f"{ASSET_BASE_URL}/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/79qq3jhd_hf_20260212_010716_e54abf26-8fbd-407b-a1a1-d841e2e3946d.png",
        "category": ["camisetas", "apparel"],
        "gender": "unisex",
        "sizes": ["S", "M", "L", "XL"],
        "colors": [{"name": "Azul marino", "hex": "#0B1B3A"}],
        "composition": "100% algodón premium pesado.",
        "care": "Lavado a máquina 30° del revés. No usar secadora.",
        "is_new": True,
        "is_featured": True,
        "collections": ["sport-club"],
        "seo_title": "Camiseta Sport Club Azul Marino | Tamburini",
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    # ── Products recovered from frontend references (images were only in MongoDB) ──
    {
        "product_id": "polo-golf",
        "name": "Polo Golf",
        "description": "Polo Golf de la colección Sport Club 2026. Algodón premium con bordado del escudo Sport Club. Estética deportiva europea con acabado de lujo.",
        "price": 895.00,
        "currency": "EUR",
        "images": [],
        "category": ["polos", "apparel"],
        "gender": "hombre",
        "sizes": ["S", "M", "L", "XL"],
        "colors": [{"name": "Blanco", "hex": "#FFFFFF"}],
        "composition": "100% Algodón Piqué Premium",
        "care": "Lavado a máquina 30°. No usar secadora.",
        "is_new": True,
        "is_featured": True,
        "sold_out_sizes": ["L"],
        "collections": ["sport-club"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "sueter-captain",
        "name": "Suéter Captain",
        "description": "Suéter Captain de la colección Sport Club 2026. Punto fino premium con bordado del escudo Sport Club. Diseñado para el rendimiento con estética de club privado europeo.",
        "price": 895.00,
        "currency": "EUR",
        "images": [],
        "category": ["knitwear", "apparel"],
        "gender": "hombre",
        "sizes": ["S", "M", "L", "XL"],
        "colors": [{"name": "Azul marino", "hex": "#0B1B3A"}],
        "composition": "100% Algodón Premium",
        "care": "Lavado a máquina 30° del revés. No usar secadora.",
        "is_new": True,
        "is_featured": True,
        "collections": ["sport-club"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "polo-aureus",
        "name": "Polo Aureus",
        "description": "Polo Aureus de algodón premium con acabado de lujo. Una pieza atemporal que combina la elegancia deportiva con el refinamiento mediterráneo.",
        "price": 49.99,
        "currency": "EUR",
        "images": [],
        "category": ["polos", "apparel"],
        "gender": "hombre",
        "sizes": ["XS", "S", "M", "L", "XL"],
        "colors": [{"name": "Blanco", "hex": "#FFFFFF"}],
        "composition": "100% Algodón Premium",
        "care": "Lavado a máquina 30°. No usar secadora.",
        "is_new": True,
        "is_featured": True,
        "sold_out_sizes": ["XS", "S", "L", "XL"],
        "collections": ["roma"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "camiseta-imperium",
        "name": "Camiseta Imperium",
        "description": "Camiseta Imperium de algodón premium con diseño editorial. Inspiración clásica romana con acabado contemporáneo de lujo.",
        "price": 895.00,
        "currency": "EUR",
        "images": [],
        "category": ["camisetas", "apparel"],
        "gender": "mujer",
        "sizes": ["XS", "S", "M", "L"],
        "colors": [{"name": "Negro", "hex": "#0A0A0A"}],
        "composition": "100% Algodón Premium",
        "care": "Lavado a máquina 30° del revés. No usar secadora.",
        "is_new": True,
        "is_featured": True,
        "collections": ["roma"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "americana-umbra",
        "name": "Americana UMBRA",
        "description": "Americana UMBRA de sastrería contemporánea. Silueta elegante con estructura ligera e inspiración clásica mediterránea.",
        "price": 1250.00,
        "currency": "EUR",
        "images": [],
        "category": ["sastrería", "apparel"],
        "gender": "mujer",
        "sizes": ["S", "M", "L", "XL"],
        "colors": [{"name": "Negro", "hex": "#0A0A0A"}],
        "composition": "Lana premium. Forro: Viscosa",
        "care": "Solo limpieza en seco",
        "is_new": True,
        "is_featured": True,
        "sold_out_sizes": ["M", "L", "XL"],
        "collections": ["roma"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "polo-domus",
        "name": "Polo Domus",
        "description": "Polo Domus de algodón premium con bordado exclusivo. Estética de club privado europeo con acabado de lujo contemporáneo.",
        "price": 895.00,
        "currency": "EUR",
        "images": [],
        "category": ["polos", "apparel"],
        "gender": "hombre",
        "sizes": ["S", "M", "L", "XL"],
        "colors": [{"name": "Blanco", "hex": "#FFFFFF"}],
        "composition": "100% Algodón Piqué Premium",
        "care": "Lavado a máquina 30°. No usar secadora.",
        "is_new": True,
        "is_featured": True,
        "collections": ["roma"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "sueter-sylva",
        "name": "Suéter Sylva",
        "description": "Suéter Sylva de punto fino premium. Diseño elegante con acabado de lujo y estética de club privado europeo.",
        "price": 895.00,
        "currency": "EUR",
        "images": [],
        "category": ["knitwear", "apparel"],
        "gender": "hombre",
        "sizes": ["S", "M", "L", "XL"],
        "colors": [{"name": "Beige", "hex": "#D2B48C"}],
        "composition": "100% Lana Merino Premium",
        "care": "Lavado a mano. Secar en plano.",
        "is_new": True,
        "is_featured": True,
        "collections": ["roma"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "polo-patricius",
        "name": "Polo Patricius",
        "description": "Polo Patricius de algodón premium con bordado exclusivo. Inspiración clásica romana con estética de lujo contemporáneo.",
        "price": 895.00,
        "currency": "EUR",
        "images": [],
        "category": ["polos", "apparel"],
        "gender": "hombre",
        "sizes": ["S", "M", "L", "XL"],
        "colors": [{"name": "Blanco", "hex": "#FFFFFF"}],
        "composition": "100% Algodón Piqué Premium",
        "care": "Lavado a máquina 30°. No usar secadora.",
        "is_new": True,
        "is_featured": True,
        "collections": ["roma"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "product_id": "polo-regius",
        "name": "Polo Regius",
        "description": "Polo Regius de algodón premium con bordado exclusivo. La máxima expresión de la elegancia deportiva mediterránea.",
        "price": 895.00,
        "currency": "EUR",
        "images": [],
        "category": ["polos", "apparel"],
        "gender": "hombre",
        "sizes": ["S", "M", "L", "XL"],
        "colors": [{"name": "Blanco", "hex": "#FFFFFF"}],
        "composition": "100% Algodón Piqué Premium",
        "care": "Lavado a máquina 30°. No usar secadora.",
        "is_new": True,
        "is_featured": True,
        "collections": ["roma"],
        "created_at": datetime.now(timezone.utc).isoformat()
    },
]

def normalize_product_asset_urls(product: Dict) -> Dict:
    normalized = dict(product)
    normalized["images"] = [resolve_asset_url(image_url) for image_url in normalized.get("images", [])]
    if normalized.get("thumbnail_image"):
        normalized["thumbnail_image"] = resolve_asset_url(normalized["thumbnail_image"])
    return normalized

SEED_PRODUCTS = [normalize_product_asset_urls(product) for product in SEED_PRODUCTS]

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
cors_origins = [o.strip() for o in CORS_ORIGINS.split(',') if o.strip()]
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
