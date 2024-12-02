import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../styles/navbar.css';

const Navbar = ({ isAuthenticated, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const commonTags = ['javascript', 'react', 'node.js', 'python', 'java', 'css'];

  useEffect(() => {
    if (location.pathname === '/dashboard' || location.pathname === '/') {
      const timer = setTimeout(() => {
        if (searchTerm.trim()) {
          const isTagSearch = searchTerm.startsWith('#');
          const searchQuery = isTagSearch ? searchTerm.substring(1) : searchTerm;
          navigate(`/dashboard?${isTagSearch ? 'tag' : 'search'}=${encodeURIComponent(searchQuery)}`);
        } else {
          navigate('/dashboard');
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [searchTerm, navigate, location.pathname]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowTagSuggestions(value.startsWith('#'));
  };

  const handleTagClick = (tag) => {
    setSearchTerm(`#${tag}`);
    setShowTagSuggestions(false);
  };

  return (
    <>
      <div className="nav-spacer"></div>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/dashboard" className="navbar-brand">
            Forum
          </Link>

          <div className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Search questions or use # for tags..."
              className="search-input"
            />

            {showTagSuggestions && (
              <div className="tag-suggestions">
                {commonTags
                  .filter(tag => tag.includes(searchTerm.substring(1).toLowerCase()))
                  .map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className="tag-suggestion-item"
                    >
                      #{tag}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="nav-links">
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            
            {isAuthenticated ? (
              <button onClick={onLogout} className="logout-button">
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="nav-button">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

Navbar.propTypes = {
  isAuthenticated: PropTypes.bool,
  onLogout: PropTypes.func
};

export default Navbar; 

