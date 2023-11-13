const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        required: true
    },
    text: {
        type: String,
    },
    photos: [{
        type: String,
    }],
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = _Comment = mongoose.model('comment', CommentSchema)