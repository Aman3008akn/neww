from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    offer_price: Optional[float] = None
    category: str
    concern: Optional[str] = None
    images: List[str]
    rating: float = 4.5
    review_count: int = 0
    ingredients: Optional[str] = None
    how_to_use: Optional[str] = None
    in_stock: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Address(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    is_default: bool = False

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[dict]
    total_amount: float
    address: dict
    payment_method: str
    payment_status: str = "pending"
    order_status: str = "placed"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Wishlist(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    product_ids: List[str] = []

# Helper functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload.get("sub")}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

# Auth routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user_data.password)
    user = User(email=user_data.email, name=user_data.name, phone=user_data.phone)
    
    user_doc = user.model_dump()
    user_doc['password'] = hashed_password
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    
    await db.users.insert_one(user_doc)
    
    token = create_access_token({"sub": user.id})
    return {"token": token, "user": user}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not pwd_context.verify(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user['id']})
    user_obj = User(**{k: v for k, v in user.items() if k != 'password'})
    return {"token": token, "user": user_obj}

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Product routes
@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, concern: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category:
        query['category'] = category
    if concern:
        query['concern'] = concern
    if search:
        query['$or'] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return Product(**product)

# Cart routes
@api_router.get("/cart")
async def get_cart(current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id}, {"_id": 0})
    if not cart:
        return {"items": []}
    return cart

@api_router.post("/cart")
async def add_to_cart(item: CartItem, current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id})
    
    if not cart:
        cart = Cart(user_id=current_user.id, items=[item])
        cart_doc = cart.model_dump()
        cart_doc['updated_at'] = cart_doc['updated_at'].isoformat()
        await db.carts.insert_one(cart_doc)
    else:
        items = cart.get('items', [])
        found = False
        for i, existing_item in enumerate(items):
            if existing_item['product_id'] == item.product_id:
                items[i]['quantity'] += item.quantity
                found = True
                break
        if not found:
            items.append(item.model_dump())
        
        await db.carts.update_one(
            {"user_id": current_user.id},
            {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    return {"message": "Item added to cart"}

@api_router.put("/cart/{product_id}")
async def update_cart_item(product_id: str, quantity: int, current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    
    items = cart.get('items', [])
    for i, item in enumerate(items):
        if item['product_id'] == product_id:
            if quantity <= 0:
                items.pop(i)
            else:
                items[i]['quantity'] = quantity
            break
    
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": {"items": items, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Cart updated"}

@api_router.delete("/cart/{product_id}")
async def remove_from_cart(product_id: str, current_user: User = Depends(get_current_user)):
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$pull": {"items": {"product_id": product_id}}}
    )
    return {"message": "Item removed"}

# Wishlist routes
@api_router.get("/wishlist")
async def get_wishlist(current_user: User = Depends(get_current_user)):
    wishlist = await db.wishlists.find_one({"user_id": current_user.id}, {"_id": 0})
    if not wishlist:
        return {"product_ids": []}
    return wishlist

@api_router.post("/wishlist/{product_id}")
async def add_to_wishlist(product_id: str, current_user: User = Depends(get_current_user)):
    wishlist = await db.wishlists.find_one({"user_id": current_user.id})
    
    if not wishlist:
        wishlist = Wishlist(user_id=current_user.id, product_ids=[product_id])
        await db.wishlists.insert_one(wishlist.model_dump())
    else:
        await db.wishlists.update_one(
            {"user_id": current_user.id},
            {"$addToSet": {"product_ids": product_id}}
        )
    
    return {"message": "Added to wishlist"}

@api_router.delete("/wishlist/{product_id}")
async def remove_from_wishlist(product_id: str, current_user: User = Depends(get_current_user)):
    await db.wishlists.update_one(
        {"user_id": current_user.id},
        {"$pull": {"product_ids": product_id}}
    )
    return {"message": "Removed from wishlist"}

# Address routes
@api_router.get("/addresses", response_model=List[Address])
async def get_addresses(current_user: User = Depends(get_current_user)):
    addresses = await db.addresses.find({"user_id": current_user.id}, {"_id": 0}).to_list(100)
    return addresses

@api_router.post("/addresses", response_model=Address)
async def create_address(address: Address, current_user: User = Depends(get_current_user)):
    address.user_id = current_user.id
    await db.addresses.insert_one(address.model_dump())
    return address

@api_router.delete("/addresses/{address_id}")
async def delete_address(address_id: str, current_user: User = Depends(get_current_user)):
    await db.addresses.delete_one({"id": address_id, "user_id": current_user.id})
    return {"message": "Address deleted"}

# Order routes
@api_router.post("/orders")
async def create_order(order_data: dict, current_user: User = Depends(get_current_user)):
    order = Order(
        user_id=current_user.id,
        items=order_data['items'],
        total_amount=order_data['total_amount'],
        address=order_data['address'],
        payment_method=order_data['payment_method']
    )
    
    order_doc = order.model_dump()
    order_doc['created_at'] = order_doc['created_at'].isoformat()
    
    # Mock payment success
    if order_data['payment_method'] == 'online':
        order_doc['payment_status'] = 'success'
    elif order_data['payment_method'] == 'cod':
        order_doc['payment_status'] = 'pending'
    
    await db.orders.insert_one(order_doc)
    
    # Clear cart
    await db.carts.delete_one({"user_id": current_user.id})
    
    return {"order_id": order.id, "message": "Order placed successfully"}

@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: User = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user.id}, {"_id": 0}).to_list(100)
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    return orders

