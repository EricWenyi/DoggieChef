import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X, Save, ArrowLeft } from 'lucide-react';
import axios from 'axios';

// Vercel-friendly logging utility
const log = {
  info: (message, data = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    console.log('🔍 [DoggieChef]', JSON.stringify(logEntry));
  },
  error: (message, error = {}, data = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : undefined
      },
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    console.error('❌ [DoggieChef]', JSON.stringify(logEntry));
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🐛 [DoggieChef Debug]', message, data);
    }
  }
};

// Configure axios for development
if (process.env.NODE_ENV === 'development') {
  axios.defaults.baseURL = '';
  axios.defaults.timeout = 10000;
  log.info('Axios configured for development mode');
}

const RecipeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    country: '',
    protein_type: '',
    cooking_time: '',
    difficulty: '',
    ingredients: ''
  });

  const [photos, setPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecipe, setLoadingRecipe] = useState(isEditing);

  const fetchRecipe = async () => {
    try {
      const response = await axios.get(`/api/recipes/${id}`);
      const recipe = response.data;
      
      setFormData({
        title: recipe.title || '',
        description: recipe.description || '',
        country: recipe.country || '',
        protein_type: recipe.protein_type || '',
        cooking_time: recipe.cooking_time || '',
        difficulty: recipe.difficulty || '',
        ingredients: recipe.ingredients || ''
      });
      
      setExistingPhotos(recipe.photos || []);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      alert('Error loading recipe');
    } finally {
      setLoadingRecipe(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      fetchRecipe();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (photoPath) => {
    setExistingPhotos(prev => prev.filter(photo => photo !== photoPath));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      log.info('Recipe submission started', {
        isEditing,
        formData: {
          title: formData.title,
          country: formData.country,
          protein_type: formData.protein_type,
          hasDescription: !!formData.description,
          hasCookingTime: !!formData.cooking_time,
          hasDifficulty: !!formData.difficulty,
          hasIngredients: !!formData.ingredients
        },
        photoCount: photos.length,
        existingPhotoCount: existingPhotos.length
      });
      
      // Validate required fields
      if (!formData.title || !formData.country || !formData.protein_type) {
        const missingFields = [];
        if (!formData.title) missingFields.push('Title');
        if (!formData.country) missingFields.push('Country');
        if (!formData.protein_type) missingFields.push('Protein Type');
        
        const errorMessage = `Please fill in the required fields: ${missingFields.join(', ')}`;
        log.error('Validation failed - missing required fields', new Error(errorMessage), {
          missingFields,
          formData: {
            title: formData.title,
            country: formData.country,
            protein_type: formData.protein_type
          }
        });
        alert(errorMessage);
        setLoading(false);
        return;
      }
      
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          log.debug(`Adding form field ${key}`, { value: formData[key] });
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add new photos
      photos.forEach((photo, index) => {
        log.debug(`Adding photo ${index}`, { 
          name: photo.name, 
          size: photo.size, 
          type: photo.type 
        });
        formDataToSend.append('photos', photo);
      });

      // Log what's being sent (for development only)
      if (process.env.NODE_ENV === 'development') {
        log.debug('FormData contents prepared', {
          fieldCount: Array.from(formDataToSend.keys()).length,
          fields: Array.from(formDataToSend.keys())
        });
      }

      const requestUrl = isEditing ? `/api/recipes/${id}` : '/api/recipes';
      log.info('Sending API request', {
        method: isEditing ? 'PUT' : 'POST',
        url: requestUrl,
        fullUrl: window.location.origin + requestUrl,
        isEditing,
        recipeId: id
      });
      
      let response;
      if (isEditing) {
        response = await axios.put(`/api/recipes/${id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        log.info('Recipe update successful', {
          recipeId: id,
          responseData: response.data,
          status: response.status
        });
        alert('Recipe updated successfully!');
      } else {
        response = await axios.post('/api/recipes', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        log.info('Recipe creation successful', {
          responseData: response.data,
          status: response.status,
          newRecipeId: response.data.id
        });
        alert('Recipe created successfully!');
      }

      navigate('/recipes');
    } catch (error) {
      log.error('Recipe submission failed', error, {
        isEditing,
        recipeId: id,
        formData: {
          title: formData.title,
          country: formData.country,
          protein_type: formData.protein_type
        },
        photoCount: photos.length,
        requestUrl: isEditing ? `/api/recipes/${id}` : '/api/recipes'
      });
      
      let errorMessage = 'Error saving recipe';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage += ': ' + error.response.data;
        } else if (error.response.data.message) {
          errorMessage += ': ' + error.response.data.message;
        }
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      // More detailed error reporting
      if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error - please check your connection';
        log.error('Network error detected', error);
      } else if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found - please try refreshing the page';
        log.error('404 error - endpoint not found', error, {
          requestedUrl: isEditing ? `/api/recipes/${id}` : '/api/recipes'
        });
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error - please try again in a moment';
        log.error('500 error - server error', error);
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingRecipe) {
    return <div className="loading">Loading recipe...</div>;
  }

  return (
    <div className="form-container">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/recipes')}
          className="btn btn-secondary"
          style={{ marginRight: '1rem' }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h2>{isEditing ? 'Edit Recipe' : 'Add New Recipe'}</h2>
      </div>

      {!isEditing && (
        <div style={{ 
          background: 'var(--dark-black)', 
          padding: '1rem', 
          borderRadius: 'var(--border-radius)', 
          marginBottom: '2rem',
          border: '1px solid var(--accent-gray)'
        }}>
          <p style={{ color: 'var(--text-gray)', margin: 0 }}>
            📝 Fill in the required fields marked with <span style={{ color: 'red' }}>*</span> to add your recipe. 
            The Title, Country, and Protein Type are mandatory.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Recipe Title <span style={{ color: 'red' }}>*</span></label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="form-input"
            required
            placeholder="Enter recipe title"
            style={{ 
              borderColor: formData.title ? 'var(--accent-gray)' : 'var(--primary-orange)',
              borderWidth: formData.title ? '2px' : '2px'
            }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Describe how to cook this dish..."
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Country of Origin <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="form-input"
              required
              placeholder="e.g., China, Italy, Japan"
              style={{ 
                borderColor: formData.country ? 'var(--accent-gray)' : 'var(--primary-orange)',
                borderWidth: formData.country ? '2px' : '2px'
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Protein Type <span style={{ color: 'red' }}>*</span></label>
            <select
              name="protein_type"
              value={formData.protein_type}
              onChange={handleInputChange}
              className="form-select"
              required
              style={{ 
                borderColor: formData.protein_type ? 'var(--accent-gray)' : 'var(--primary-orange)',
                borderWidth: formData.protein_type ? '2px' : '2px'
              }}
            >
              <option value="">Select protein type</option>
              <option value="Beef">Beef</option>
              <option value="Chicken">Chicken</option>
              <option value="Pork">Pork</option>
              <option value="Fish">Fish</option>
              <option value="Shrimp">Shrimp</option>
              <option value="Tofu">Tofu</option>
              <option value="Eggs">Eggs</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Cooking Time (minutes)</label>
            <input
              type="number"
              name="cooking_time"
              value={formData.cooking_time}
              onChange={handleInputChange}
              className="form-input"
              placeholder="30"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Select difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Ingredients</label>
          <textarea
            name="ingredients"
            value={formData.ingredients}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="List the ingredients needed..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Photos</label>
          <div className="photo-upload">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
              id="photo-upload"
            />
            <label htmlFor="photo-upload" style={{ cursor: 'pointer' }}>
              <Upload size={24} style={{ marginBottom: '0.5rem' }} />
              <p>Click to upload photos (iPhone optimized)</p>
              <p style={{ fontSize: '0.8rem', color: '#666' }}>
                Supports JPG, PNG, HEIC, WebP
              </p>
            </label>
          </div>

          {/* Existing Photos */}
          {existingPhotos.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4>Existing Photos:</h4>
              <div className="photo-preview">
                {existingPhotos.map((photo, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img 
                      src={photo} 
                      alt={`Recipe ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingPhoto(photo)}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: 'rgba(255, 0, 0, 0.8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Photos */}
          {photos.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4>New Photos:</h4>
              <div className="photo-preview">
                {photos.map((photo, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img 
                      src={URL.createObjectURL(photo)} 
                      alt={`New ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: 'rgba(255, 0, 0, 0.8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            <Save size={16} />
            {loading ? 'Saving...' : (isEditing ? 'Update Recipe' : 'Create Recipe')}
          </button>
          
          <button
            type="button"
            onClick={async () => {
              try {
                log.info('API connection test started', {
                  testUrl: '/api/recipes',
                  timestamp: new Date().toISOString()
                });
                const response = await axios.get('/api/recipes');
                const recipeCount = response.data.length;
                log.info('API connection test successful', {
                  recipeCount,
                  responseStatus: response.status,
                  responseTime: new Date().toISOString()
                });
                alert(`API test successful! Found ${recipeCount} recipes.`);
              } catch (error) {
                log.error('API connection test failed', error, {
                  testUrl: '/api/recipes',
                  timestamp: new Date().toISOString()
                });
                alert('API test failed: ' + error.message);
              }
            }}
            className="btn btn-secondary"
            style={{ backgroundColor: 'var(--accent-gray)' }}
          >
            Test API
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/recipes')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm; 