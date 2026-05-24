const { setIO } = require('./utils/socketManager')
const app = require('./app')
require('./utils/worker')
const http = require('http')
const { Server } = require('socket.io')
const {fetchCommitDetails} = require('./utils/commitDetailJob')
const { fetchPRDetails } = require('./utils/prDetailJob')

const server = http.createServer(app)
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

const io = new Server(server, {
  cors: { origin: 'http://localhost:5173'}
})

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId
  if (userId) {
    socket.join(userId)
    console.log(`User ${userId} connected to socket`)
  }
})

setIO(io)

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log("Server started sucessfully"))

setInterval(fetchCommitDetails, 5* 60 * 1000)
setInterval(fetchPRDetails, 5 * 60 * 1000)

