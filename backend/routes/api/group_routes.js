const express = require('express');
const router = express.Router();

// Packages
const {validationResult, check} = require("express-validator");

// Dependencies
const auth = require('../../middleware/auth')

// Models
const Group = require('../../models/Group');
const GroupMember = require('../../models/Group_Member');
const GroupComment = require('../../models/Group_Comment');
const GroupMessage = require('../../models/Group_Message');
const GroupPost = require('../../models/Group_Post');

// @route     GET api/group
// @desc      Get all groups
// @access    Private
router.get('/', auth, async (req, res) => {
    try {
        const groups = await Group.find();

        res.json(groups);
    } catch (e) {
        console.error(e.message);
        return res.status(500).send('Server Error');
    }
})

// @route     GET api/group/:id
// @desc      Get group by ID
// @access    Private
router.get('/:id', auth, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        res.json(group);
    } catch (e) {
        console.error(e.message);
        return res.status(500).send('Server Error');
    }
})

// @route     POST api/group
// @desc      Create a group
// @access    Private
router.post('/', auth, [
    check('name', 'Group name is required').not().isEmpty(),
    check('private', 'Group name is required').isBoolean().not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);

    // Errors with input exist, send back bad request
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const {
        name,
        isPrivate,
        description,
        location
    } = req.body;

    try {
        let group = await Group.findOne({ name });

        if (group)
            return res.status(400).json({ errors: [{ msg: 'Group with name already exists'}] });

        group = new Group({
            name,
            isPrivate,
            description,
            location
        });

        await group.save();

        return res.json(group);
    } catch (e) {
        console.error(e.message);
        return res.status(500).send('Server Error');
    }
})

// @route     PUT api/group/:id
// @desc      Edit a group
// @access    Private
router.put('/:id', auth, [
    check('name', 'Group name is required').not().isEmpty(),
    check('private', 'Group name is required').isBoolean().not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);

    // Errors with input exist, send back bad request
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const {
        name,
        isPrivate,
        description,
        location
    } = req.body;

    try {
        // Check that the provided group exists
        let group = await Group.findById(req.params.id);

        if (!group)
            return res.status(400).json({ errors: [{ msg: 'Group does not exist'}] });

        // Validate that user has permissions to perform the edit (only admins can edit group)
        let isAdmin = await GroupMember.findOne({
            user: req.user.id,
            group: req.params.id,
            role: 3
        });

        if (!isAdmin)
            return res.status(400).json({ errors: [{ msg: 'You do not have permission to edit this group'}] });

        // Check if the name is being changed, verify that no other groups with that name exist
        if (name !== group.name) {
            let nameCheck = await Group.findOne({ name });

            if (nameCheck)
                return res.status(400).json({ errors: [{ msg: 'Group with new name already exists'}] });
        }

        const groupFields = {};
        if (name) groupFields.name = name;
        if (isPrivate) groupFields.isPrivate = isPrivate;
        if (description) groupFields.description = description;
        if (location) groupFields.location = location;

        group = await Group.findByIdAndUpdate(
            req.params.id,
            { $set: groupFields },
            { new: true });

        return res.json(group);
    } catch (e) {
        console.error(e.message);
        return res.status(500).send('Server Error');
    }
})

// @route     DELETE api/group/:id
// @desc      Delete a group
// @access    Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        // Check that the group exists
        if (!group)
            return res.status(400).json({ errors: [{ msg: 'Group does not exist'}] });

        // Check that the user owns the group
        if (req.user.id !== group.createdBy)
            return res.status(400).json({ errors: [{ msg: 'Group does not exist'}] });

        // Proceed to delete group, and other involved entries
        await Promise.all([
            Group.findByIdAndDelete(req.params.id),
            GroupComment.deleteMany({ group: req.params.id }),
            GroupPost.deleteMany({ group: req.params.id }),
            GroupMessage.deleteMany({ group: req.params.id }),
            GroupMember.deleteMany({ group: req.params.id }),
        ]);

        return res.json({ msg: 'Group Deleted' })
    } catch (e) {
        console.error(e.message);
        return res.status(500).send('Server Error');
    }
})

module.exports = router;