const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');

const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'client')));

var players = [];
var TEAM_A = 0;
var TEAM_B = 0;

io.on("connection", (socket) => {
	socket.on('connected', () => {
		var player = {
			id: socket.id
		}

		if(players.length<6){
			if(TEAM_A<3){
				++TEAM_A;
				player.side = 'TEAM_A';
			} else {
				++TEAM_B;
				player.side = 'TEAM_B';
			};
			players.push(player);
			socket.emit('my player', player);
			socket.emit('new player', players);
			socket.broadcast.emit('new player', players);
		}
	});

	socket.on('update', data => {
		socket.broadcast.emit('update', data);
	});

	socket.on('update FLAG_A', data => {
		socket.broadcast.emit('update FLAG_A', data);
	});

	socket.on('update FLAG_B', data => {
		socket.broadcast.emit('update FLAG_B', data);
	});

	socket.on('update SCORE', data => {
		socket.broadcast.emit('update SCORE', data);
	});

	socket.on('disconnect', async () => {
		let backup = [];
		for(i in players){
			if(players[i].id!=socket.id){
				backup.push(players[i]);
			} else {
				if(players[i].side=='TEAM_A'){
					--TEAM_A;
				} else {
					--TEAM_B;
				};
			};
		};
		players = backup;
		socket.broadcast.emit('disconnected', socket.id);
	});
});

server.listen(3000, () => {
	console.log('Games is running on port 3000');
});