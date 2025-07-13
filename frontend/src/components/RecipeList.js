import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [filters, setFilters] = useState({});
  const [availableFilters, setAvailableFilters] = useState({ countries: [], protein_types: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFilters = async () => {
    try {
      const response = await axios.get('/api/filters');
      setAvailableFilters(response.data);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  useEffect(() => {
    fetchFilters();
    fetchRecipes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchRecipes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.country) params.append('country', filters.country);
      if (filters.protein_type) params.append('protein_type', filters.protein_type);
      
      const response = await axios.get(`/api/recipes?${params}`);
      setRecipes(response.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleDelete = async (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await axios.delete(`/api/recipes/${recipeId}`);
        fetchRecipes();
      } catch (error) {
        console.error('Error deleting recipe:', error);
      }
    }
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading recipes...</div>;
  }

  return (
    <div>
      <div className="filter-section">
        <div className="filter-row">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
              className="form-input"
            />
          </div>
          
          <select
            className="filter-select"
            value={filters.country || ''}
            onChange={(e) => handleFilterChange('country', e.target.value)}
          >
            <option value="">All Countries</option>
            {availableFilters.countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          
          <select
            className="filter-select"
            value={filters.protein_type || ''}
            onChange={(e) => handleFilterChange('protein_type', e.target.value)}
          >
            <option value="">All Proteins</option>
            {availableFilters.protein_types.map(protein => (
              <option key={protein} value={protein}>{protein}</option>
            ))}
          </select>
          
          <button
            className="btn btn-secondary"
            onClick={() => setFilters({})}
          >
            <Filter size={16} />
            Clear Filters
          </button>
        </div>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="empty-state">
          <h3>No recipes found</h3>
          <p>Try adjusting your search or filters, or add a new recipe!</p>
          <Link to="/add" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Add Your First Recipe
          </Link>
        </div>
      ) : (
        <div className="recipe-grid">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="card">
              {recipe.photos && recipe.photos.length > 0 && (
                <img 
                  src={recipe.photos[0]} 
                  alt={recipe.title}
                  className="card-image"
                />
              )}
              <div className="card-content">
                <h3 className="card-title">{recipe.title}</h3>
                <div className="card-subtitle">
                  <span className="tag">{recipe.country}</span>
                  <span className="tag">{recipe.protein_type}</span>
                </div>
                <p className="card-description">
                  {recipe.description?.substring(0, 100)}
                  {recipe.description?.length > 100 && '...'}
                </p>
                
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/recipe/${recipe.id}`} className="btn btn-primary">
                    <Eye size={16} />
                    View
                  </Link>
                  <Link to={`/edit/${recipe.id}`} className="btn btn-secondary">
                    <Edit size={16} />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="btn btn-danger"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeList; 