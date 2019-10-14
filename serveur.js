var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

server.listen(8080);

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/client.html');
});

// utilisateurs which are currently connected to the chat
var utilisateurs = {};

// salons which are currently available in chat
var salons = ['salon_general','salon2','salon3'];

io.sockets.on('connection', function (socket) {

	// when the client emits 'nouvelUtilisateur', this listens and executes
	socket.on('nouvelUtilisateur', function(username){
		// store the username in the socket session for this client
		socket.username = username;
		// store the room name in the socket session for this client
		socket.room = 'salon_general';
		// add the client's username to the global list
		utilisateurs[username] = username;
		// send client to room 1
		socket.join('salon_general');
		// echo to client they've connected
		socket.emit('actualiserChat', 'SERVER', 'vous etes connecte au salon general');
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to('salon1').emit('actualiserChat', 'SERVER', username + ' a rejoins le salon');
		socket.emit('actualiserSalons', salons, 'salon1');
	});

	// when the client emits 'lancerChat', this listens and executes
	socket.on('lancerChat', function (data) {
		// we tell the client to execute 'actualiserChat' with 2 parameters
		io.sockets.in(socket.room).emit('actualiserChat', socket.username, data);
	});

	socket.on('changerSalon', function(newroom){
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('actualiserChat', 'SERVER', 'vous etes connecte a '+ newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('actualiserChat', 'SERVER', socket.username+' a quitte le salon');
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('actualiserChat', 'SERVER', socket.username+' a rejoins le salon');
		socket.emit('actualiserSalons', salons, newroom);
	});


	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global utilisateurs list
		delete utilisateurs[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', utilisateurs);
		// echo globally that this client has left
		socket.broadcast.emit('actualiserChat', 'SERVER', socket.username + ' est deconnecte');
		socket.leave(socket.room);
	});
});
