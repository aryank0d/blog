import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import QuestionDetails from './pages/QuestionDetails.jsx'; 
import { setAuthToken } from './Api';
import API from './Api';
import './App.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          setAuthToken(token);
          await API.get('/auth/current-user');
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Token validation failed:', err);
          localStorage.removeItem('token');
          setAuthToken(null);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setAuthToken(token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setIsAuthenticated(false);
    window.location.href = '/login'; 
  };

  return (
    <Router>
      <div className="relative">
        <Navbar 
          isAuthenticated={isAuthenticated} 
          onLogout={handleLogout}
        />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route 
            path="/login" 
            element={<Login onLogin={handleLogin} />} 
          />
          <Route path="/register" element={<Register />} />
          <Route path="/questions/:id" element={<QuestionDetails />} />
        </Routes>
      </div>
    </Router>
  );
}
