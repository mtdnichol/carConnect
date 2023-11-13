const mongoose = require('mongoose')

const UserMessageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    target: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }],
    text: {
        type: String,
        required: true
    },
    photos: [{
        type: String,
    }],
    createdAt: {
        type: Date,
        default: Date.now()
    },
})

module.exports = UserMessage = mongoose.model('userMessage', UserMessageSchema)