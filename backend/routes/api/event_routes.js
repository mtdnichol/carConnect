const express = require('express');
const router = express.Router();

// Packages
const {validationResult, check} = require("express-validator");

// Dependencies
const auth = require('../../middleware/auth')
// Models
const Event = require("../../models/Event");
const Group = require("../../models/Group");
const User = require("../../models/User");

// @route     GET api/event
// @desc      Get all events
// @access    Private
router.get('/', auth, async (req, res) => {
    try {
        const events = await Event.find();

        res.json(events);
    } catch (e) {
        console.error(e.message);
        return res.status(500).send('Server Error');
    }
})

// @route     GET api/event/group/:id
// @desc      Get events linked to a group
// @access    Private
router.get('/group/:id', auth, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group)
            return res.status(400).json({ errors: [{ msg: 'Group does not exist'}] });

        const events = await Event.find({
            group: req.params.id
        });

        res.json(events);
    } catch (e) {
        console.error(e.message);
        return res.status(500).send('Server Error');
    }
})

// @route     GET api/event/user/:id
// @desc      Get events linked to a group
// @access    Private
router.get('/user/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user)
            return res.status(400).json({ errors: [{ msg: 'User does not exist'}] });

        const events = await Event.find({
            createdBy: req.params.id
        });

        res.json(events);
    } catch (e) {
        console.error(e.message);
        return res.status(500).send('Server Error');
    }
})

// @route     POST api/event
// @desc      Create an event
// @access    Private
router.post('/', auth, [
    check('group', 'Group id is required').not().isEmpty(),
    check('name', 'Event name is required').not().isEmpty(),
    check('date', 'Event date is required').isDate(),
], async (req, res) => {
    const errors = validationResult(req);

    // Errors with input exist, send back bad request
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const {
        group,
        name,
        description,
        location,
        eventDate
    } = req.body;

    try {
        let event = new Event({
            createdBy: req.user.id,
            group,
            name,
            description,
            location,
            eventDate
        });

        await event.save();

        res.json(event);
    } catch (e) {
        console.error(e.message);
        return res.status(500).send('Server Error');
    }
})

module.exports = router;