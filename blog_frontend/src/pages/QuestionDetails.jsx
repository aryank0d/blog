import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../Api';
import AnswerCard from '../components/AnswerCard';
import '../styles/questionDetails.css';

const QuestionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [question, setQuestion] = useState(null);
    const [newAnswer, setNewAnswer] = useState('');
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const questionResponse = await API.get(`/questions/questions/${id}`);
                console.log('Question response:', questionResponse.data);
                setQuestion(questionResponse.data);

                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const userResponse = await API.get('/auth/current-user');
                        console.log('Current user:', userResponse.data);
                        setCurrentUser(userResponse.data);
                    } catch (userError) {
                        console.error('Error fetching user:', userError);
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.response?.data?.message || 'Error loading question details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    const handleSubmitAnswer = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            navigate('/login');
            return;
        }

        try {
            const response = await API.post(`/answers/questions/${id}/answers`, {
                answer_text: newAnswer
            });

            if (response.data && response.data.answer) {
                setQuestion(prev => ({
                    ...prev,
                    answers: [...(prev.answers || []), response.data.answer]
                }));
                setNewAnswer('');
                setError('');
            }
        } catch (err) {
            console.error('Error submitting answer:', err);
            setError(err.response?.data?.message || 'Failed to submit answer');
        }
    };

    const handleDeleteAnswer = async (answerId) => {
        try {
            await API.delete(`/answers/answers/${answerId}`);
            setQuestion(prev => ({
                ...prev,
                answers: prev.answers.filter(a => a._id !== answerId)
            }));
        } catch (err) {
            console.error('Error deleting answer:', err);
            setError('Failed to delete answer. ' + (err.response?.data?.message || ''));
        }
    };

    const handleEditAnswer = async (answerId, newText) => {
        try {
            const response = await API.put(`/answers/answers/${answerId}`, {
                answer_text: newText
            });
            
            if (response.data && response.data.answer) {
                setQuestion(prev => ({
                    ...prev,
                    answers: prev.answers.map(a => 
                        a._id === answerId ? response.data.answer : a
                    )
                }));
            }
        } catch (err) {
            console.error('Error editing answer:', err);
            setError('Failed to edit answer. ' + (err.response?.data?.message || ''));
        }
    };

    return (
        <div className="question-details-container">
            <div className="question-details-content">
                {loading ? (
                    <div className="text-center">
                        <p className="text-xl">Loading...</p>
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <p>{error}</p>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="text-blue-600 hover:text-blue-800 mt-2"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                ) : question ? (
                    <>
                        <div className="question-header">
                            <h1 className="question-title">{question.title}</h1>
                            <div className="question-info">
                                <div className="question-author">
                                    <div className="author-avatar">
                                        {question.user_id?.username?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className="author-details">
                                        <span className="author-name">
                                            {question.user_id?.username || 'Unknown User'}
                                        </span>
                                        <span className="post-date">
                                            {new Date(question.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="question-tags">
                                    {question.tags && question.tags.map((tag, index) => (
                                        <span key={index} className="tag">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <p className="question-description">{question.description}</p>
                        </div>

                        <div className="answers-section">
                            <div className="answers-header">
                                <h2 className="answers-title">Answers</h2>
                                <span className="answer-count">
                                    {question.answers?.length || 0} {question.answers?.length === 1 ? 'Answer' : 'Answers'}
                                </span>
                            </div>

                            <div className="answers-list">
                                {question.answers && question.answers.map((answer) => (
                                    <AnswerCard 
                                        key={answer._id} 
                                        answer={answer}
                                        currentUser={currentUser}
                                        questionAuthorId={question.user_id?._id}
                                        onDelete={handleDeleteAnswer}
                                        onEdit={handleEditAnswer}
                                    />
                                ))}
                            </div>

                            <div className="new-answer-section">
                                <h3 className="new-answer-title">Your Answer</h3>
                                {error && <p className="error-message">{error}</p>}
                                <form onSubmit={handleSubmitAnswer} className="answer-form">
                                    <textarea
                                        value={newAnswer}
                                        onChange={(e) => setNewAnswer(e.target.value)}
                                        placeholder="Write your answer here..."
                                        required
                                    />
                                    <button 
                                        type="submit"
                                        className="submit-answer"
                                        disabled={!currentUser}
                                    >
                                        {currentUser ? 'Submit Answer' : 'Login to Answer'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <p>Question not found</p>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionDetails;
