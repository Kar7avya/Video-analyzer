from fastapi import FastAPI, HTTPException, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

from database import get_db, UserDB, ItemDB, PostDB

# Initialize FastAPI app
app = FastAPI(
    title="FastAPI Database Integration",
    description="FastAPI with SQLAlchemy database integration",
    version="1.0.0"
)

# Pydantic Models for API
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    age: int

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ItemCreate(BaseModel):
    name: str
    description: str
    price: float
    tax: Optional[float] = None

class ItemResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    tax: Optional[float]
    created_at: datetime
    
    class Config:
        from_attributes = True

class PostCreate(BaseModel):
    title: str
    content: str
    author: str
    published: bool = False

class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    author: str
    published: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Root endpoint
@app.get("/")
async def root():
    return {"message": "FastAPI Database Integration Example"}

# ========== USER ENDPOINTS WITH DATABASE ==========

@app.post("/db/users/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_db(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user in database"""
    # Check if email already exists
    db_user = db.query(UserDB).filter(UserDB.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    db_user = UserDB(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/db/users/", response_model=List[UserResponse])
def get_users_db(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Get all users from database with pagination"""
    users = db.query(UserDB).offset(skip).limit(limit).all()
    return users

@app.get("/db/users/{user_id}", response_model=UserResponse)
def get_user_db(user_id: int, db: Session = Depends(get_db)):
    """Get a specific user from database"""
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/db/users/{user_id}", response_model=UserResponse)
def update_user_db(user_id: int, user_update: UserCreate, db: Session = Depends(get_db)):
    """Update a user in database"""
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for key, value in user_update.dict().items():
        setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user

@app.delete("/db/users/{user_id}")
def delete_user_db(user_id: int, db: Session = Depends(get_db)):
    """Delete a user from database"""
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return {"message": f"User {user.name} deleted successfully"}

# ========== ITEM ENDPOINTS WITH DATABASE ==========

@app.post("/db/items/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item_db(item: ItemCreate, db: Session = Depends(get_db)):
    """Create a new item in database"""
    db_item = ItemDB(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/db/items/", response_model=List[ItemResponse])
def get_items_db(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Get all items from database with pagination"""
    items = db.query(ItemDB).offset(skip).limit(limit).all()
    return items

@app.get("/db/items/{item_id}", response_model=ItemResponse)
def get_item_db(item_id: int, db: Session = Depends(get_db)):
    """Get a specific item from database"""
    item = db.query(ItemDB).filter(ItemDB.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

# ========== POST ENDPOINTS WITH DATABASE ==========

@app.post("/db/posts/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post_db(post: PostCreate, db: Session = Depends(get_db)):
    """Create a new post in database"""
    db_post = PostDB(**post.dict())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@app.get("/db/posts/", response_model=List[PostResponse])
def get_posts_db(published_only: bool = False, db: Session = Depends(get_db)):
    """Get all posts from database"""
    query = db.query(PostDB)
    if published_only:
        query = query.filter(PostDB.published == True)
    return query.all()

# ========== SEARCH ENDPOINTS WITH DATABASE ==========

@app.get("/db/search/users/", response_model=List[UserResponse])
def search_users_db(name: Optional[str] = None, email: Optional[str] = None, db: Session = Depends(get_db)):
    """Search users in database"""
    query = db.query(UserDB)
    
    if name:
        query = query.filter(UserDB.name.contains(name))
    if email:
        query = query.filter(UserDB.email.contains(email))
    
    return query.all()

@app.get("/db/search/items/", response_model=List[ItemResponse])
def search_items_db(
    q: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """Search items in database"""
    query = db.query(ItemDB)
    
    if q:
        query = query.filter(
            (ItemDB.name.contains(q)) | (ItemDB.description.contains(q))
        )
    if min_price:
        query = query.filter(ItemDB.price >= min_price)
    if max_price:
        query = query.filter(ItemDB.price <= max_price)
    
    return query.all()

# ========== STATISTICS ENDPOINTS ==========

@app.get("/db/stats/")
def get_database_stats(db: Session = Depends(get_db)):
    """Get database statistics"""
    user_count = db.query(UserDB).count()
    item_count = db.query(ItemDB).count()
    post_count = db.query(PostDB).count()
    published_post_count = db.query(PostDB).filter(PostDB.published == True).count()
    
    return {
        "total_users": user_count,
        "total_items": item_count,
        "total_posts": post_count,
        "published_posts": published_post_count,
        "timestamp": datetime.utcnow()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)