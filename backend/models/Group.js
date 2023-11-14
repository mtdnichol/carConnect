const mongoose = require('mongoose')

const GroupSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    isPrivate: {
        type: Boolean,
        required: true
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
})

module.exports = _Group = mongoose.model('group', GroupSchema)