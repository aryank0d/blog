import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import API from '../Api';
import '../styles/dashboard.css';

const QuestionCard = ({ question, currentUser }) => {
    const [voteCount, setVoteCount] = useState(question.votes || 0);
    const [hasVoted, setHasVoted] = useState(question.userHasVoted || false);
    const answerCount = Array.isArray(question.answers) ? question.answers.length : 0;
    const authorName = question.user_id?.username || 'Unknown User';
    const navigate = useNavigate();

    const handleVote = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        try {
            const response = await API.post(`/questions/${question._id}/vote`);
            if (response.data.success) {
                setVoteCount(response.data.votes);
                setHasVoted(true);
            }
        } catch (error) {
            console.error('Error voting:', error);
            alert(error.response?.data?.message || 'Error voting. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatVoteCount = (count) => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        } else if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count;
    };

    const handleTagClick = (tag) => {
        navigate(`/dashboard?tag=${encodeURIComponent(tag)}`);
    };

    return (
        <div className="question-card">
            <div className="question-content">
                <h2 className="question-title">
                    <Link to={`/questions/${question._id}`}>
                        {question.title}
                    </Link>
                </h2>
                
                <p className="question-description">
                    {question.description.length > 150
                        ? `${question.description.substring(0, 150)}...`
                        : question.description}
                </p>
            </div>

            <div className="question-meta">
                <div className="question-author">
                    By {authorName}
                </div>

                <div className="question-tags">
                    {Array.isArray(question.tags) && question.tags.map((tag, index) => (
                        <button
                            key={index}
                            onClick={() => handleTagClick(tag)}
                            className="tag hover:bg-blue-100 cursor-pointer"
                        >
                            #{tag}
                        </button>
                    ))}
                </div>

                <div className="question-stats">
                    <span className="stat">
                        {answerCount} {answerCount === 1 ? 'answer' : 'answers'}
                    </span>
                    <span className="stat">
                        {formatDate(question.created_at)}
                    </span>
                    <button
                        onClick={handleVote}
                        disabled={!currentUser || hasVoted}
                        className={`vote-button ${hasVoted ? 'active' : ''}`}
                        title={!currentUser ? "Please login to vote" : hasVoted ? "Already voted" : "Vote for this question"}
                    >
                        <span className="vote-icon">▲</span>
                        <span className="vote-count">{formatVoteCount(voteCount)}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

QuestionCard.propTypes = {
    question: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        created_at: PropTypes.string.isRequired,
        tags: PropTypes.arrayOf(PropTypes.string),
        answers: PropTypes.array,
        votes: PropTypes.number,
        userHasVoted: PropTypes.bool,
        user_id: PropTypes.shape({
            username: PropTypes.string
        })
    }).isRequired,
    currentUser: PropTypes.object
};

export default QuestionCard;



