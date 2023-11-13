const mongoose = require('mongoose')

const GroupMessageSchema = new mongoose.Schema({
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
    text: {
        type: String,
    },
    photos: [{
        type: String,
    }],
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = _GroupMessage = mongoose.model('groupMessage', GroupMessageSchema)