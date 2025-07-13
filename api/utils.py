import os
import sqlite3
import uuid
from werkzeug.utils import secure_filename
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url

# Configure Cloudinary for image uploads
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET')
)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'heic', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db_connection():
    """Get database connection - using SQLite for simplicity, but you can switch to PostgreSQL"""
    db_path = '/tmp/recipes.db'
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database with recipes table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS recipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            country TEXT NOT NULL,
            protein_type TEXT NOT NULL,
            cooking_time INTEGER,
            difficulty TEXT,
            ingredients TEXT,
            photos TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def upload_to_cloudinary(file, filename):
    """Upload file to Cloudinary and return the URL"""
    try:
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}_{secure_filename(filename)}"
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file,
            public_id=f"doggiechef/{unique_filename}",
            folder="doggiechef",
            resource_type="auto"
        )
        
        return result['secure_url']
    except Exception as e:
        print(f"Error uploading to Cloudinary: {str(e)}")
        return None

def create_cors_response(data, status_code=200):
    """Create a response with CORS headers"""
    from flask import jsonify
    response = jsonify(data)
    response.status_code = status_code
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response 