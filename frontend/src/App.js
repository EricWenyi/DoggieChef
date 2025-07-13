import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import WelcomePage from './components/WelcomePage';
import RecipeList from './components/RecipeList';
import RecipeForm from './components/RecipeForm';
import RecipeDetail from './components/RecipeDetail';
import Stats from './components/Stats';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/recipes" element={<RecipeList />} />
            <Route path="/add" element={<RecipeForm />} />
            <Route path="/edit/:id" element={<RecipeForm />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/stats" element={<Stats />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 