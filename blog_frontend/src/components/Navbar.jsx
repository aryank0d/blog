import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import API from '../Api';
import '../styles/navbar.css';

const Navbar = ({ isAuthenticated, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (isAuthenticated) {
        try {
          const response = await API.get('/auth/current-user');
          setCurrentUser(response.data);
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      } else {
        setCurrentUser(null);
      }
    };

    fetchCurrentUser();
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchTerm || searchTerm.trim() === '' || searchTerm === '#') {
      navigate('/dashboard');
      return;
    }

    const isTagSearch = searchTerm.startsWith('#');
    const searchQuery = isTagSearch ? searchTerm.substring(1) : searchTerm;
    
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set(isTagSearch ? 'tag' : 'search', searchQuery.trim());
      params.set('page', '1');
      navigate(`/dashboard?${params.toString()}`);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    if (!newValue || newValue.trim() === '') {
      navigate('/dashboard');
    }
  };

  return (
    <>
      <div className="nav-spacer"></div>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/dashboard" className="navbar-brand">
            Forum
          </Link>

          <form onSubmit={handleSearch} className="search-container">
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Search questions or use # for tags..."
              className="search-input"
            />
            <button type="submit" className="search-button">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className="search-icon"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </button>
          </form>

          <div className="nav-links">
            {currentUser && (
              <span className="welcome-text">
                Welcome, {currentUser.username}!
              </span>
            )}
            
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

