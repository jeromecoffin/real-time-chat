const socket = io('http://localhost:3000')
const conteneurMessage = document.getElementById('message-container')
const formulaireMessage = document.getElementById('send-container')
const entreeMessage = document.getElementById('message-input')

const name = prompt('Quel est votre prenom ?')
appendMessage('Vous avez rejoint')
socket.emit('new-user', name)

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('user-connected', name => {
  appendMessage(`${name} connected`)
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})

formulaireMessage.addEventListener('submit', e => {
  e.preventDefault()
  const message = entreeMessage.value
  appendMessage(`You: ${message}`)
  socket.emit('send-chat-message', message)
  entreeMessage.value = ''
})

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  conteneurMessage.append(messageElement)
}
