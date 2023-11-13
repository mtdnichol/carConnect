const jwt = require('jsonwebtoken')
const config = require('config')
const User = require('../models/User')

module.exports = async function(req, res, next) {
    // Get the token from the header
    const token = req.header('x-auth-token')

    // Check if there is no token
    if(!token)
        return res.status(401).json({ msg: 'No token, authorization denied'})

    // Verify the token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'))

        const user = await User.findById(decoded.user.id)

        if (!user)
            return res.status(401).json({ msg: 'Current user not valid, authorization denied'})

        req.user = decoded.user
        next()
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' })
    }
}