import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, ArrowRight, Heart, Star, Users } from 'lucide-react';

const WelcomePage = () => {
  return (
    <div className="welcome-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <ChefHat className="hero-icon" />
              DOGGIE CHEF
            </h1>
            <p className="hero-subtitle">
              Delicious meals prepared by Happy Doggie
            </p>
            <div className="hero-buttons">
              <Link to="/recipes" className="btn btn-primary-hero">
                View Recipes
                <ArrowRight size={20} />
              </Link>
              <Link to="/add" className="btn btn-secondary-hero">
                Add Recipe
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose Doggie Chef?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Heart size={32} />
              </div>
              <h3>Made with Love</h3>
              <p>Every recipe is crafted with care for your furry friend's health and happiness.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Star size={32} />
              </div>
              <h3>Premium Quality</h3>
              <p>Only the finest ingredients and time-tested recipes for your beloved companion.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Users size={32} />
              </div>
              <h3>Community Driven</h3>
              <p>Share and discover recipes from fellow dog lovers around the world.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Cooking?</h2>
            <p>Join thousands of happy dogs and their owners who trust Doggie Chef</p>
            <div className="cta-buttons">
              <Link to="/recipes" className="btn btn-primary-cta">
                Explore Recipes
              </Link>
              <Link to="/stats" className="btn btn-secondary-cta">
                View Statistics
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WelcomePage; 