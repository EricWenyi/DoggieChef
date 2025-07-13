import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X, Save, ArrowLeft } from 'lucide-react';
import axios from 'axios';

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

  useEffect(() => {
    if (isEditing) {
      fetchRecipe();
    }
  }, [id]);

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
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add new photos
      photos.forEach(photo => {
        formDataToSend.append('photos', photo);
      });

      if (isEditing) {
        await axios.put(`/api/recipes/${id}`, formDataToSend);
        alert('Recipe updated successfully!');
      } else {
        await axios.post('/api/recipes', formDataToSend);
        alert('Recipe created successfully!');
      }

      navigate('/');
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Error saving recipe');
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
          onClick={() => navigate('/')}
          className="btn btn-secondary"
          style={{ marginRight: '1rem' }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h2>{isEditing ? 'Edit Recipe' : 'Add New Recipe'}</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Recipe Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="form-input"
            required
            placeholder="Enter recipe title"
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
            <label className="form-label">Country of Origin *</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="form-input"
              required
              placeholder="e.g., China, Italy, Japan"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Protein Type *</label>
            <select
              name="protein_type"
              value={formData.protein_type}
              onChange={handleInputChange}
              className="form-select"
              required
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
            onClick={() => navigate('/')}
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