const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db')

const app = express();

// Connect Database
connectDB().then(r => {});

app.use(express.json())
app.use(cors())

// Routes
app.use('/api/auth', require('./backend/routes/api/auth_routes'))
app.use('/api/car', require('./backend/routes/api/car_routes'))
app.use('/api/comment', require('./backend/routes/api/comment_routes'))
app.use('/api/event', require('./backend/routes/api/event_routes'))
app.use('/api/group', require('./backend/routes/api/group_routes'))
app.use('/api/groupMember', require('./backend/routes/api/groupMember_routes'))
app.use('/api/groupMessage', require('./backend/routes/api/groupMessage_routes'))
app.use('/api/groupPost', require('./backend/routes/api/groupPost_routes'))
app.use('/api/user', require('./backend/routes/api/user_routes'))
app.use('/api/userFollow', require('./backend/routes/api/userFollow_routes'))
app.use('/api/userMessage', require('./backend/routes/api/userMessage_routes'))
app.use('/api/userPost', require('./backend/routes/api/userPost_routes'))
app.use('/api/inbox', require('./backend/routes/api/inbox_routes'))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
});