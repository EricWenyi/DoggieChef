import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Clock, ChefHat, MapPin, Beef } from 'lucide-react';
import axios from 'axios';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRecipe = async () => {
    try {
      const response = await axios.get(`/api/recipes/${id}`);
      setRecipe(response.data);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      alert('Error loading recipe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await axios.delete(`/api/recipes/${id}`);
        navigate('/recipes');
      } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Error deleting recipe');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading recipe...</div>;
  }

  if (!recipe) {
    return <div className="empty-state">Recipe not found</div>;
  }

  return (
    <div className="recipe-detail">
      <div style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/recipes')}
            className="btn btn-secondary"
            style={{ marginRight: '1rem' }}
          >
            <ArrowLeft size={16} />
            Back to Recipes
          </button>
          
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, color: 'var(--dark-gray)' }}>{recipe.title}</h1>
            <div style={{ marginTop: '0.5rem' }}>
              <span className="tag">{recipe.country}</span>
              <span className="tag">{recipe.protein_type}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => navigate(`/edit/${recipe.id}`)}
              className="btn btn-primary"
            >
              <Edit size={16} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-danger"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        {/* Photos */}
        {recipe.photos && recipe.photos.length > 0 && (
          <div className="recipe-images">
            {recipe.photos.map((photo, index) => (
              <img 
                key={index}
                src={photo} 
                alt={`${recipe.title} recipe step ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Recipe Info */}
        <div className="recipe-info">
          {recipe.cooking_time && (
            <div className="info-item">
              <div className="info-label">
                <Clock size={16} style={{ marginRight: '0.5rem' }} />
                Cooking Time
              </div>
              <div className="info-value">{recipe.cooking_time} minutes</div>
            </div>
          )}
          
          {recipe.difficulty && (
            <div className="info-item">
              <div className="info-label">
                <ChefHat size={16} style={{ marginRight: '0.5rem' }} />
                Difficulty
              </div>
              <div className="info-value">{recipe.difficulty}</div>
            </div>
          )}
          
          <div className="info-item">
            <div className="info-label">
              <MapPin size={16} style={{ marginRight: '0.5rem' }} />
              Country
            </div>
            <div className="info-value">{recipe.country}</div>
          </div>
          
          <div className="info-item">
            <div className="info-label">
              <Beef size={16} style={{ marginRight: '0.5rem' }} />
              Protein
            </div>
            <div className="info-value">{recipe.protein_type}</div>
          </div>
        </div>

        {/* Description */}
        {recipe.description && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ color: 'var(--dark-gray)', marginBottom: '1rem' }}>Cooking Instructions</h3>
            <div style={{ 
              background: 'var(--cream)', 
              padding: '1.5rem', 
              borderRadius: 'var(--border-radius)',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap'
            }}>
              {recipe.description}
            </div>
          </div>
        )}

        {/* Ingredients */}
        {recipe.ingredients && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ color: 'var(--dark-gray)', marginBottom: '1rem' }}>Ingredients</h3>
            <div style={{ 
              background: 'var(--cream)', 
              padding: '1.5rem', 
              borderRadius: 'var(--border-radius)',
              lineHeight: '1.8',
              whiteSpace: 'pre-wrap'
            }}>
              {recipe.ingredients}
            </div>
          </div>
        )}

        {/* Created/Updated Info */}
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: 'var(--light-gray)', 
          borderRadius: 'var(--border-radius)',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <div>Created: {new Date(recipe.created_at).toLocaleDateString()}</div>
          {recipe.updated_at !== recipe.created_at && (
            <div>Updated: {new Date(recipe.updated_at).toLocaleDateString()}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail; 