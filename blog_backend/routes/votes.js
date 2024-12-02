const express = require('express');
const Vote = require('../models/Vote');
const Answer = require('../models/Answer');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.post('/answers/:id/vote', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { vote_value } = req.body;

    if (![1, -1].includes(vote_value)) {
        return res.status(400).json({ message: 'Invalid vote value.' });
    }

    try {
        const existingVote = await Vote.findOne({ answer_id: id, user_id: req.user.id });

        if (existingVote) {
            existingVote.vote_value = vote_value;
            await existingVote.save();
        } else {
            const vote = new Vote({ answer_id: id, user_id: req.user.id, vote_value });
            await vote.save();
        }

        const votesSum = await Vote.aggregate([
            { $match: { answer_id: id } },
            { $group: { _id: null, totalVotes: { $sum: '$vote_value' } } },
        ]);

        const totalVotes = votesSum.length > 0 ? votesSum[0].totalVotes : 0;
        await Answer.findByIdAndUpdate(id, { votes: totalVotes });

        res.status(200).json({ message: 'Vote recorded successfully.', totalVotes });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/answers/:id/vote', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const vote = await Vote.findOneAndDelete({ answer_id: id, user_id: req.user.id });
        if (!vote) return res.status(404).json({ message: 'Vote not found.' });

        const votesSum = await Vote.aggregate([
            { $match: { answer_id: id } },
            { $group: { _id: null, totalVotes: { $sum: '$vote_value' } } },
        ]);

        const totalVotes = votesSum.length > 0 ? votesSum[0].totalVotes : 0;
        await Answer.findByIdAndUpdate(id, { votes: totalVotes });

        res.status(200).json({ message: 'Vote removed successfully.', totalVotes });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
