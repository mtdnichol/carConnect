const mongoose = require('mongoose')

const GroupPostSchema = new mongoose.Schema({
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
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'car'
    },
    location: {
        type: String
    },
    photos: [{
        type: String,
    }],
    text: {
        type: String,
    },
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

module.exports = _GroupPost = mongoose.model('groupPost', GroupPostSchema)