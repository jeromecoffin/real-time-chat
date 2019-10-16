const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io').listen(server);

server.listen(8080);

// routing
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/client.html');
});

// utilisateurs connectés au chat
var utilisateurs = {};

// salons disponibles pour le chat
var salons = ['salon_general','salon2','salon3'];

io.sockets.on('connection', function (socket) {

	// quand le client envoie 'nouvelUtilisateur', on ecoute et execute
	socket.on('nouvelUtilisateur', function(username){

		socket.username = username;

		socket.room = 'salon_general';

		utilisateurs[username] = username;
    //on envoie par defaut le client au salon general
		socket.join('salon_general');
    //on avertit le nouvel utilisateur qu il est bien connecte
		socket.emit('actualiserChat', 'SERVER', 'vous etes connecte au salon general');
    //on avertit tous les utilisateurs connectes au salon general l'arrive d'un nouvel utilisateur
		socket.broadcast.to('salon_general').emit('actualiserChat', 'SERVER', username + ' a rejoint le salon');
		socket.emit('actualiserSalons', salons, 'salon_general');
	});

	// quand le client emet 'lancerChat', on execute
	socket.on('lancerChat', function (data) {
		io.sockets.in(socket.room).emit('actualiserChat', socket.username, data);
	});

	socket.on('changerSalon', function(newroom){
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('actualiserChat', 'SERVER', 'vous etes connecte a '+ newroom);
		// envoye message au salon quitte
		socket.broadcast.to(socket.room).emit('actualiserChat', 'SERVER', socket.username+' a quitte le salon');
		// on met a jour le salon associe au socket
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('actualiserChat', 'SERVER', socket.username+' a rejoint le salon');
		socket.emit('actualiserSalons', salons, newroom);
	});


	// on moment de la deconnexion
	socket.on('disconnect', function(){
		// on enleve le nom de l'utilisateur de la liste
		delete utilisateurs[socket.username];
		// on met a jour cote client
		io.sockets.emit('updateusers', utilisateurs);
		// tous les salons savent que l'utilisateur a quitté tous les salons
		socket.broadcast.emit('actualiserChat', 'SERVER', socket.username + ' est deconnecte');
		socket.leave(socket.room);
	});
});
