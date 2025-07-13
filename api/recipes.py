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

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME', 'demo'),
    api_key=os.environ.get('CLOUDINARY_API_KEY', ''),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET', '')
)

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Initialize database
            self.init_db()
            
            # Parse query parameters
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            
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
            
            cursor.execute(query, params)
            recipes = cursor.fetchall()
            
            result = []
            for recipe in recipes:
                recipe_dict = dict(recipe)
                recipe_dict['photos'] = recipe_dict['photos'].split(',') if recipe_dict['photos'] else []
                result.append(recipe_dict)
            
            conn.close()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            self.send_error(500, str(e))
    
    def do_POST(self):
        try:
            print('🚀 POST request received')
            print('📋 Headers:', dict(self.headers))
            
            # Initialize database
            self.init_db()
            
            content_type = self.headers.get('Content-Type', '')
            content_length = int(self.headers.get('Content-Length', 0))
            
            print(f'📦 Content-Type: {content_type}')
            print(f'📏 Content-Length: {content_length}')
            
            if content_length == 0:
                print('❌ No content received')
                self.send_error(400, 'No content received')
                return
            
            post_data = self.rfile.read(content_length)
            print(f'📥 Raw data length: {len(post_data)}')
            
            # Handle different content types
            if 'multipart/form-data' in content_type:
                print('📋 Processing multipart form data')
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
                            print(f'📸 Found photo: {field.filename}')
                        else:  # It's a regular field
                            data[field_name] = field.value
                            print(f'📋 Found field {field_name}: {field.value}')
                    
                    print(f'📝 Extracted data: {data}')
                    print(f'📸 Found {len(photos)} photos')
                    
                except Exception as e:
                    print(f'❌ Failed to parse multipart data: {e}')
                    self.send_error(400, f'Invalid multipart data format: {e}')
                    return
            else:
                print('📋 Processing JSON data')
                try:
                    data = json.loads(post_data.decode('utf-8'))
                    photos = []
                except json.JSONDecodeError as e:
                    print(f'❌ JSON decode error: {e}')
                    self.send_error(400, f'Invalid JSON: {e}')
                    return
            
            print(f'📝 Parsed data: {data}')
            
            # Validate required fields
            required_fields = ['title', 'country', 'protein_type']
            for field in required_fields:
                if not data.get(field):
                    error_msg = f'{field} is required'
                    print(f'❌ Validation error: {error_msg}')
                    self.send_error(400, error_msg)
                    return
            
            print('✅ Validation passed')
            
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Upload photos to Cloudinary
            photo_urls = []
            for i, photo in enumerate(photos):
                try:
                    print(f'📸 Uploading photo {i+1}/{len(photos)}: {photo["filename"]}')
                    result = cloudinary.uploader.upload(
                        photo['data'],
                        folder='recipes',
                        public_id=f'recipe_{uuid.uuid4()}'
                    )
                    photo_urls.append(result['secure_url'])
                    print(f'✅ Photo uploaded: {result["secure_url"]}')
                except Exception as e:
                    print(f'❌ Photo upload failed: {e}')
                    # Continue with other photos
            
            photos_json = json.dumps(photo_urls)
            print(f'📸 Photos JSON: {photos_json}')
            
            print('💾 Inserting into database...')
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
            
            print(f'✅ Recipe created with ID: {recipe_id}')
            
            result = {'id': recipe_id, 'message': 'Recipe created successfully'}
            
            self.send_response(201)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            print(f'❌ Server error: {e}')
            import traceback
            traceback.print_exc()
            self.send_error(500, str(e))
    
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