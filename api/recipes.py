from http.server import BaseHTTPRequestHandler
import json
import sqlite3
import os
import uuid
from urllib.parse import urlparse, parse_qs
import cloudinary
import cloudinary.uploader
import cgi
import io
import sys
from datetime import datetime

# Vercel-friendly logging utility
def log_info(message, data=None):
    log_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "level": "INFO",
        "message": message,
        "data": data or {}
    }
    print(f"[DoggieChef API] {json.dumps(log_entry)}", flush=True)

def log_error(message, error=None, data=None):
    log_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "level": "ERROR",
        "message": message,
        "error": str(error) if error else None,
        "data": data or {}
    }
    print(f"[DoggieChef API ERROR] {json.dumps(log_entry)}", file=sys.stderr, flush=True)

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME', 'demo'),
    api_key=os.environ.get('CLOUDINARY_API_KEY', ''),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET', '')
)

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            log_info("GET request received", {
                "path": self.path,
                "headers": dict(self.headers),
                "client_address": self.client_address[0] if self.client_address else None
            })
            
            # Initialize database
            self.init_db()
            
            # Parse query parameters
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            
            log_info("Query parameters parsed", {
                "parsed_url": parsed_url.path,
                "query_params": query_params
            })
            
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Get filter parameters
            country = query_params.get('country', [None])[0]
            protein_type = query_params.get('protein_type', [None])[0]
            
            query = "SELECT * FROM recipes"
            params = []
            
            if country or protein_type:
                query += " WHERE"
                if country:
                    query += " country = ?"
                    params.append(country)
                if protein_type:
                    if country:
                        query += " AND"
                    query += " protein_type = ?"
                    params.append(protein_type)
            
            query += " ORDER BY created_at DESC"
            
            log_info("Database query prepared", {
                "query": query,
                "params": params,
                "filters": {
                    "country": country,
                    "protein_type": protein_type
                }
            })
            
            cursor.execute(query, params)
            recipes = cursor.fetchall()
            
            result = []
            for recipe in recipes:
                recipe_dict = dict(recipe)
                recipe_dict['photos'] = recipe_dict['photos'].split(',') if recipe_dict['photos'] else []
                result.append(recipe_dict)
            
            conn.close()
            
            log_info("GET request successful", {
                "recipe_count": len(result),
                "filters_applied": {
                    "country": country,
                    "protein_type": protein_type
                },
                "response_size": len(json.dumps(result))
            })
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            log_error("GET request failed", e, {
                "path": self.path,
                "error_type": type(e).__name__
            })
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Internal server error"}).encode())
    
    def do_POST(self):
        try:
            log_info("POST request received", {
                "path": self.path,
                "headers": dict(self.headers),
                "client_address": self.client_address[0] if self.client_address else None
            })
            
            # Initialize database
            self.init_db()
            
            content_type = self.headers.get('Content-Type', '')
            content_length = int(self.headers.get('Content-Length', 0))
            
            log_info("POST request details", {
                "content_type": content_type,
                "content_length": content_length
            })
            
            if content_length == 0:
                log_error("POST request failed - no content received")
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "No content received"}).encode())
                return
            
            post_data = self.rfile.read(content_length)
            
            log_info("POST data received", {
                "data_length": len(post_data)
            })
            
            # Handle different content types
            if 'multipart/form-data' in content_type:
                log_info("Processing multipart form data")
                try:
                    # Parse multipart form data
                    form = cgi.FieldStorage(
                        fp=io.BytesIO(post_data),
                        headers=self.headers,
                        environ={'REQUEST_METHOD': 'POST'}
                    )
                    
                    # Extract form fields
                    data = {}
                    photos = []
                    
                    for field_name in form.keys():
                        field = form[field_name]
                        if field.filename:  # It's a file
                            photos.append({
                                'filename': field.filename,
                                'data': field.file.read()
                            })
                            log_info("Photo found", {
                                "filename": field.filename,
                                "size": len(field.file.getvalue()) if hasattr(field.file, 'getvalue') else 'unknown'
                            })
                        else:  # It's a regular field
                            data[field_name] = field.value
                            log_info("Form field found", {
                                "field_name": field_name,
                                "field_value": field.value
                            })
                    
                    log_info("Form data extracted", {
                        "data_fields": list(data.keys()),
                        "photo_count": len(photos),
                        "recipe_title": data.get('title', 'Unknown')
                    })
                    
                except Exception as e:
                    log_error("Failed to parse multipart data", e)
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": f"Invalid multipart data format: {str(e)}"}).encode())
                    return
            else:
                log_info("Processing JSON data")
                try:
                    data = json.loads(post_data.decode('utf-8'))
                    photos = []
                    log_info("JSON data parsed successfully", {
                        "data_fields": list(data.keys())
                    })
                except json.JSONDecodeError as e:
                    log_error("JSON decode error", e)
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": f"Invalid JSON: {str(e)}"}).encode())
                    return
            
            log_info("Data parsing completed", {
                "parsed_data": {k: v for k, v in data.items() if k != 'ingredients'},  # Avoid logging long text
                "photo_count": len(photos)
            })
            
            # Validate required fields
            required_fields = ['title', 'country', 'protein_type']
            missing_fields = []
            for field in required_fields:
                if not data.get(field):
                    missing_fields.append(field)
            
            if missing_fields:
                error_msg = f"Required fields missing: {', '.join(missing_fields)}"
                log_error("Validation failed", None, {
                    "missing_fields": missing_fields,
                    "provided_fields": list(data.keys())
                })
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": error_msg}).encode())
                return
            
            log_info("Validation passed", {
                "recipe_title": data.get('title'),
                "recipe_country": data.get('country'),
                "recipe_protein": data.get('protein_type')
            })
            
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Upload photos to Cloudinary
            photo_urls = []
            for i, photo in enumerate(photos):
                try:
                    log_info("Uploading photo to Cloudinary", {
                        "photo_index": i + 1,
                        "total_photos": len(photos),
                        "filename": photo["filename"]
                    })
                    result = cloudinary.uploader.upload(
                        photo['data'],
                        folder='recipes',
                        public_id=f'recipe_{uuid.uuid4()}'
                    )
                    photo_urls.append(result['secure_url'])
                    log_info("Photo upload successful", {
                        "photo_index": i + 1,
                        "secure_url": result["secure_url"],
                        "public_id": result.get("public_id")
                    })
                except Exception as e:
                    log_error("Photo upload failed", e, {
                        "photo_index": i + 1,
                        "filename": photo["filename"]
                    })
                    # Continue with other photos
            
            photos_json = json.dumps(photo_urls)
            log_info("Photo processing completed", {
                "successful_uploads": len(photo_urls),
                "total_photos": len(photos)
            })
            
            log_info("Inserting recipe into database")
            cursor.execute('''
                INSERT INTO recipes (title, description, country, protein_type, cooking_time, difficulty, ingredients, photos)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data.get('title'),
                data.get('description'),
                data.get('country'),
                data.get('protein_type'),
                int(data.get('cooking_time')) if data.get('cooking_time') else None,
                data.get('difficulty'),
                data.get('ingredients'),
                photos_json
            ))
            
            recipe_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            log_info("Recipe created successfully", {
                "recipe_id": recipe_id,
                "title": data.get('title'),
                "country": data.get('country'),
                "protein_type": data.get('protein_type'),
                "photo_count": len(photo_urls)
            })
            
            self.send_response(201)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                'id': recipe_id,
                'message': 'Recipe created successfully'
            }).encode())
            
        except Exception as e:
            log_error("POST request failed", e, {
                "path": self.path,
                "error_type": type(e).__name__
            })
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Internal server error"}).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def get_db_connection(self):
        """Get database connection"""
        db_path = '/tmp/recipes.db'
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_db(self):
        """Initialize database with recipes table"""
        conn = self.get_db_connection()
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