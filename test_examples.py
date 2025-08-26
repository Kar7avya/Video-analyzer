import pytest
from fastapi.testclient import TestClient
from main import app

# Create test client
client = TestClient(app)

def test_read_root():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "Welcome to FastAPI Learning Project!" in response.json()["message"]

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_create_user():
    """Test creating a new user"""
    user_data = {
        "name": "Test User",
        "email": "test@example.com",
        "age": 25
    }
    response = client.post("/users/", json=user_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == user_data["name"]
    assert data["email"] == user_data["email"]
    assert data["age"] == user_data["age"]
    assert "id" in data

def test_get_users():
    """Test getting all users"""
    response = client.get("/users/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_item():
    """Test creating a new item"""
    item_data = {
        "name": "Test Item",
        "description": "A test item",
        "price": 29.99,
        "tax": 2.99,
        "tags": ["test", "example"]
    }
    response = client.post("/items/", json=item_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == item_data["name"]
    assert data["price"] == item_data["price"]

def test_search_items():
    """Test searching items"""
    response = client.get("/search/?q=test&min_price=10&max_price=50")
    assert response.status_code == 200
    data = response.json()
    assert "query" in data
    assert "results" in data
    assert "total" in data

def test_login():
    """Test login endpoint"""
    login_data = {
        "username": "admin",
        "password": "password"
    }
    response = client.post("/login/", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_protected_route():
    """Test protected route with authentication"""
    # First login to get token
    login_data = {
        "username": "admin",
        "password": "password"
    }
    login_response = client.post("/login/", json=login_data)
    token = login_response.json()["access_token"]
    
    # Use token to access protected route
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/protected/", headers=headers)
    assert response.status_code == 200
    assert "This is a protected route!" in response.json()["message"]

def test_protected_route_without_token():
    """Test protected route without token (should fail)"""
    response = client.get("/protected/")
    assert response.status_code == 403  # Forbidden

def test_error_demo():
    """Test error handling"""
    response = client.get("/error-demo/404")
    assert response.status_code == 404
    
    response = client.get("/error-demo/400")
    assert response.status_code == 400

def test_file_upload():
    """Test file upload"""
    # Create a test file
    test_content = b"This is a test file content"
    files = {"file": ("test.txt", test_content, "text/plain")}
    
    response = client.post("/upload/", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "test.txt"
    assert data["size"] == len(test_content)

def test_form_submission():
    """Test form data submission"""
    form_data = {
        "name": "John Doe",
        "email": "john@example.com",
        "age": "30",
        "message": "Hello from form!"
    }
    response = client.post("/submit-form/", data=form_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == form_data["name"]
    assert data["email"] == form_data["email"]

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__])