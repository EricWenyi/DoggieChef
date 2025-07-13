from http.server import BaseHTTPRequestHandler
import json
import sqlite3

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Initialize database
            self.init_db()
            
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Total recipes
            cursor.execute('SELECT COUNT(*) as total FROM recipes')
            total_recipes = cursor.fetchone()['total']
            
            # Recipes by country
            cursor.execute('SELECT country, COUNT(*) as count FROM recipes GROUP BY country ORDER BY count DESC')
            recipes_by_country = [dict(row) for row in cursor.fetchall()]
            
            # Recipes by protein type
            cursor.execute('SELECT protein_type, COUNT(*) as count FROM recipes GROUP BY protein_type ORDER BY count DESC')
            recipes_by_protein = [dict(row) for row in cursor.fetchall()]
            
            conn.close()
            
            result = {
                'total_recipes': total_recipes,
                'recipes_by_country': recipes_by_country,
                'recipes_by_protein': recipes_by_protein
            }
            
            self.send_response(200)
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