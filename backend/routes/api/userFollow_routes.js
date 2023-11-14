const express = require('express');
const router = express.Router();

// Packages
const {validationResult} = require("express-validator");

// Dependencies
const auth = require('../../middleware/auth')

// Models
const UserFollow = require('../../models/User_Follow');
const User = require("../../models/User");

// @route     GET api/myFollowers
// @desc      Get current users followers
// @access    Private
router.get('/myFollowers', auth, async (req, res) => {
    try {
        const followers = await UserFollow.find({
            target: req.user.id
        });

        return res.json(followers);
    } catch (e) {
        console.error(e.message);
        return res.status(500).send('Server Error');
    }
})

// @route     GET api/myFollowing
// @desc      Get all users the current user is following
// @access    Private
router.get('/myFollowing', auth, async (req, res) => {
    try {
        const following = await UserFollow.find({
            user: req.user.id
        });

        return res.json(following);
    } catch (e) {
        console.error(e.message);
        return res.status(500).send('Server Error');
    }
})

// @route     GET api/userFollow/followers/:id
// @desc      Get all of a users followers
// @access    Private
router.get('/followers/:id', auth, async (req, res) => {
    try {
        const followers = await UserFollow.find({
            target: req.params.id
        });

        return res.json(followers);
    } catch (e) {
        console.error(e.message);
        return res.status(500).send('Server Error');
    }
})

// @route     GET api/userFollow/following/:id
// @desc      Get all users a user is following
// @access    Private
router.get('/following/:id', auth, async (req, res) => {
    try {
        const following = await UserFollow.find({
            user: req.params.id
        });

        return res.json(following);
    } catch (e) {
        console.error(e.message);
        return res.status(500).send('Server Error');
    }
})

// @route     POST api/userFollow/:id
// @desc      Follow or unfollow a user
// @access    Private
router.post('/:id', auth, async (req, res) => {
    try {
        // Check if the target user exists
        let user = await User.findById(req.params.id);

        if (!user)
            return res.status(400).json({ errors: [{ msg: 'Target user does not exist'}] });

        // Instance of me following other user, if any
        let myFollow = await UserFollow.findOne({
            user: req.user.id,
            target: req.params.id
        });

        // Instance of other user following me, if any
        let theirFollow = await UserFollow.findOne({
            user: req.params.id,
            target: req.user.id
        });

        let commands = [];

        if (myFollow) {
            // I am following the user, I want to unfollow
            commands.push(UserFollow.findByIdAndRemove(myFollow.id));

            // If they are following me, set friend to false
            if (theirFollow) {
                theirFollow.friend = false;
                commands.push(theirFollow.save());
            }

            await Promise.all(commands);

            return res.json({ msg: 'User Unfollowed' })
        } else {
            // I am not following the user, I want to follow
            let isFriend = false;

            // Check if they are following me
            if (theirFollow) {
                isFriend = true;
                theirFollow.friend = true;
                commands.push(theirFollow.save());
            }

            myFollow = new UserFollow({
                user: req.user.id,
                target: req.params.id,
                friend: isFriend
            })

            commands.push(myFollow.save());

            await Promise.all(commands);

            return res.json({ msg: 'User Followed' })
        }

        return req.json(following);
    } catch (e) {
        console.error(e.message);
        return res.status(500).send('Server Error');
    }
})

module.exports = router;