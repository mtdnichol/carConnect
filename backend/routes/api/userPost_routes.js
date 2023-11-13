const express = require('express');
const {validationResult} = require("express-validator");
const router = express.Router();

// Models


// @route     Get api/users
// @desc      Test route
// @access    Public
router.post('/', async (req, res) => {
    const errors = validationResult(req);

    // Errors with input exist, send back bad request
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {

    } catch (e) {
        console.error(e.message);
        return res.status(500).send('Server Error');
    }
})

module.exports = router;