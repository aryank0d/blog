const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
    question_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Question', 
        required: true 
    },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    }
});


VoteSchema.index({ question_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);
