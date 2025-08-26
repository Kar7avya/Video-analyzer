from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
import json
import aiofiles
import os

# Initialize FastAPI app
app = FastAPI(
    title="FastAPI Learning Project",
    description="A comprehensive FastAPI application for learning purposes",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# In-memory database (for learning purposes)
users_db = []
items_db = []
posts_db = []

# Pydantic Models
class User(BaseModel):
    id: Optional[int] = None
    name: str
    email: EmailStr
    age: int
    is_active: bool = True
    created_at: Optional[datetime] = None

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    age: Optional[int] = None
    is_active: Optional[bool] = None

class Item(BaseModel):
    id: Optional[int] = None
    name: str
    description: str
    price: float
    tax: Optional[float] = None
    tags: List[str] = []

class Post(BaseModel):
    id: Optional[int] = None
    title: str
    content: str
    author: str
    published: bool = False
    created_at: Optional[datetime] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# Root endpoint
@app.get("/")
async def root():
    """Welcome endpoint"""
    return {
        "message": "Welcome to FastAPI Learning Project!",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now()}

# ========== USER MANAGEMENT ENDPOINTS ==========

@app.post("/users/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(user: User):
    """Create a new user"""
    user.id = len(users_db) + 1
    user.created_at = datetime.now()
    users_db.append(user.dict())
    return user

@app.get("/users/", response_model=List[User])
async def get_users(skip: int = 0, limit: int = 10):
    """Get all users with pagination"""
    return users_db[skip: skip + limit]

@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: int):
    """Get a specific user by ID"""
    for user in users_db:
        if user["id"] == user_id:
            return user
    raise HTTPException(status_code=404, detail="User not found")

@app.put("/users/{user_id}", response_model=User)
async def update_user(user_id: int, user_update: UserUpdate):
    """Update a user"""
    for i, user in enumerate(users_db):
        if user["id"] == user_id:
            update_data = user_update.dict(exclude_unset=True)
            users_db[i].update(update_data)
            return users_db[i]
    raise HTTPException(status_code=404, detail="User not found")

@app.delete("/users/{user_id}")
async def delete_user(user_id: int):
    """Delete a user"""
    for i, user in enumerate(users_db):
        if user["id"] == user_id:
            deleted_user = users_db.pop(i)
            return {"message": f"User {deleted_user['name']} deleted successfully"}
    raise HTTPException(status_code=404, detail="User not found")

# ========== ITEM MANAGEMENT ENDPOINTS ==========

@app.post("/items/", response_model=Item, status_code=status.HTTP_201_CREATED)
async def create_item(item: Item):
    """Create a new item"""
    item.id = len(items_db) + 1
    items_db.append(item.dict())
    return item

@app.get("/items/", response_model=List[Item])
async def get_items(q: Optional[str] = None, skip: int = 0, limit: int = 10):
    """Get items with optional search and pagination"""
    filtered_items = items_db
    if q:
        filtered_items = [item for item in items_db if q.lower() in item["name"].lower()]
    return filtered_items[skip: skip + limit]

@app.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: int):
    """Get a specific item by ID"""
    for item in items_db:
        if item["id"] == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")

# ========== QUERY PARAMETERS EXAMPLES ==========

@app.get("/search/")
async def search_items(
    q: str,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = "name"
):
    """Advanced search with multiple query parameters"""
    results = []
    for item in items_db:
        if q.lower() in item["name"].lower() or q.lower() in item["description"].lower():
            if min_price and item["price"] < min_price:
                continue
            if max_price and item["price"] > max_price:
                continue
            results.append(item)
    
    return {
        "query": q,
        "filters": {
            "category": category,
            "min_price": min_price,
            "max_price": max_price,
            "sort_by": sort_by
        },
        "results": results,
        "total": len(results)
    }

# ========== PATH PARAMETERS EXAMPLES ==========

@app.get("/categories/{category_name}/items/{item_id}")
async def get_item_from_category(category_name: str, item_id: int):
    """Example of multiple path parameters"""
    return {
        "category": category_name,
        "item_id": item_id,
        "message": f"Getting item {item_id} from category {category_name}"
    }

# ========== POST MANAGEMENT ==========

@app.post("/posts/", response_model=Post, status_code=status.HTTP_201_CREATED)
async def create_post(post: Post):
    """Create a new blog post"""
    post.id = len(posts_db) + 1
    post.created_at = datetime.now()
    posts_db.append(post.dict())
    return post

@app.get("/posts/", response_model=List[Post])
async def get_posts(published_only: bool = False):
    """Get all posts, optionally filter by published status"""
    if published_only:
        return [post for post in posts_db if post["published"]]
    return posts_db

# ========== FILE UPLOAD EXAMPLE ==========

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file"""
    upload_dir = "/workspace/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = f"{upload_dir}/{file.filename}"
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(content),
        "message": "File uploaded successfully"
    }

# ========== FORM DATA EXAMPLE ==========

@app.post("/submit-form/")
async def submit_form(
    name: str = Form(...),
    email: str = Form(...),
    age: int = Form(...),
    message: str = Form(...)
):
    """Handle form data submission"""
    return {
        "name": name,
        "email": email,
        "age": age,
        "message": message,
        "submitted_at": datetime.now()
    }

# ========== AUTHENTICATION EXAMPLE ==========

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Simple token verification (for learning purposes)"""
    if credentials.credentials != "secret-token":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    return credentials.credentials

@app.post("/login/")
async def login(login_request: LoginRequest):
    """Simple login endpoint"""
    if login_request.username == "admin" and login_request.password == "password":
        return {"access_token": "secret-token", "token_type": "bearer"}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )

@app.get("/protected/")
async def protected_route(token: str = Depends(verify_token)):
    """Protected route requiring authentication"""
    return {"message": "This is a protected route!", "token": token}

# ========== ERROR HANDLING EXAMPLES ==========

@app.get("/error-demo/{error_type}")
async def error_demo(error_type: str):
    """Demonstrate different types of errors"""
    if error_type == "404":
        raise HTTPException(status_code=404, detail="Resource not found")
    elif error_type == "400":
        raise HTTPException(status_code=400, detail="Bad request")
    elif error_type == "500":
        raise HTTPException(status_code=500, detail="Internal server error")
    else:
        return {"message": f"No error demo for type: {error_type}"}

# ========== RESPONSE MODEL EXAMPLES ==========

class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

@app.get("/api-response-demo/", response_model=ApiResponse)
async def api_response_demo():
    """Demonstrate structured API response"""
    return ApiResponse(
        success=True,
        message="This is a structured API response",
        data={"timestamp": datetime.now(), "version": "1.0.0"}
    )

# ========== STARTUP AND SHUTDOWN EVENTS ==========

@app.on_event("startup")
async def startup_event():
    """Initialize some sample data"""
    # Add sample users
    sample_users = [
        {"id": 1, "name": "John Doe", "email": "john@example.com", "age": 30, "is_active": True, "created_at": datetime.now()},
        {"id": 2, "name": "Jane Smith", "email": "jane@example.com", "age": 25, "is_active": True, "created_at": datetime.now()}
    ]
    users_db.extend(sample_users)
    
    # Add sample items
    sample_items = [
        {"id": 1, "name": "Laptop", "description": "High-performance laptop", "price": 999.99, "tax": 99.99, "tags": ["electronics", "computers"]},
        {"id": 2, "name": "Coffee Mug", "description": "Ceramic coffee mug", "price": 12.99, "tax": 1.30, "tags": ["kitchen", "drinkware"]}
    ]
    items_db.extend(sample_items)
    
    print("FastAPI Learning Project started successfully!")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("FastAPI Learning Project shutting down...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)