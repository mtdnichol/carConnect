const mongoose = require('mongoose')

const CarSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    make: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    trim: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    alias: {
        type: String
    },
    avatar: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = _Car = mongoose.model('car', CarSchema)