# Admin routes
@api_router.get("/admin/orders", response_model=List[Order])
async def get_all_orders():
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    return orders

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, status_data: dict):
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"order_status": status_data['status']}}
    )
    return {"message": "Order status updated"}

@api_router.post("/admin/products", response_model=Product)
async def create_product(product: Product):
    product_doc = product.model_dump()
    product_doc['created_at'] = product_doc['created_at'].isoformat()
    await db.products.insert_one(product_doc)
    return product

@api_router.put("/admin/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: dict):
    product = Product(id=product_id, **product_data)
    product_doc = product.model_dump()
    product_doc['created_at'] = product_doc['created_at'].isoformat()
    
    await db.products.update_one(
        {"id": product_id},
        {"$set": product_doc}
    )
    return product

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str):
    await db.products.delete_one({"id": product_id})
    return {"message": "Product deleted"}

# Initialize sample products
@api_router.post("/init-products")
async def init_products():
    count = await db.products.count_documents({})
    if count > 0:
        return {"message": "Products already initialized"}
    
    sample_products = [
        # Skincare
        {
            "id": str(uuid.uuid4()),
            "name": "Vitamin C Brightening Serum",
            "description": "A powerful brightening serum enriched with 20% Vitamin C to reduce dark spots and even skin tone.",
            "price": 899,
            "offer_price": 699,
            "category": "skincare",
            "concern": "dark_spots",
            "images": ["https://images.unsplash.com/photo-1613803745799-ba6c10aace85"],
            "rating": 4.7,
            "review_count": 234,
            "ingredients": "Vitamin C, Hyaluronic Acid, Niacinamide",
            "how_to_use": "Apply 2-3 drops on clean face, massage gently. Use morning and night.",
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Hyaluronic Acid Hydrating Cream",
            "description": "Deep moisturizing cream with hyaluronic acid for plump, hydrated skin.",
            "price": 749,
            "offer_price": 599,
            "category": "skincare",
            "concern": "dry_skin",
            "images": ["https://images.unsplash.com/photo-1580870069867-74c57ee1bb07"],
            "rating": 4.6,
            "review_count": 189,
            "ingredients": "Hyaluronic Acid, Glycerin, Ceramides",
            "how_to_use": "Apply on damp skin after cleansing. Use twice daily.",
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Tea Tree Acne Control Serum",
            "description": "Combat acne with this powerful tea tree oil based serum. Reduces breakouts and blemishes.",
            "price": 649,
            "offer_price": 499,
            "category": "skincare",
            "concern": "acne",
            "images": ["https://images.unsplash.com/photo-1591130901921-3f0652bb3915"],
            "rating": 4.5,
            "review_count": 156,
            "ingredients": "Tea Tree Oil, Salicylic Acid, Witch Hazel",
            "how_to_use": "Apply on affected areas after cleansing. Use at night.",
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Retinol Anti-Aging Night Cream",
            "description": "Clinically proven retinol formula to reduce fine lines and wrinkles.",
            "price": 1299,
            "offer_price": 999,
            "category": "skincare",
            "concern": "aging",
            "images": ["https://images.pexels.com/photos/19797381/pexels-photo-19797381.jpeg"],
            "rating": 4.8,
            "review_count": 312,
            "ingredients": "Retinol, Peptides, Vitamin E",
            "how_to_use": "Apply at night on clean skin. Use sunscreen during day.",
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        # Haircare
        {
            "id": str(uuid.uuid4()),
            "name": "Biotin Hair Growth Shampoo",
            "description": "Strengthen hair and promote growth with biotin-enriched formula.",
            "price": 599,
            "offer_price": 449,
            "category": "haircare",
            "concern": "hair_fall",
            "images": ["https://images.unsplash.com/photo-1647920155220-538f9bf35586"],
            "rating": 4.5,
            "review_count": 278,
            "ingredients": "Biotin, Keratin, Argan Oil",
            "how_to_use": "Apply on wet hair, massage, rinse thoroughly. Use 2-3 times weekly.",
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Anti-Dandruff Tea Tree Shampoo",
            "description": "Natural tea tree oil formula to eliminate dandruff and soothe scalp.",
            "price": 549,
            "offer_price": 399,
            "category": "haircare",
            "concern": "dandruff",
            "images": ["https://images.unsplash.com/photo-1624939461078-66a124b3539c"],
            "rating": 4.6,
            "review_count": 201,
            "ingredients": "Tea Tree Oil, Salicylic Acid, Menthol",
            "how_to_use": "Apply on scalp, massage for 2 minutes, rinse. Use regularly.",
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Argan Oil Hair Serum",
            "description": "Lightweight serum for smooth, shiny, frizz-free hair.",
            "price": 799,
            "offer_price": 649,
            "category": "haircare",
            "concern": "frizzy_hair",
            "images": ["https://images.unsplash.com/photo-1734892494600-c0b59a3f7cdb"],
            "rating": 4.7,
            "review_count": 167,
            "ingredients": "Argan Oil, Vitamin E, Coconut Oil",
            "how_to_use": "Apply 2-3 drops on damp or dry hair. Style as usual.",
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Deep Conditioning Hair Mask",
            "description": "Intensive repair treatment for damaged and dry hair.",
            "price": 699,
            "offer_price": 549,
            "category": "haircare",
            "concern": "damaged_hair",
            "images": ["https://images.pexels.com/photos/3738341/pexels-photo-3738341.jpeg"],
            "rating": 4.8,
            "review_count": 245,
            "ingredients": "Shea Butter, Coconut Oil, Protein Complex",
            "how_to_use": "Apply on damp hair, leave for 15 minutes, rinse. Use weekly.",
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        # Body Care
        {
            "id": str(uuid.uuid4()),
            "name": "Coconut Body Butter",
            "description": "Rich, creamy body butter for ultra-soft, moisturized skin.",
            "price": 849,
            "offer_price": 699,
            "category": "bodycare",
            "concern": "dry_skin",
            "images": ["https://images.unsplash.com/photo-1610551745215-1a4b5f36de8f"],
            "rating": 4.7,
            "review_count": 198,
            "ingredients": "Coconut Oil, Shea Butter, Vitamin E",
            "how_to_use": "Apply on clean skin after shower. Massage gently.",
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Vitamin E Body Lotion",
            "description": "Lightweight daily moisturizer with vitamin E for healthy skin.",
            "price": 599,
            "offer_price": 449,
            "category": "bodycare",
            "concern": "dull_skin",
            "images": ["https://images.unsplash.com/photo-1598662957563-ee4965d4d72c"],
            "rating": 4.5,
            "review_count": 134,
            "ingredients": "Vitamin E, Aloe Vera, Glycerin",
            "how_to_use": "Apply daily on body after bath.",
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Coffee Body Scrub",
            "description": "Exfoliating scrub to remove dead skin and reveal smooth, glowing skin.",
            "price": 549,
            "offer_price": 399,
            "category": "bodycare",
            "concern": "dull_skin",
            "images": ["https://images.unsplash.com/photo-1526947425960-945c6e72858f"],
            "rating": 4.6,
            "review_count": 223,
            "ingredients": "Coffee Grounds, Coconut Oil, Sugar",
            "how_to_use": "Apply on wet skin, scrub gently, rinse. Use 2-3 times weekly.",
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Lavender Bath Salts",
            "description": "Relaxing bath salts infused with lavender for ultimate relaxation.",
            "price": 499,
            "offer_price": 349,
            "category": "bodycare",
            "concern": "stress",
            "images": ["https://images.pexels.com/photos/4202325/pexels-photo-4202325.jpeg"],
            "rating": 4.8,
            "review_count": 145,
            "ingredients": "Lavender Essential Oil, Epsom Salt, Sea Salt",
            "how_to_use": "Add to warm bath water. Soak for 20 minutes.",
            "in_stock": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.products.insert_many(sample_products)
    return {"message": f"{len(sample_products)} products initialized"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
