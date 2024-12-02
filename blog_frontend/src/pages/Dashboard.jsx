import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../Api';
import QuestionCard from '../components/QuestionCard';
import Pagination from '../components/Pagination';
import '../styles/dashboard.css';
import '../styles/pagination.css';

const Dashboard = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [formError, setFormError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [questionsPerPage] = useState(4); 
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [tagFilter, setTagFilter] = useState('');
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const searchQuery = searchParams.get('search') || '';
                const tagQuery = searchParams.get('tag') || '';
                
                const [questionsResponse, userResponse] = await Promise.all([
                    API.get('/questions/questions', {
                        params: {
                            page: currentPage,
                            limit: questionsPerPage,
                            search: searchQuery,
                            tag: tagQuery
                        }
                    }),
                    API.get('/auth/current-user').catch(() => null)
                ]);

                if (questionsResponse.data && questionsResponse.data.questions) {
                    setQuestions(questionsResponse.data.questions);
                    setTotalQuestions(questionsResponse.data.total);
                } else {
                    setQuestions([]);
                    setTotalQuestions(0);
                }
                
                if (userResponse?.data) {
                    setCurrentUser(userResponse.data);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load questions. Please try again later.');
                setQuestions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, questionsPerPage, searchParams]);

    const handleAskQuestionClick = () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setShowForm(!showForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (!title || !description || !tags) {
            setFormError('All fields are required.');
            return;
        }

        try {
            const tagsArray = tags.split(',').map(tag => tag.trim());
            await API.post('/questions/questions', {
                title,
                description,
                tags: tagsArray
            });

            setTitle('');
            setDescription('');
            setTags('');
            setFormError('');
            setShowForm(false);

            setCurrentPage(1);
            const updatedQuestionsResponse = await API.get('/questions/questions', {
                params: {
                    page: 1,
                    limit: questionsPerPage,
                    search: searchTerm,
                    tag: tagFilter
                }
            });

            if (updatedQuestionsResponse.data && updatedQuestionsResponse.data.questions) {
                setQuestions(updatedQuestionsResponse.data.questions);
                setTotalQuestions(updatedQuestionsResponse.data.total);
            }
        } catch (err) {
            console.error('Error creating question:', err);
            setFormError(err.response?.data?.message || 'Failed to create question. Please try again.');
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(1); 
    };

    const handleTagFilter = (tag) => {
        setTagFilter(tag);
        setCurrentPage(1); 
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="text-center">
                    <p className="dashboard-title">Loading questions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="text-center">
                    <p className="text-red-500">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="ask-button"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {currentUser && (
                <div className="welcome-message">
                    <h2>Welcome, <span className="username">{currentUser.username}</span>!</h2>
                </div>
            )}
            <div className="dashboard-header">
                <h1 className="dashboard-title">Questions</h1>
                <button
                    onClick={handleAskQuestionClick}
                    className={`ask-button ${!currentUser && 'disabled'}`}
                >
                    {!currentUser ? 'Login to Ask' : (showForm ? 'Cancel' : 'Ask Question')}
                </button>
            </div>

            {showForm && currentUser && (
                <div className="question-form">
                    <h2 className="form-title">Ask a Question</h2>
                    {formError && <p className="text-red-500 mb-4">{formError}</p>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-group">
                            <label className="form-label">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="form-input"
                                rows="4"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tags (comma-separated)</label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="form-input"
                                placeholder="e.g., javascript, react, node.js"
                                required
                            />
                        </div>
                        <button type="submit" className="ask-button">
                            Submit Question
                        </button>
                    </form>
                </div>
            )}

            <div className="questions-grid">
                {Array.isArray(questions) && questions.map((question) => (
                    <QuestionCard 
                        key={question._id} 
                        question={question}
                        currentUser={currentUser}
                    />
                ))}
            </div>

            {Array.isArray(questions) && totalQuestions > questionsPerPage && (
                <div className="pagination">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(totalQuestions / questionsPerPage)}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            {Array.isArray(questions) && questions.length === 0 && !loading && (
                <p className="text-center text-gray-600 mt-8">
                    No questions available. Be the first to ask one!
                </p>
            )}
        </div>
    );
};

export default Dashboard;

