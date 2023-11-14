const express = require('express')
const router = express.Router()

// Packages
const { check, validationResult } = require('express-validator')

// Dependencies
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const auth = require('../../middleware/auth')

// Models
const User = require('../../models/User');
const UserFollow = require('../../models/User_Follow');
const UserMessage = require('../../models/User_Message');
const UserPost = require('../../models/User_Post');
const Car = require('../../models/Car');
const UserComment = require('../../models/User_Comment');
const Event = require('../../models/Event');
const Group = require('../../models/Group');
const GroupMember = require('../../models/Group_Member');
const GroupMessage = require('../../models/Group_Message');
const GroupPost = require('../../models/Group_Post');
const GroupComment = require('../../models/Group_Comment');


// @route     POST api/user
// @desc      Register a user
// @access    Public
router.post('/', [
    check('name', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);

    // Errors with input exist, send back bad request
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, password_confirm } = req.body;
    try {
        // Check if user exists
        let user = await User.findOne({ email });

        if (user)
            return res.status(400).json({ errors: [{ msg: 'User already exists'}] });

        // Create the new user
        user = new User({
            name,
            email,
            password
        });

        // Check if password matches
        if (password !== password_confirm)
            return res.status(401).json({ errors: [{ msg: 'Passwords do not match' }] });

        // Hash password
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)

        // Save user
        await user.save();

        // Return JWT
        const payload = {
            user: {
                id: user._id
            }
        }

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: '5 days' },
            (err, token) => {
                if (err) throw err
                res.json({ token })
            }
        )
    } catch (e) {
        console.error(e.message);
        return res.status(500).send('Server Error');
    }
})

// @route     GET api/user
// @desc      Get all users
// @access    Private
router.get('/', auth, async (req, res) => {
    try {
        const users = await User.find().select({
            'email': 0,
            'password': 0
        });

        res.json(users);
    } catch (e) {
        console.error(e.message);
        res.status(500).send('Server Error');
    }
})

// @route     GET api/user/:name
// @desc      Get a user by their name
// @access    Private
router.get('name/:name', auth, async (req, res) => {
    try {
        const user = await User.findOne({
            name: req.params.name
        }).select({
            'email': 0,
            'password': 0
        });

        if (!user)
            return res.status(400).json({ msg: 'User not found' })

        res.json(user);
    } catch (e) {
        console.error(e.message);
        res.status(500).send('Server Error');
    }
})

// @route     GET api/user/:id
// @desc      Get a user by their id
// @access    Private
router.get('id/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select({
            'email': 0,
            'password': 0
        });

        if (!user)
            return res.status(400).json({ msg: 'User not found' })

        res.json(user);
    } catch (e) {
        console.error(e.message);
        res.status(500).send('Server Error');
    }
})

// @route     PUT api/user/
// @desc      Update a user
// @access    Private
router.put('/', auth, async (req, res) => {
    const {
        avatar,
        bio,
        location,
        youtube,
        twitter,
        facebook,
        instagram
    } = req.body;

    const userFields = {};
    userFields.user = req.user.id;
    if (avatar) userFields.avatar = avatar;
    if (bio) userFields.bio = bio;
    if (location) userFields.location = location;

    if (youtube && /^https?:\/\/(?:www\.)?youtube\.com\/(?:user\/|channel\/)?([\w-]+)$/i.test(youtube)) userFields.youtube = youtube; // Regex /^https?:\/\/(?:www\.)?youtube\.com\/(?:user\/|channel\/)?([\w-]{1,})$/i --> YouTube channel's URL
    if (twitter && /^@[A-Za-z0-9_]{1,15}$/.test(twitter)) userFields.twitter = twitter; // Regex ^@[A-Za-z0-9_]{1,15}$ --> match a valid Twitter username
    if (facebook && /^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9]+\/?$/.test(facebook)) userFields.facebook = facebook; // Regex ^(https?:\/\/)?(www\.)?facebook\.com\/[a-zA-Z0-9\.]+\/?$ -- > Any facebook.com domain url
    if (instagram && /^(https?:\/\/)?(www\.)?instagram\.com\/([a-zA-Z0-9_]+)\/?$/.test(instagram)) userFields.instagram = instagram; // Regex ^(https?:\/\/)?(www\.)?instagram\.com\/([a-zA-Z0-9_\.]+)\/?$

    try {
        let user = await User.findByIdAndUpdate(req.user.id,
            { $set: userFields },
            { new: true }
        ).select({
            'email': 0,
            'password': 0
        });

        return res.json(user);
    } catch (e) {
        console.error(e.message);
        res.status(500).send('Server Error');
    }
})


// @route     DELETE api/user
// @desc      Delete a user, and all their data
// @access    Private
router.delete('/', auth, async (req, res) => {
    try {
        // Get the groups where the user is an administrator
        const [userAdminGroups] = await Promise.all([GroupMember.find({
            user: req.user.id,
            role: 3
        })]);

        let commands = [];

        await Promise.all(userAdminGroups.map(async (groupAdmin) => {
            // Get the oldest admin for the group that is not the user
            const [groupAdmins] = await Promise.all([GroupMember.find({
                user: { $ne: req.user.id },
                group: groupAdmin.group,
                role: 3,
            })]);

            // If no other admins, get all moderators
            if (groupAdmins.length === 0) {
                const [oldestModerator] = await Promise.all([GroupMember.find({
                    user: { $ne: req.user.id },
                    group: groupAdmin.group,
                    role: 2,
                }).sort({
                    "createdAt": 1
                }).limit(1)]);

                // A group moderator exists
                if (oldestModerator.length !== 0) {
                    // Set oldest moderator as group admin
                    commands.push(GroupMember.findByIdAndUpdate(
                        oldestModerator.id,
                        {
                            role: 3
                        }
                    ));
                    commands.push(Group.findByIdAndUpdate(
                        groupAdmin.group,
                        {
                            createdBy: oldestModerator.user
                        }
                    ))
                } else {
                    // No moderator exists, just delete group, and all memberships to the group
                    commands.push(Group.findByIdAndRemove(groupAdmin.group));
                    commands.push(GroupMember.deleteMany({
                        group: groupAdmin.group
                    }))
                }

            }
        }));

        commands.push(User.findOneAndDelete({ _id: req.user.id }));
        commands.push(UserPost.deleteMany({ user: req.user.id }));
        commands.push(UserFollow.deleteMany({ user: req.user.id }));
        commands.push(UserFollow.deleteMany({ target: req.user.id }));
        commands.push(UserMessage.deleteMany({ user: req.user.id }));
        commands.push(UserMessage.deleteMany({ target: req.user.id }));
        commands.push(Car.deleteMany({ user: req.user.id }));
        commands.push(UserComment.deleteMany({ user: req.user.id }));
        commands.push(GroupComment.deleteMany({ user: req.user.id }));
        commands.push(Event.deleteMany({ createdBy: req.user.id }));
        commands.push(GroupMember.deleteMany({ user: req.user.id }));
        commands.push(GroupMessage.deleteMany({ user: req.user.id }));
        commands.push(GroupPost.deleteMany({ user: req.user.id }));

        await Promise.all(
            commands
        );

        return res.json({ msg: 'User Deleted' })
    } catch (e) {
        console.error(e.message);
        res.status(500).send('Server Error');
    }
})

module.exports = router;