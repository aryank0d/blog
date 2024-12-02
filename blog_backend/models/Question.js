const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

QuestionSchema.virtual('answers', {
    ref: 'Answer',
    localField: '_id',
    foreignField: 'question_id',
    options: { sort: { created_at: -1 } }
});

QuestionSchema.virtual('votes', {
    ref: 'Vote',
    localField: '_id',
    foreignField: 'question_id',
    count: true
});

module.exports = mongoose.model('Question', QuestionSchema);
