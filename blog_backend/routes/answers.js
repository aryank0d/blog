const express = require('express');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.post('/questions/:question_id/answers', authMiddleware, async (req, res) => {
    const { question_id } = req.params;
    const { answer_text } = req.body;

    try {
        const question = await Question.findById(question_id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const answer = new Answer({ 
            question_id, 
            user_id: req.user.id, 
            answer_text 
        });
        
        await answer.save();

        await answer.populate('user_id', 'username _id');

        const formattedAnswer = {
            _id: answer._id,
            answer_text: answer.answer_text,
            user_id: {
                _id: answer.user_id._id,
                username: answer.user_id.username
            },
            created_at: answer.created_at,
            votes: answer.votes,
            isApproved: answer.isApproved
        };
        
        res.status(201).json({ 
            message: 'Answer submitted successfully.',
            answer: formattedAnswer
        });
    } catch (err) {
        console.error('Error creating answer:', err);
        res.status(400).json({ 
            message: err.message || 'Error creating answer',
            error: err 
        });
    }
});

router.put('/answers/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { answer_text } = req.body;

        console.log('Updating answer:', id, answer_text);

        const answer = await Answer.findById(id);
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        if (answer.user_id.toString() !== req.user.id) {
            const question = await Question.findById(answer.question_id);
            if (question.user_id.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to edit this answer' });
            }
        }


        answer.answer_text = answer_text;
        await answer.save();

        await answer.populate('user_id', 'username');

        const formattedAnswer = {
            _id: answer._id,
            answer_text: answer.answer_text,
            user_id: {
                _id: answer.user_id._id,
                username: answer.user_id.username
            },
            created_at: answer.created_at
        };

        res.json({ message: 'Answer updated successfully', answer: formattedAnswer });
    } catch (err) {
        console.error('Error updating answer:', err);
        res.status(500).json({ message: 'Error updating answer', error: err.message });
    }
});

router.delete('/answers/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting answer:', id);

        const answer = await Answer.findById(id);
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        if (answer.user_id.toString() !== req.user.id) {
            const question = await Question.findById(answer.question_id);
            if (question.user_id.toString() !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to delete this answer' });
            }
        }

        await answer.deleteOne();
        res.json({ message: 'Answer deleted successfully' });
    } catch (err) {
        console.error('Error deleting answer:', err);
        res.status(500).json({ message: 'Error deleting answer', error: err.message });
    }
});

router.post('/:id/vote', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { voteType } = req.body;
        const userId = req.user.id;

        const answer = await Answer.findById(id);
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        if (!answer.upvotes) answer.upvotes = [];
        if (!answer.downvotes) answer.downvotes = [];

        const hasUpvoted = answer.upvotes.some(id => id.toString() === userId);
        const hasDownvoted = answer.downvotes.some(id => id.toString() === userId);

        answer.upvotes = answer.upvotes.filter(id => id.toString() !== userId);
        answer.downvotes = answer.downvotes.filter(id => id.toString() !== userId);

        let newVoteStatus = 'none';

        if (voteType === 'up' && !hasUpvoted) {
            answer.upvotes.push(userId);
            newVoteStatus = 'up';
        } else if (voteType === 'down' && !hasDownvoted) {
            answer.downvotes.push(userId);
            newVoteStatus = 'down';
        }

        await answer.save();

        const voteCount = answer.upvotes.length - answer.downvotes.length;

        res.json({ 
            success: true, 
            voteCount,
            userVoteStatus: newVoteStatus
        });
    } catch (err) {
        console.error('Error processing vote:', err);
        res.status(500).json({ message: 'Error processing vote' });
    }
});

router.post('/:id/approve', authMiddleware, async (req, res) => {
    try {
        const answer = await Answer.findById(req.params.id);
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        const question = await Question.findById(answer.question_id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        if (question.user_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the question author can approve answers' });
        }

        answer.isApproved = true;
        await answer.save();

        res.json({ success: true, message: 'Answer marked as approved' });
    } catch (err) {
        console.error('Error approving answer:', err);
        res.status(500).json({ message: 'Error approving answer' });
    }
});

module.exports = router;
