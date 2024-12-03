import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../styles/navbar.css';

const Navbar = ({ isAuthenticated, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const commonTags = ['javascript', 'react', 'node.js', 'python', 'java', 'css'];

  useEffect(() => {
    const searchQuery = searchParams.get('search') || '';
    const tagQuery = searchParams.get('tag') || '';
    if (searchQuery) {
      setSearchTerm(searchQuery);
    } else if (tagQuery) {
      setSearchTerm(`#${tagQuery}`);
    } else {
      setSearchTerm('');
    }
  }, [searchParams]);

  const handleSearch = (value) => {
    if (value.trim()) {
      const isTagSearch = value.startsWith('#');
      const searchQuery = isTagSearch ? value.substring(1) : value;
      
      const params = new URLSearchParams();
      params.set(isTagSearch ? 'tag' : 'search', searchQuery);
      params.set('page', '1');
      
      navigate(`/dashboard?${params.toString()}`);
    } else {
      navigate('/dashboard?page=1');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowTagSuggestions(value.startsWith('#'));
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);
    return () => clearTimeout(timeoutId);
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
              placeholder="Search questions or tags..."
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

