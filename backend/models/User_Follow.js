const mongoose = require('mongoose')

const UserFollowSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    target: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    friend: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = _UserFollow = mongoose.model('userFollow', UserFollowSchema)