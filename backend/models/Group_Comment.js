const mongoose = require('mongoose')

const GroupCommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'group',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'groupPost',
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

module.exports = _GroupComment = mongoose.model('groupComment', GroupCommentSchema)