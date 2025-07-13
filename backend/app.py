from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads', 'recipes')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'heic', 'webp'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def init_db():
    conn = sqlite3.connect('recipes.db')
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

def get_db_connection():
    conn = sqlite3.connect('recipes.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get filter parameters
    country = request.args.get('country')
    protein_type = request.args.get('protein_type')
    
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
    return jsonify(result)

@app.route('/api/recipes/<int:recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM recipes WHERE id = ?', (recipe_id,))
    recipe = cursor.fetchone()
    conn.close()
    
    if recipe is None:
        return jsonify({'error': 'Recipe not found'}), 404
    
    recipe_dict = dict(recipe)
    recipe_dict['photos'] = recipe_dict['photos'].split(',') if recipe_dict['photos'] else []
    return jsonify(recipe_dict)

@app.route('/api/recipes', methods=['POST'])
def create_recipe():
    try:
        print("📝 Creating new recipe...")
        data = request.form.to_dict()
        files = request.files.getlist('photos')
        
        print(f"📋 Form data: {data}")
        print(f"📸 Files received: {len(files)}")
        
        # Validate required fields
        if not data.get('title'):
            return jsonify({'error': 'Title is required'}), 400
        if not data.get('country'):
            return jsonify({'error': 'Country is required'}), 400
        if not data.get('protein_type'):
            return jsonify({'error': 'Protein type is required'}), 400
        
        # Handle photo uploads
        photo_paths = []
        for file in files:
            if file and file.filename and allowed_file(file.filename):
                # Generate unique filename
                filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                
                print(f"💾 Saving photo to: {filepath}")
                # Save file
                file.save(filepath)
                photo_paths.append(f"/api/photos/{filename}")
        
        print(f"📸 Photo paths: {photo_paths}")
        
        conn = get_db_connection()
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
            ','.join(photo_paths)
        ))
        
        recipe_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        print(f"✅ Recipe created successfully with ID: {recipe_id}")
        return jsonify({'id': recipe_id, 'message': 'Recipe created successfully'}), 201
        
    except Exception as e:
        print(f"❌ Error creating recipe: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/recipes/<int:recipe_id>', methods=['PUT'])
def update_recipe(recipe_id):
    try:
        data = request.form.to_dict()
        files = request.files.getlist('photos')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get existing photos
        cursor.execute('SELECT photos FROM recipes WHERE id = ?', (recipe_id,))
        existing_recipe = cursor.fetchone()
        
        if existing_recipe is None:
            conn.close()
            return jsonify({'error': 'Recipe not found'}), 404
        
        existing_photos = existing_recipe['photos'].split(',') if existing_recipe['photos'] else []
        
        # Handle new photo uploads
        new_photo_paths = []
        for file in files:
            if file and allowed_file(file.filename):
                filename = f"{uuid.uuid4()}_{secure_filename(file.filename)}"
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                new_photo_paths.append(f"/api/photos/{filename}")
        
        # Combine existing and new photos
        all_photos = existing_photos + new_photo_paths
        
        cursor.execute('''
            UPDATE recipes 
            SET title = ?, description = ?, country = ?, protein_type = ?, 
                cooking_time = ?, difficulty = ?, ingredients = ?, photos = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (
            data.get('title'),
            data.get('description'),
            data.get('country'),
            data.get('protein_type'),
            data.get('cooking_time'),
            data.get('difficulty'),
            data.get('ingredients'),
            ','.join(all_photos),
            recipe_id
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Recipe updated successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recipes/<int:recipe_id>', methods=['DELETE'])
def delete_recipe(recipe_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get photos to delete
    cursor.execute('SELECT photos FROM recipes WHERE id = ?', (recipe_id,))
    recipe = cursor.fetchone()
    
    if recipe is None:
        conn.close()
        return jsonify({'error': 'Recipe not found'}), 404
    
    # Delete photo files
    if recipe['photos']:
        photo_paths = recipe['photos'].split(',')
        for photo_path in photo_paths:
            if photo_path.startswith('/api/photos/'):
                filename = photo_path.replace('/api/photos/', '')
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                if os.path.exists(filepath):
                    os.remove(filepath)
    
    # Delete recipe from database
    cursor.execute('DELETE FROM recipes WHERE id = ?', (recipe_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Recipe deleted successfully'})

@app.route('/api/photos/<filename>')
def serve_photo(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/filters', methods=['GET'])
def get_filters():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get unique countries
    cursor.execute('SELECT DISTINCT country FROM recipes ORDER BY country')
    countries = [row['country'] for row in cursor.fetchall()]
    
    # Get unique protein types
    cursor.execute('SELECT DISTINCT protein_type FROM recipes ORDER BY protein_type')
    protein_types = [row['protein_type'] for row in cursor.fetchall()]
    
    conn.close()
    
    return jsonify({
        'countries': countries,
        'protein_types': protein_types
    })

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db_connection()
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
    
    return jsonify({
        'total_recipes': total_recipes,
        'recipes_by_country': recipes_by_country,
        'recipes_by_protein': recipes_by_protein
    })

if __name__ == '__main__':
    init_db()
    print("🌶️ DoggieChef Backend Server Starting...")
    print("📸 Photo uploads will be stored in:", app.config['UPLOAD_FOLDER'])
    print("🌐 Server will run on: http://localhost:5001")
    app.run(debug=True, host='0.0.0.0', port=5001) 