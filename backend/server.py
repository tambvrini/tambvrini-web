from pathlib import Path
import logging
import os
from typing import List, Optional
from urllib.parse import urlparse

import stripe
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException, Request
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


STRIPE_SECRET_KEY = require_env("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = require_env("STRIPE_WEBHOOK_SECRET")
DEFAULT_ORIGINS = "https://tambvrini.com,https://www.tambvrini.com,http://localhost:3000,http://127.0.0.1:3000"
CORS_ORIGINS = [origin.strip() for origin in os.environ.get("CORS_ORIGINS", DEFAULT_ORIGINS).split(",") if origin.strip()]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


class CheckoutItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    size: Optional[str] = None
    color: Optional[str] = None
    image: Optional[str] = None


class CheckoutRequest(BaseModel):
    items: List[CheckoutItem]
    origin_url: str


def normalize_checkout_origin(origin_url: str) -> str:
    origin = (origin_url or "").strip()
    parsed = urlparse(origin)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise HTTPException(400, "origin_url inválido")
    normalized = f"{parsed.scheme}://{parsed.netloc}"
    if normalized not in CORS_ORIGINS:
        raise HTTPException(400, "origin_url no permitido")
    return normalized


@api_router.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@api_router.post("/checkout/create-session")
async def create_checkout_session(data: CheckoutRequest):
    if not data.items:
        raise HTTPException(400, "No hay productos para pagar")

    stripe.api_key = STRIPE_SECRET_KEY
    checkout_origin = normalize_checkout_origin(data.origin_url)

    line_items = []
    total = 0.0

    for item in data.items:
        if item.price <= 0:
            raise HTTPException(400, "El precio debe ser mayor que cero")
        if item.quantity < 1:
            raise HTTPException(400, "La cantidad debe ser mayor o igual a 1")

        total += item.price * item.quantity
        product_data = {"name": item.name}

        if item.image:
            image_url = item.image.strip()
            if image_url.startswith("/"):
                image_url = f"{checkout_origin}{image_url}"
            product_data["images"] = [image_url]

        line_items.append({
            "price_data": {
                "currency": "eur",
                "product_data": product_data,
                "unit_amount": int(item.price * 100),
            },
            "quantity": item.quantity,
        })

    shipping_address_collection = {"allowed_countries": ["ES"]}
    standard_amount = 0 if total >= 75 else 499
    shipping_options = [
        {
            "shipping_rate_data": {
                "type": "fixed_amount",
                "fixed_amount": {"amount": standard_amount, "currency": "eur"},
                "display_name": "Envío estándar",
                "delivery_estimate": {
                    "minimum": {"unit": "business_day", "value": 2},
                    "maximum": {"unit": "business_day", "value": 4},
                },
            }
        },
        {
            "shipping_rate_data": {
                "type": "fixed_amount",
                "fixed_amount": {"amount": 799, "currency": "eur"},
                "display_name": "Envío exprés",
                "delivery_estimate": {
                    "minimum": {"unit": "business_day", "value": 1},
                    "maximum": {"unit": "business_day", "value": 2},
                },
            }
        },
    ]

    success_url = f"{checkout_origin}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_origin}/carrito"

    session = stripe.checkout.sessions.create(
        line_items=line_items,
        mode="payment",
        success_url=success_url,
        cancel_url=cancel_url,
        shipping_address_collection=shipping_address_collection,
        shipping_options=shipping_options,
    )

    return {"session_id": session.id}


@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str):
    stripe.api_key = STRIPE_SECRET_KEY
    session = stripe.checkout.Session.retrieve(session_id)
    payment_status = session.get("payment_status")
    status = "complete" if payment_status == "paid" else "pending"

    return {
        "status": status,
        "payment_status": payment_status,
        "amount_total": session.get("amount_total"),
        "currency": session.get("currency"),
    }


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    stripe.api_key = STRIPE_SECRET_KEY

    try:
        event = stripe.Webhook.construct_event(body, signature, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError as exc:
        logger.warning("Invalid Stripe signature: %s", exc)
        raise HTTPException(400, "Firma inválida") from exc
    except ValueError as exc:
        logger.warning("Invalid Stripe payload: %s", exc)
        raise HTTPException(400, "Payload inválido") from exc

    if event.get("type") == "checkout.session.completed":
        session_data = event.get("data", {}).get("object", {})
        session_id = session_data.get("id")
        if session_id:
            logger.info("Stripe checkout completed for session %s", session_id)

    return {"status": "ok"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
