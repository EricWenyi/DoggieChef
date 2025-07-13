import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChefHat, BarChart3, Plus } from 'lucide-react';

const Header = () => {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <ChefHat size={32} />
          DoggieChef
        </Link>
        
        <nav className="nav-links">
          <Link 
            to="/recipes" 
            className={`nav-link ${location.pathname === '/recipes' ? 'active' : ''}`}
          >
            Recipes
          </Link>
          <Link 
            to="/add" 
            className={`nav-link ${location.pathname === '/add' ? 'active' : ''}`}
          >
            <Plus size={16} />
            Add Recipe
          </Link>
          <Link 
            to="/stats" 
            className={`nav-link ${location.pathname === '/stats' ? 'active' : ''}`}
          >
            <BarChart3 size={16} />
            Stats
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 