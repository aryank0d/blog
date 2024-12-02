const express = require('express');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const authMiddleware = require('../middlewares/auth');
const Vote = require('../models/Vote');
const router = express.Router();

router.use((req, res, next) => {
    console.log(`Received ${req.method} request to ${req.path}`);
    console.log('Request body:', req.body);
    next();
});

router.get('/questions', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search || '';
        const tagFilter = req.query.tag || '';

        let filter = {};
        
        if (searchQuery) {
            filter.$or = [
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        if (tagFilter) {
            filter.tags = { $regex: new RegExp(tagFilter, 'i') };
        }

        console.log('Search filter:', filter);

        const [questions, total] = await Promise.all([
            Question.find(filter)
                .populate('user_id', 'username')
                .populate({
                    path: 'answers',
                    select: '_id'
                })
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Question.countDocuments(filter)
        ]);

        console.log('Found questions:', questions.length);

        const formattedQuestions = await Promise.all(questions.map(async (question) => {
            const [voteCount, userVote] = await Promise.all([
                Vote.countDocuments({ question_id: question._id }),
                req.user ? Vote.findOne({ 
                    question_id: question._id, 
                    user_id: req.user.id 
                }) : null
            ]);

            return {
                ...question,
                votes: voteCount,
                userHasVoted: !!userVote,
                answers: question.answers || []
            };
        }));

        res.status(200).json({
            questions: formattedQuestions,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error('Error fetching questions:', err);
        res.status(500).json({ message: 'Error fetching questions.', error: err.message });
    }
});


router.post('/questions', authMiddleware, async (req, res) => {
    console.log('Received question creation request');
    console.log('Request body:', req.body);
    console.log('Authenticated user:', req.user);

    const { title, description, tags } = req.body;

    if (!title || !description || !tags) {
        return res.status(400).json({
            message: 'All fields (title, description, and tags) are required.',
            receivedData: req.body
        });
    }

    try {

        const tagsArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());

        const question = new Question({
            user_id: req.user.id,
            title,
            description,
            tags: tagsArray,
        });

        await question.save();

        res.status(201).json({
            message: 'Question created successfully.',
            question,
        });
    } catch (err) {
        console.error('Error creating question:', err);
        res.status(400).json({
            message: 'Error creating question',
            error: err.message
        });
    }
});

router.get('/questions/:id', async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('user_id', 'username _id')
            .populate({
                path: 'answers',
                populate: {
                    path: 'user_id',
                    select: 'username _id'
                }
            });

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        console.log('Sending question data:', {
            questionId: question._id,
            authorId: question.user_id._id,
            answers: question.answers.map(a => ({
                id: a._id,
                authorId: a.user_id._id
            }))
        });

        res.json(question);
    } catch (err) {
        console.error('Error fetching question:', err);
        res.status(500).json({ message: 'Error fetching question details' });
    }
});

router.post('/:id/vote', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({ message: 'Please login to vote' });
        }

        console.log('Vote request received:', { questionId: id, userId });

        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const existingVote = await Vote.findOne({
            question_id: id,
            user_id: userId
        });

        if (existingVote) {
            return res.status(400).json({ message: 'You have already voted for this question' });
        }

        const vote = new Vote({
            question_id: id,
            user_id: userId
        });
        await vote.save();

        const voteCount = await Vote.countDocuments({ question_id: id });

        console.log('Vote recorded successfully:', { questionId: id, newCount: voteCount });
        res.json({ success: true, votes: voteCount });
    } catch (err) {
        console.error('Error processing vote:', err);
        res.status(500).json({ message: 'Error processing vote', error: err.message });
    }
});

module.exports = router;