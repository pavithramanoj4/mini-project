
from fastapi.security import OAuth2PasswordRequestForm
from models import PriceHistory

from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from database import SessionLocal, engine, Base
from models import User, SearchHistory, Wishlist

from passlib.context import CryptContext
from jose import JWTError, jwt
import requests
import os
from dotenv import load_dotenv

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SERP_API_KEY = os.getenv("SERPAPI_KEY")

SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# ---------------- DATABASE ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- AUTH ----------------
def get_current_user(token: str = Depends(oauth2_scheme),
                     db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()

    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user


# ---------------- SCHEMAS ----------------
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class UpdateProfileRequest(BaseModel):
    name: str
    profile_photo: str | None = None


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class WishlistRequest(BaseModel):
    title: str
    price: str
    platform: str
    image: str | None = None
    link: str | None = None


# ---------------- REGISTER ----------------
@app.post("/register")
def register(user: RegisterRequest, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()

    return {"message": "User registered successfully"}


# ---------------- LOGIN ----------------
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(),
          db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == form_data.username).first()

    if not db_user or not pwd_context.verify(form_data.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = jwt.encode({"sub": db_user.email},
                       SECRET_KEY,
                       algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# ---------------- PROFILE ----------------
@app.get("/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "name": current_user.name,
        "email": current_user.email,
        "profile_photo": current_user.profile_photo,
        "joined_at": current_user.joined_at,
        "total_searches": current_user.total_searches
    }


# ---------------- UPDATE PROFILE ----------------
@app.put("/profile/update")
def update_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    current_user.name = data.name

    if data.profile_photo is not None:
        current_user.profile_photo = data.profile_photo

    db.commit()
    db.refresh(current_user)

    return {"message": "Profile updated successfully"}


# ---------------- CHANGE PASSWORD ----------------
@app.put("/profile/change-password")
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if not pwd_context.verify(data.old_password, current_user.password):
        raise HTTPException(status_code=400,
                            detail="Old password is incorrect")

    hashed_password = pwd_context.hash(data.new_password)
    current_user.password = hashed_password

    db.commit()

    return {"message": "Password updated successfully"}


# ---------------- COMPARE ----------------
# ---------------- COMPARE ----------------
@app.get("/compare")
def compare_product(product: str,
                    current_user: User = Depends(get_current_user),
                    db: Session = Depends(get_db)):

    params = {
        "engine": "google_shopping",
        "q": product,
        "api_key": SERP_API_KEY,
        "gl": "in",
        "hl": "en"
    }

    response = requests.get(
        "https://serpapi.com/search.json",
        params=params
    )

    data = response.json()

    results = []

    for item in data.get("shopping_results", [])[:5]:
        results.append({
            "title": item.get("title"),
            "price": item.get("price"),
            "rating": item.get("rating") or 0,
            "reviews": item.get("reviews") or 0,
            "platform": item.get("source"),
            "image": item.get("thumbnail"),
            "link": item.get("product_link") or item.get("link")
        })

    # ✅ CALCULATE CHEAPEST PLATFORM + SAVED AMOUNT
    prices = []
    platforms = []

    for r in results:
        if r["price"]:
            clean_price = float(str(r["price"]).replace("₹", "").replace(",", "").strip())
            prices.append(clean_price)
            platforms.append(r["platform"])

    if prices:
        min_price = min(prices)
        max_price = max(prices)
        cheapest_index = prices.index(min_price)

        cheapest_platform = platforms[cheapest_index]
        saved_amount = max_price - min_price
    else:
        cheapest_platform = "Unknown"
        saved_amount = 0

    # ✅ CHECK IF SAME PRODUCT ALREADY EXISTS (LATEST SEARCH)
    existing = db.query(SearchHistory)\
        .filter(
            SearchHistory.user_id == current_user.id,
            SearchHistory.product_name == product
        )\
        .order_by(SearchHistory.created_at.desc())\
        .first()

    # Only save if product not searched before
    if not existing:
        history_entry = SearchHistory(
            product_name=product,
            cheapest_platform=cheapest_platform,
            saved_amount=saved_amount,
            user_id=current_user.id
        )
        db.add(history_entry)

    current_user.total_searches += 1
    db.commit()

    return {
        "product": product,
        "results": results
    }


# ---------------- HISTORY ----------------
@app.get("/history")
def get_history(current_user: User = Depends(get_current_user),
                db: Session = Depends(get_db)):

    return db.query(SearchHistory)\
        .filter(SearchHistory.user_id == current_user.id)\
        .order_by(SearchHistory.created_at.desc())\
        .all()


# ---------------- WISHLIST ----------------
@app.post("/wishlist/add")
def add_to_wishlist(item: WishlistRequest,
                    current_user: User = Depends(get_current_user),
                    db: Session = Depends(get_db)):

    existing = db.query(Wishlist)\
        .filter(
            Wishlist.user_id == current_user.id,
            Wishlist.title == item.title,
            Wishlist.platform == item.platform
        ).first()

    if existing:
        raise HTTPException(status_code=400,
                            detail="Already in wishlist")

    wishlist_item = Wishlist(
        title=item.title,
        price=item.price,
        platform=item.platform,
        image=item.image,
        link=item.link,
        user_id=current_user.id
    )

    db.add(wishlist_item)
    db.commit()

    return {"message": "Added to wishlist"}


@app.get("/wishlist")
def get_wishlist(current_user: User = Depends(get_current_user),
                 db: Session = Depends(get_db)):

    return db.query(Wishlist)\
        .filter(Wishlist.user_id == current_user.id)\
        .order_by(Wishlist.created_at.desc())\
        .all()


@app.delete("/wishlist/{item_id}")
def remove_from_wishlist(item_id: int,
                         current_user: User = Depends(get_current_user),
                         db: Session = Depends(get_db)):

    item = db.query(Wishlist)\
        .filter(
            Wishlist.id == item_id,
            Wishlist.user_id == current_user.id
        ).first()

    if not item:
        raise HTTPException(status_code=404,
                            detail="Item not found")

    db.delete(item)
    db.commit()

    return {"message": "Removed from wishlist"}





