const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
    question_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answer_text: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    downvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isApproved: {
        type: Boolean,
        default: false
    }
});

AnswerSchema.index({ question_id: 1, created_at: -1 });

AnswerSchema.virtual('voteCount').get(function() {
    return (this.upvotes?.length || 0) - (this.downvotes?.length || 0);
});

module.exports = mongoose.model('Answer', AnswerSchema);
