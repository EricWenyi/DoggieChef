from http.server import BaseHTTPRequestHandler
import json
import sqlite3
import os
import uuid
from urllib.parse import urlparse, parse_qs
import cloudinary
import cloudinary.uploader

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
            # Initialize database
            self.init_db()
            
            # Parse form data (simplified for now)
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # For now, assume JSON data
            data = json.loads(post_data.decode('utf-8'))
            
            # Validate required fields
            if not data.get('title'):
                self.send_error(400, 'Title is required')
                return
            if not data.get('country'):
                self.send_error(400, 'Country is required')
                return
            if not data.get('protein_type'):
                self.send_error(400, 'Protein type is required')
                return
            
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
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
                ''  # Photos will be handled separately
            ))
            
            recipe_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            result = {'id': recipe_id, 'message': 'Recipe created successfully'}
            
            self.send_response(201)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
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