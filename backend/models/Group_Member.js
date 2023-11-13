const mongoose = require('mongoose')

const GroupMemberSchema = new mongoose.Schema({
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
    isMember: {
        type: Boolean,
        default: true
    },
    role: {
        type: Number,
        default: 1,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = _GroupMember = mongoose.model('groupMember', GroupMemberSchema)