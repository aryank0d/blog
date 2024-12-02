import React, { useState } from 'react';
import PropTypes from 'prop-types';
import API from '../Api';
import '../styles/dashboard.css';

const AnswerCard = ({ answer, currentUser, questionAuthorId, onDelete, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(answer.answer_text);
    const [voteCount, setVoteCount] = useState(answer.voteCount || 0);
    const [userVoteStatus, setUserVoteStatus] = useState(answer.userVoteStatus || 'none');
    const [isApproved, setIsApproved] = useState(answer.isApproved || false);
    const authorUsername = answer.user_id?.username || answer.author || 'Unknown User';
    const authorId = answer.user_id?._id;

    const canModify = currentUser && (
        currentUser._id === authorId || 
        currentUser._id === questionAuthorId
    );

    const canApprove = currentUser && currentUser._id === questionAuthorId;

    const handleApproveAnswer = async () => {
        try {
            const response = await API.post(`/answers/${answer._id}/approve`);
            if (response.data.success) {
                setIsApproved(true);
            }
        } catch (error) {
            console.error('Error approving answer:', error);
            alert(error.response?.data?.message || 'Error approving answer');
        }
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        await onEdit(answer._id, editedText);
        setIsEditing(false);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleVote = async (voteType) => {
        if (!currentUser) {
            alert('Please login to vote');
            return;
        }

        try {
            const response = await API.post(`/answers/${answer._id}/vote`, {
                voteType: voteType
            });

            if (response.data.success) {
                setVoteCount(response.data.voteCount);
                setUserVoteStatus(response.data.userVoteStatus);
            }
        } catch (error) {
            console.error('Error voting:', error);
            alert(error.response?.data?.message || 'Error voting');
        }
    };

    return (
        <div className="answer-card">
            <div className="answer-status">
                {isApproved ? (
                    <div className="approved-badge">
                        <svg className="approved-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approved Answer
                    </div>
                ) : canApprove && (
                    <button
                        onClick={handleApproveAnswer}
                        className="approve-button"
                        title="Mark as approved answer"
                    >
                        Mark as Approved
                    </button>
                )}
            </div>

            <div className="answer-header">
                <div className="answer-author">
                    <div className="author-avatar">
                        {authorUsername[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="author-info">
                        <span className="author-name">{authorUsername}</span>
                        <span className="answer-date">{formatDate(answer.created_at)}</span>
                    </div>
                </div>
            </div>

            <div className="answer-content">
                {isEditing ? (
                    <form onSubmit={handleSubmitEdit}>
                        <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            rows="4"
                            placeholder="Edit your answer..."
                        />
                        <div className="form-buttons">
                            <button type="submit" className="edit-button">
                                Save
                            </button>
                            <button 
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="delete-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <p>{answer.answer_text}</p>
                )}
            </div>

            <div className="answer-actions">
                <div className="vote-buttons">
                    <button
                        onClick={() => handleVote('up')}
                        disabled={!currentUser}
                        className={`vote-button ${userVoteStatus === 'up' ? 'active' : ''}`}
                        title={currentUser ? "Upvote" : "Login to vote"}
                    >
                        ▲
                    </button>
                    <span className="vote-count">{voteCount}</span>
                    <button
                        onClick={() => handleVote('down')}
                        disabled={!currentUser}
                        className={`vote-button ${userVoteStatus === 'down' ? 'active' : ''}`}
                        title={currentUser ? "Downvote" : "Login to vote"}
                    >
                        ▼
                    </button>
                </div>

                {canModify && (
                    <div className="edit-delete-buttons">
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="edit-button"
                        >
                            Edit
                        </button>
                        <button 
                            onClick={() => onDelete(answer._id)}
                            className="delete-button"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

AnswerCard.propTypes = {
    answer: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        answer_text: PropTypes.string.isRequired,
        created_at: PropTypes.string.isRequired,
        voteCount: PropTypes.number,
        userVoteStatus: PropTypes.string,
        isApproved: PropTypes.bool,
        user_id: PropTypes.shape({
            _id: PropTypes.string,
            username: PropTypes.string
        }),
        author: PropTypes.string
    }).isRequired,
    currentUser: PropTypes.object,
    questionAuthorId: PropTypes.string,
    onDelete: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired
};

export default AnswerCard;
