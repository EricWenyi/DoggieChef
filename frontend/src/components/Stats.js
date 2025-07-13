import React, { useState, useEffect } from 'react';
import { BarChart3, Globe, Beef, TrendingUp } from 'lucide-react';
import axios from 'axios';

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  if (!stats) {
    return <div className="empty-state">Error loading statistics</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <BarChart3 size={32} style={{ marginRight: '1rem', color: 'var(--primary-orange)' }} />
        <h1 style={{ margin: 0, color: 'var(--dark-gray)' }}>Recipe Statistics</h1>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total_recipes}</div>
          <div className="stat-label">Total Recipes</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.recipes_by_country.length}</div>
          <div className="stat-label">Countries Represented</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.recipes_by_protein.length}</div>
          <div className="stat-label">Protein Types</div>
        </div>
      </div>

      {/* Recipes by Country */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          color: 'var(--dark-gray)', 
          marginBottom: '1.5rem' 
        }}>
          <Globe size={24} style={{ marginRight: '0.5rem', color: 'var(--primary-orange)' }} />
          Recipes by Country
        </h2>
        
        <div className="filter-section">
          {stats.recipes_by_country.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {stats.recipes_by_country.map((item, index) => (
                <div key={item.country} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '1rem',
                  background: 'white',
                  borderRadius: 'var(--border-radius)',
                  boxShadow: 'var(--shadow)'
                }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    background: 'var(--primary-orange)', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    marginRight: '1rem'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--dark-gray)' }}>
                      {item.country}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      {item.count} recipe{item.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ 
                    background: 'var(--cream)', 
                    padding: '0.5rem 1rem', 
                    borderRadius: 'var(--border-radius)',
                    fontWeight: 'bold',
                    color: 'var(--primary-orange)'
                  }}>
                    {Math.round((item.count / stats.total_recipes) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No recipes yet</h3>
              <p>Add some recipes to see statistics!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recipes by Protein Type */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          color: 'var(--dark-gray)', 
          marginBottom: '1.5rem' 
        }}>
          <Beef size={24} style={{ marginRight: '0.5rem', color: 'var(--primary-orange)' }} />
          Recipes by Protein Type
        </h2>
        
        <div className="filter-section">
          {stats.recipes_by_protein.length > 0 ? (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {stats.recipes_by_protein.map((item, index) => (
                <div key={item.protein_type} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '1rem',
                  background: 'white',
                  borderRadius: 'var(--border-radius)',
                  boxShadow: 'var(--shadow)'
                }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    background: 'var(--light-orange)', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    marginRight: '1rem'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--dark-gray)' }}>
                      {item.protein_type}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      {item.count} recipe{item.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ 
                    background: 'var(--cream)', 
                    padding: '0.5rem 1rem', 
                    borderRadius: 'var(--border-radius)',
                    fontWeight: 'bold',
                    color: 'var(--primary-orange)'
                  }}>
                    {Math.round((item.count / stats.total_recipes) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No recipes yet</h3>
              <p>Add some recipes to see statistics!</p>
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      {stats.total_recipes > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: 'var(--dark-gray)', 
            marginBottom: '1.5rem' 
          }}>
            <TrendingUp size={24} style={{ marginRight: '0.5rem', color: 'var(--primary-orange)' }} />
            Insights
          </h2>
          
          <div className="filter-section">
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ 
                padding: '1rem',
                background: 'white',
                borderRadius: 'var(--border-radius)',
                boxShadow: 'var(--shadow)'
              }}>
                <div style={{ fontWeight: 'bold', color: 'var(--dark-gray)', marginBottom: '0.5rem' }}>
                  Most Popular Cuisine
                </div>
                <div style={{ color: '#666' }}>
                  {stats.recipes_by_country[0]?.country || 'N/A'} with {stats.recipes_by_country[0]?.count || 0} recipes
                </div>
              </div>
              
              <div style={{ 
                padding: '1rem',
                background: 'white',
                borderRadius: 'var(--border-radius)',
                boxShadow: 'var(--shadow)'
              }}>
                <div style={{ fontWeight: 'bold', color: 'var(--dark-gray)', marginBottom: '0.5rem' }}>
                  Favorite Protein
                </div>
                <div style={{ color: '#666' }}>
                  {stats.recipes_by_protein[0]?.protein_type || 'N/A'} with {stats.recipes_by_protein[0]?.count || 0} recipes
                </div>
              </div>
              
              <div style={{ 
                padding: '1rem',
                background: 'white',
                borderRadius: 'var(--border-radius)',
                boxShadow: 'var(--shadow)'
              }}>
                <div style={{ fontWeight: 'bold', color: 'var(--dark-gray)', marginBottom: '0.5rem' }}>
                  Recipe Diversity
                </div>
                <div style={{ color: '#666' }}>
                  {stats.recipes_by_country.length} different countries and {stats.recipes_by_protein.length} protein types
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats; 