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
const Comment = require('../../models/Comment');
const Event = require('../../models/Event');
const Group = require('../../models/Group');
const GroupMember = require('../../models/Group_Member');
const GroupMessage = require('../../models/Group_Message');
const GroupPost = require('../../models/Group_Post');


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

// @route     POST api/user
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
                const oldestModerator = await GroupMember.find({
                    user: { $ne: req.user.id },
                    group: groupAdmin.group,
                    role: 2,
                }).sort({
                    "createdAt": 1
                }).limit(1);

                // A group moderator exists
                if (oldestModerator.length !== 0) {
                    // Set oldest moderator as group admin
                    commands.push(GroupMember.findByIdAndUpdate(
                        oldestModerator.id,
                        {
                            role: 3
                        }
                    ));
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
        commands.push(Comment.deleteMany({ user: req.user.id }));
        commands.push(Event.deleteMany({ createdBy: req.user.id }));
        commands.push(GroupMember.deleteMany({ user: req.user.id }));
        commands.push(GroupMessage.deleteMany({ user: req.user.id }));
        commands.push(GroupPost.deleteMany({ user: req.user.id }));

        await Promise.all(
            commands
        );
    } catch (e) {
        console.error(e.message);
        res.status(500).send('Server Error');
    }
})

module.exports = router;