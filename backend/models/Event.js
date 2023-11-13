const mongoose = require('mongoose')

const EventSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    eventDate: {
      type: Date,
      required: true
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
    },
})

module.exports = _event = mongoose.model('event', EventSchema)