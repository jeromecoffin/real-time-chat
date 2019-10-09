const io = require('socket.io')(3000)

const util = {}

io.on('connection', socket => {
  socket.on('new-user', name => {
    util[socket.id] = name
    socket.broadcast.emit('user-connected', name)
  })
  socket.on('send-chat-message', message => {
    socket.broadcast.emit('chat-message', { message: message, name: util[socket.id] })
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', util[socket.id])
    delete util[socket.id]
  })
})
