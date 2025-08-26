# FastAPI Learning Project 🚀

Welcome to your comprehensive FastAPI learning environment! This project contains everything you need to learn FastAPI from basics to advanced concepts.

## 📚 What You'll Learn

- **Basic FastAPI concepts** - Routes, path parameters, query parameters
- **Request/Response models** - Pydantic models for data validation
- **Database integration** - SQLAlchemy with FastAPI
- **Authentication** - Simple token-based authentication
- **File handling** - Upload and download files
- **Testing** - How to test FastAPI applications
- **Error handling** - Custom exceptions and error responses
- **Documentation** - Automatic API documentation with Swagger

## 🛠️ Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the Applications

**Main Application (Port 8000):**
```bash
python main.py
```
or
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Database Application (Port 8001):**
```bash
python database_app.py
```
or
```bash
uvicorn database_app:app --reload --host 0.0.0.0 --port 8001
```

### 3. Access the Documentation

- **Main App Swagger UI**: http://localhost:8000/docs
- **Main App ReDoc**: http://localhost:8000/redoc
- **Database App Swagger UI**: http://localhost:8001/docs
- **Database App ReDoc**: http://localhost:8001/redoc

## 📖 Learning Guide

### Phase 1: Basics (main.py)

#### 1.1 Simple Routes
```python
@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

**Try these:**
- GET http://localhost:8000/
- GET http://localhost:8000/health

#### 1.2 Path Parameters
```python
@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id}
```

**Try these:**
- GET http://localhost:8000/users/123
- GET http://localhost:8000/categories/electronics/items/456

#### 1.3 Query Parameters
```python
@app.get("/items/")
async def get_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}
```

**Try these:**
- GET http://localhost:8000/items/
- GET http://localhost:8000/items/?skip=10&limit=5
- GET http://localhost:8000/search/?q=laptop&min_price=100&max_price=1000

### Phase 2: Data Models (Pydantic)

#### 2.1 Request Models
```python
class User(BaseModel):
    name: str
    email: EmailStr
    age: int
    is_active: bool = True
```

#### 2.2 Response Models
```python
@app.post("/users/", response_model=User)
async def create_user(user: User):
    return user
```

**Try these:**
- POST http://localhost:8000/users/ with JSON body
- GET http://localhost:8000/users/

### Phase 3: CRUD Operations

#### 3.1 Create (POST)
```bash
curl -X POST "http://localhost:8000/users/" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "age": 30}'
```

#### 3.2 Read (GET)
```bash
curl "http://localhost:8000/users/"
curl "http://localhost:8000/users/1"
```

#### 3.3 Update (PUT)
```bash
curl -X PUT "http://localhost:8000/users/1" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Updated", "email": "john.updated@example.com", "age": 31}'
```

#### 3.4 Delete (DELETE)
```bash
curl -X DELETE "http://localhost:8000/users/1"
```

### Phase 4: Authentication

#### 4.1 Login
```bash
curl -X POST "http://localhost:8000/login/" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'
```

#### 4.2 Access Protected Route
```bash
curl -H "Authorization: Bearer secret-token" \
  "http://localhost:8000/protected/"
```

### Phase 5: File Upload

```bash
curl -X POST "http://localhost:8000/upload/" \
  -F "file=@/path/to/your/file.txt"
```

### Phase 6: Form Data

```bash
curl -X POST "http://localhost:8000/submit-form/" \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "age=30" \
  -F "message=Hello from form!"
```

## 🗄️ Database Integration (database_app.py)

### Setup
The database app uses SQLAlchemy with SQLite. It automatically creates tables on startup.

### Key Concepts

#### 1. Database Models
```python
class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    # ... more fields
```

#### 2. Dependency Injection
```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/db/users/")
def get_users_db(db: Session = Depends(get_db)):
    return db.query(UserDB).all()
```

### Database Operations

#### Create User
```bash
curl -X POST "http://localhost:8001/db/users/" \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com", "age": 28}'
```

#### Search Users
```bash
curl "http://localhost:8001/db/search/users/?name=Alice"
curl "http://localhost:8001/db/search/items/?q=laptop&min_price=500"
```

#### Get Statistics
```bash
curl "http://localhost:8001/db/stats/"
```

## 🧪 Testing

### Run Tests
```bash
python test_examples.py
```
or
```bash
pytest test_examples.py -v
```

### Test Structure
```python
from fastapi.testclient import TestClient

client = TestClient(app)

def test_create_user():
    response = client.post("/users/", json=user_data)
    assert response.status_code == 201
```

## 🎯 Practice Exercises

### Beginner Exercises

1. **Add a new endpoint** that returns your favorite quote
2. **Create a calculator endpoint** that takes two numbers and an operation
3. **Add validation** to ensure age is between 0 and 150
4. **Create a todo list** with CRUD operations

### Intermediate Exercises

1. **Add pagination** to the items endpoint
2. **Implement search functionality** with multiple filters
3. **Add user roles** (admin, user) to the authentication system
4. **Create relationships** between users and posts in the database

### Advanced Exercises

1. **Add JWT token authentication** with expiration
2. **Implement rate limiting** for API endpoints
3. **Add background tasks** for email notifications
4. **Create API versioning** (v1, v2)
5. **Add caching** with Redis

## 📝 Common Patterns

### Error Handling
```python
from fastapi import HTTPException

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    user = find_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

### Response Models
```python
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    
    class Config:
        from_attributes = True  # For SQLAlchemy models
```

### Dependency Injection
```python
def get_current_user(token: str = Depends(oauth2_scheme)):
    # Verify token and return user
    return user

@app.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file:
```
DATABASE_URL=sqlite:///./fastapi_learning.db
SECRET_KEY=your-secret-key-here
```

### Settings with Pydantic
```python
from pydantic import BaseSettings

class Settings(BaseSettings):
    database_url: str = "sqlite:///./fastapi_learning.db"
    secret_key: str = "secret"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## 📚 Additional Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Pydantic Documentation**: https://pydantic-docs.helpmanual.io/
- **SQLAlchemy Documentation**: https://docs.sqlalchemy.org/
- **Uvicorn Documentation**: https://www.uvicorn.org/

## 🚀 Next Steps

1. **Deploy your app** using Docker
2. **Add a frontend** with React or Vue.js
3. **Implement WebSocket** connections
4. **Add monitoring** with Prometheus
5. **Learn async/await** patterns in depth

## 💡 Tips for Learning

1. **Start with the Swagger UI** - It's the best way to explore the API
2. **Read the automatic documentation** - FastAPI generates excellent docs
3. **Experiment with different data types** - Try dates, enums, nested models
4. **Use type hints everywhere** - They help with validation and documentation
5. **Test your endpoints** - Use the provided test examples as templates

Happy learning! 🎉

---

## File Structure
```
/workspace/
├── main.py              # Main FastAPI application
├── database.py          # Database models and configuration
├── database_app.py      # Database-integrated FastAPI app
├── test_examples.py     # Test examples
├── requirements.txt     # Python dependencies
├── README.md           # This file
├── FastApi.py          # Your original file (kept for reference)
└── uploads/            # Directory for uploaded files
```