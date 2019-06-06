const Canvas = document.querySelector('canvas');
const context = Canvas.getContext('2d');
Canvas.x = 0;
Canvas.y = 0;
Canvas.width = 1001;
Canvas.height = 400;
Canvas.clear = function(){
	context.fillStyle = '#82e6d2';
	context.fillRect(Canvas.x, Canvas.y, Canvas.width, Canvas.height);
};

function random(min, max) {
  return Math.random() * (max - min) + min;
};

var player;
var players = [];

const socket = io.connect();

socket.emit('connected');

const GAMESTATE = {
	menu: true,
	playing: false,
	gameOver: false
};

const PITCH = {
	SIDE_A: {
		x: Canvas.x,
		y: Canvas.y,
		width: Canvas.width/8,
		height: Canvas.height
	},
	SIDE_B: {
		x: Canvas.x+(Canvas.width-Canvas.width/8),
		y: Canvas.y,
		width: Canvas.width/8,
		height: Canvas.height
	},
	CENTER_LINE: {
		x: Canvas.width/2,
		y: Canvas.y,
		width: 1,
		height: Canvas.height
	},
	draw: function(){
		context.fillStyle = 'black';
		context.fillRect(this.CENTER_LINE.x,this.CENTER_LINE.y, this.CENTER_LINE.width, this.CENTER_LINE.height);
		context.fillStyle = '#ff6464';
		context.fillRect(this.SIDE_A.x, this.SIDE_A.y, this.SIDE_A.width, this.SIDE_A.height);
		context.fillStyle = '#b4b4ff';
		context.fillRect(this.SIDE_B.x, this.SIDE_B.y, this.SIDE_B.width, this.SIDE_B.height);
	}
};

const FLAG_A = {
	x: 50,
	y: Canvas.height / 2,
	width: 15,
	height: 15,
	status: false,
	player: '',
	draw: function(){
		context.fillStyle = 'blue';
		context.fillRect(this.x, this.y, this.width, this.height);
	},
	spawn: function(){
		this.x = Canvas.x + (Canvas.width / 15);
		this.y = Canvas.height / 2;
	},
	move: function(){
		if(this.status && this.player){
			for(i in players){
				if(this.player.id==players[i].id){
					this.x = this.player.x;
					this.y = this.player.y;
				};
			};
		};
	}
};

const FLAG_B = {
	x: Canvas.width - 50,
	y: Canvas.height / 2,
	width: 15,
	height: 15,
	status: false,
	player: '',
	draw: function(){
		context.fillStyle = 'red';
		context.fillRect(this.x, this.y, this.width, this.height);
	},
	spawn: function(){
		this.x = Canvas.x + Canvas.width - (Canvas.width / 15);
		this.y = Canvas.height / 2;
	},
	move: function(){
		if(this.status && this.player){
			for(i in players){
				if(this.player.id==players[i].id){
					this.x = this.player.x;
					this.y = this.player.y;
				};
			};
		};
	}
};

var Player = function (id, SIDE) {
	this.id = id;
	this.side = SIDE;
	this.x = 0;
	this.y = 0;
	this.width = 15;
	this.height = 15;
	this.speed = 0.5;
	this.maxSpeed = 5;
	this.dirX = 0;
	this.dirY = 0;
	this.left = false;
	this.right = false;
	this.up = false;
	this.down = false;
	this.keyLeft = 65;
	this.keyRight = 68;
	this.keyUp = 87;
	this.keyDown = 83;
	this.spawn = function(){
		if(this.side=='TEAM_A'){
			this.x = random(PITCH.SIDE_A.width, Canvas.width/2-this.width);
			this.y = random(Canvas.y, Canvas.height-this.height);
		} else if(this.side=='TEAM_B'){
			this.x = random(Canvas.width/2, PITCH.SIDE_B.x-this.width);
			this.y = random(Canvas.y, Canvas.height-this.height);
		};
	};
	this.draw = function(){
		if(this.side=='TEAM_A'){
			context.fillStyle = '#ff7d7d';
		} else if(this.side=='TEAM_B'){
			context.fillStyle = '#7d7dff';
		}
		context.fillRect(this.x, this.y, this.width, this.height);
	};
	this.onKeyDown = function(key){
		if(key==this.keyLeft){
			this.left = true;
		};
		if(key==this.keyRight){
			this.right = true;
		};
		if(key==this.keyUp){
			this.up = true;
		};
		if(key==this.keyDown){
			this.down = true;
		};
	};
	this.onKeyUp = function(key){
		if(key==this.keyLeft){
			this.left = false;
			this.dirX = 0;
		};
		if(key==this.keyRight){
			this.right = false;
			this.dirX = 0;
		};
		if(key==this.keyUp){
			this.up = false;
			this.dirY = 0;
		};
		if(key==this.keyDown){
			this.down = false;
			this.dirY = 0;
		};
	};
	this.moves = function(){
		if(this.side == 'TEAM_A'){
			if(this.left){
				if(this.x > PITCH.SIDE_A.width){
					this.x -= this.dirX;
				};
				if(this.dirX < this.maxSpeed){
					this.dirX += this.speed;
				};
			};
			if(this.right){
				if(this.x + this.width < Canvas.width){
					this.x += this.dirX;
				};
				if(this.dirX < this.maxSpeed){
					this.dirX += this.speed;
				};
			};
			if(this.up){
				if(this.y > Canvas.y){
					this.y -= this.dirY;
				};
				if(this.dirY < this.maxSpeed){
					this.dirY += this.speed;
				};
			};
			if(this.down){
				if(this.y + this.height < Canvas.height){
					this.y += this.dirY;
				};
				if(this.dirY < this.maxSpeed){
					this.dirY += this.speed;
				};
			};
		} else if(this.side == 'TEAM_B'){
			if(this.left){
				if(this.x > Canvas.x){
					this.x -= this.dirX;
				};
				if(this.dirX < this.maxSpeed){
					this.dirX += this.speed;
				};
			};
			if(this.right){
				if(this.x + this.width < PITCH.SIDE_B.x){
					this.x += this.dirX;
				};
				if(this.dirX < this.maxSpeed){
					this.dirX += this.speed;
				};
			};
			if(this.up){
				if(this.y > Canvas.y){
					this.y -= this.dirY;
				};
				if(this.dirY < this.maxSpeed){
					this.dirY += this.speed;
				};
			};
			if(this.down){
				if(this.y + this.height < Canvas.height){
					this.y += this.dirY;
				};
				if(this.dirY < this.maxSpeed){
					this.dirY += this.speed;
				};
			};
		};
	};
	this.touch = function(players) {
		for(i in players){
			if(this.side=='TEAM_A'){
				if(players[i].side=='TEAM_B' && this.x > Canvas.width/2){
					// left touch
					if(this.x < players[i].x + players[i].width 
						&& this.x > players[i].x + players[i].width - 7 
						&& this.y > players[i].y 
						&& this.y < players[i].y + players[i].height 
						|| this.x < players[i].x + players[i].width 
						&& this.x > players[i].x + players[i].width - 7 
						&& this.y + this.width > players[i].y 
						&& this.y + this.width < players[i].y + players[i].height){
						if(FLAG_B.player.id==this.id){
							FLAG_B.status = false;
							FLAG_B.player = '';
							FLAG_B.spawn();
						}
						SCORE.TEAM_B++;
						this.spawn();
						socket.emit('update FLAG_B', FLAG_B);
						socket.emit('update SCORE', SCORE);
					};
					// right touch
					if(this.x + this.width > players[i].x
						&& this.x + this.width < players[i].x + 7
						&& this.y > players[i].y 
						&& this.y < players[i].y + players[i].height
						|| this.x + this.width > players[i].x 
						&& this.x + this.width < players[i].x + 7
						&& this.y + this.width > players[i].y 
						&& this.y + this.width < players[i].y + players[i].height){
						if(FLAG_B.player.id==this.id){
							FLAG_B.status = false;
							FLAG_B.player = '';
							FLAG_B.spawn();
						}
						SCORE.TEAM_B++;
						this.spawn();
						socket.emit('update FLAG_B', FLAG_B);
						socket.emit('update SCORE', SCORE);
					};
					// upper touch
					if(this.y < players[i].y + players[i].height 
						&& this.y > players[i].y + players[i].height - 7 
						&& this.x > players[i].x 
						&& this.x < players[i].x + players[i].width 
						|| this.y < players[i].y + players[i].height 
						&& this.y > players[i].y + players[i].height - 7 
						&& this.x + this.height > players[i].x 
						&& this.x + this.height < players[i].x + players[i].width){
						if(FLAG_B.player.id==this.id){
							FLAG_B.status = false;
							FLAG_B.player = '';
							FLAG_B.spawn();
						}
						SCORE.TEAM_B++;
						this.spawn();
						socket.emit('update FLAG_B', FLAG_B);
						socket.emit('update SCORE', SCORE);
					};
					// bottom touch
					if(this.y + this.height > players[i].y
						&& this.y + this.height < players[i].y + 7
						&& this.x > players[i].x 
						&& this.x < players[i].x + players[i].width
						|| this.y + this.height > players[i].y 
						&& this.y + this.height < players[i].y + 7
						&& this.x + this.height > players[i].x 
						&& this.x + this.height < players[i].x + players[i].width){
						if(FLAG_B.player.id==this.id){
							FLAG_B.status = false;
							FLAG_B.player = '';
							FLAG_B.spawn();
						}
						SCORE.TEAM_B++;
						this.spawn();
						socket.emit('update FLAG_B', FLAG_B);
						socket.emit('update SCORE', SCORE);
					};
				};
			} else if(this.side=='TEAM_B'){
				if(players[i].side=='TEAM_A' && this.x + this.width < Canvas.width/2){
					// left touch
					if(this.x < players[i].x + players[i].width 
						&& this.x > players[i].x + players[i].width - 7 
						&& this.y > players[i].y 
						&& this.y < players[i].y + players[i].height 
						|| this.x < players[i].x + players[i].width 
						&& this.x > players[i].x + players[i].width - 7 
						&& this.y + this.width > players[i].y 
						&& this.y + this.width < players[i].y + players[i].height){
						if(FLAG_A.player.id==this.id){
							FLAG_A.status = false;
							FLAG_A.player = '';
							FLAG_A.spawn();
						}
						SCORE.TEAM_A++;
						this.spawn();
						socket.emit('update FLAG_A', FLAG_A);
						socket.emit('update SCORE', SCORE);
					};
					// right touch
					if(this.x + this.width > players[i].x
						&& this.x + this.width < players[i].x + 7
						&& this.y > players[i].y 
						&& this.y < players[i].y + players[i].height
						|| this.x + this.width > players[i].x 
						&& this.x + this.width < players[i].x + 7
						&& this.y + this.width > players[i].y 
						&& this.y + this.width < players[i].y + players[i].height){
						if(FLAG_A.player.id==this.id){
							FLAG_A.status = false;
							FLAG_A.player = '';
							FLAG_A.spawn();
						}
						SCORE.TEAM_A++;
						this.spawn();
						socket.emit('update FLAG_A', FLAG_A);
						socket.emit('update SCORE', SCORE);
					};
					// upper touch
					if(this.y < players[i].y + players[i].height 
						&& this.y > players[i].y + players[i].height - 7 
						&& this.x > players[i].x 
						&& this.x < players[i].x + players[i].width 
						|| this.y < players[i].y + players[i].height 
						&& this.y > players[i].y + players[i].height - 7 
						&& this.x + this.height > players[i].x 
						&& this.x + this.height < players[i].x + players[i].width){
						if(FLAG_A.player.id==this.id){
							FLAG_A.status = false;
							FLAG_A.player = '';
							FLAG_A.spawn();
						}
						SCORE.TEAM_A++;
						this.spawn();
						socket.emit('update FLAG_A', FLAG_A);
						socket.emit('update SCORE', SCORE);
					};
					// bottom touch
					if(this.y + this.height > players[i].y
						&& this.y + this.height < players[i].y + 7
						&& this.x > players[i].x 
						&& this.x < players[i].x + players[i].width
						|| this.y + this.height > players[i].y 
						&& this.y + this.height < players[i].y + 7
						&& this.x + this.height > players[i].x 
						&& this.x + this.height < players[i].x + players[i].width){
						if(FLAG_A.player.id==this.id){
							FLAG_A.status = false;
							FLAG_A.player = '';
							FLAG_A.spawn();
						}
						SCORE.TEAM_A++;
						this.spawn();
						socket.emit('update FLAG_A', FLAG_A);
						socket.emit('update SCORE', SCORE);
					};
				};
			}
		};
	};
	this.takeFlag = function(){
		if(this.side=='TEAM_A'){
			if(!FLAG_B.status){
				// left touch
				if(this.x < FLAG_B.x + FLAG_B.width 
					&& this.x > FLAG_B.x + FLAG_B.width - 7 
					&& this.y > FLAG_B.y 
					&& this.y < FLAG_B.y + FLAG_B.height 
					|| this.x < FLAG_B.x + FLAG_B.width 
					&& this.x > FLAG_B.x + FLAG_B.width - 7 
					&& this.y + this.width > FLAG_B.y 
					&& this.y + this.width < FLAG_B.y + FLAG_B.height){
					FLAG_B.status = true;
					FLAG_B.player = this;
				};
				// right touch
				if(this.x + this.width > FLAG_B.x
					&& this.x + this.width < FLAG_B.x + 7
					&& this.y > FLAG_B.y 
					&& this.y < FLAG_B.y + FLAG_B.height
					|| this.x + this.width > FLAG_B.x 
					&& this.x + this.width < FLAG_B.x + 7
					&& this.y + this.width > FLAG_B.y 
					&& this.y + this.width < FLAG_B.y + FLAG_B.height){
					FLAG_B.status = true;
					FLAG_B.player = this;
				};
				// upper touch
				if(this.y < FLAG_B.y + FLAG_B.height 
					&& this.y > FLAG_B.y + FLAG_B.height - 7 
					&& this.x > FLAG_B.x 
					&& this.x < FLAG_B.x + FLAG_B.width 
					|| this.y < FLAG_B.y + FLAG_B.height 
					&& this.y > FLAG_B.y + FLAG_B.height - 7 
					&& this.x + this.height > FLAG_B.x 
					&& this.x + this.height < FLAG_B.x + FLAG_B.width){
					FLAG_B.status = true;
					FLAG_B.player = this;
				};
				// bottom touch
				if(this.y + this.height > FLAG_B.y
					&& this.y + this.height < FLAG_B.y + 7
					&& this.x > FLAG_B.x 
					&& this.x < FLAG_B.x + FLAG_B.width
					|| this.y + this.height > FLAG_B.y 
					&& this.y + this.height < FLAG_B.y + 7
					&& this.x + this.height > FLAG_B.x 
					&& this.x + this.height < FLAG_B.x + FLAG_B.width){
					FLAG_B.status = true;
					FLAG_B.player = this;
				};
			};
		};
		if(this.side=='TEAM_B'){
			if(!FLAG_A.status){
				// left touch
				if(this.x < FLAG_A.x + FLAG_A.width 
					&& this.x > FLAG_A.x + FLAG_A.width - 7 
					&& this.y > FLAG_A.y 
					&& this.y < FLAG_A.y + FLAG_A.height 
					|| this.x < FLAG_A.x + FLAG_A.width 
					&& this.x > FLAG_A.x + FLAG_A.width - 7 
					&& this.y + this.width > FLAG_A.y 
					&& this.y + this.width < FLAG_A.y + FLAG_A.height){
					FLAG_A.status = true;
					FLAG_A.player = this;
				};
				// right touch
				if(this.x + this.width > FLAG_A.x
					&& this.x + this.width < FLAG_A.x + 7
					&& this.y > FLAG_A.y 
					&& this.y < FLAG_A.y + FLAG_A.height
					|| this.x + this.width > FLAG_A.x 
					&& this.x + this.width < FLAG_A.x + 7
					&& this.y + this.width > FLAG_A.y 
					&& this.y + this.width < FLAG_A.y + FLAG_A.height){
					FLAG_A.status = true;
					FLAG_A.player = this;
				};
				// upper touch
				if(this.y < FLAG_A.y + FLAG_A.height 
					&& this.y > FLAG_A.y + FLAG_A.height - 7 
					&& this.x > FLAG_A.x 
					&& this.x < FLAG_A.x + FLAG_A.width 
					|| this.y < FLAG_A.y + FLAG_A.height 
					&& this.y > FLAG_A.y + FLAG_A.height - 7 
					&& this.x + this.height > FLAG_A.x 
					&& this.x + this.height < FLAG_A.x + FLAG_A.width){
					FLAG_A.status = true;
					FLAG_A.player = this;
				};
				// bottom touch
				if(this.y + this.height > FLAG_A.y
					&& this.y + this.height < FLAG_A.y + 7
					&& this.x > FLAG_A.x 
					&& this.x < FLAG_A.x + FLAG_A.width
					|| this.y + this.height > FLAG_A.y 
					&& this.y + this.height < FLAG_A.y + 7
					&& this.x + this.height > FLAG_A.x 
					&& this.x + this.height < FLAG_A.x + FLAG_A.width){
					FLAG_A.status = true;
					FLAG_A.player = this;
				};
			};
		};
	};
	this.score = function(){
		if(FLAG_A.status && FLAG_A.player){
			if(FLAG_A.x > Canvas.width / 2){
				FLAG_A.status = false;
				FLAG_A.player = '';
				FLAG_A.spawn();
				SCORE.TEAM_B+=3;
				socket.emit('update FLAG_A', FLAG_A);
				socket.emit('update SCORE', SCORE);
			};
		};
		if(FLAG_B.status && FLAG_B.player){
			if(FLAG_B.x + FLAG_B.width < Canvas.width / 2){
				FLAG_B.status = false;
				FLAG_B.player = '';
				FLAG_B.spawn();
				SCORE.TEAM_A+=3;
				socket.emit('update FLAG_B', FLAG_B);
				socket.emit('update SCORE', SCORE);
			};
		};
	};
};

const SCORE = {
	TEAM_A: 0,
	TEAM_B: 0,
	draw: function(){
		context.fillStyle = 'black';
		context.font = "30px Arial";
		context.fillText(this.TEAM_A, 50, 50);
		context.fillText(this.TEAM_B, Canvas.width - 65, 50);
	}
};

function drawPlayers(players){
	for(i in players){
		if(players[i].side=='TEAM_A'){
			context.fillStyle = '#ff7d7d';
		} else if(players[i].side=='TEAM_B'){
			context.fillStyle = '#7d7dff';
		};
		context.fillRect(players[i].x, players[i].y, players[i].width, players[i].height);
	};
};

socket.on('my player', data => {
	player = new Player(data.id, data.side);
	player.spawn();
});

socket.on('new player', data => {
	let backup = [];
	for(i in data){
		if(data[i].id!=player.id){
			backup.push(data[i]);
		};
	};
	players = backup;
	socket.emit('update', player);
});

socket.on('update', data => {
	for(i in players){
		if(players[i].id==data.id){
			players[i].x = data.x;
			players[i].y = data.y;
			players[i].width = data.width;
			players[i].height = data.height;
		};
	};
});

socket.on('update FLAG_A', data => {
	FLAG_A.x = data.x
	FLAG_A.y = data.y
});

socket.on('update FLAG_B', data => {
	FLAG_B.x = data.x
	FLAG_B.y = data.y
});

socket.on('update SCORE', data => {
	SCORE.TEAM_A = data.TEAM_A;
	SCORE.TEAM_B = data.TEAM_B;
});

socket.on('disconnected', id => {
	let backup = [];
	for(i in players){
		if(players[i].id!=id){
			backup.push(players[i]);
		};
	};
	players = backup;
});

setInterval(() => {
	if(GAMESTATE.menu) {
		Canvas.clear();
		context.fillStyle = 'black';
		context.font = "30px Arial";
		context.fillText('Aguardando outros jogadores...', Canvas.width / 2 - 210, 40);
		context.fillText('Jogadores na sala: '+(1+players.length)+'/6', Canvas.width / 2 - 160, 80);
		context.fillText('Você está conectado!', Canvas.width / 2 - 150, 120);
		for(i in players){
			context.fillText('Player '+ (2+parseInt(i)) + ' conectado!', Canvas.width / 2 - 135, 150 + (i * 30));
		};
		if(players.length==5){
			context.fillText('O jogo está prestes a começar!', Canvas.width / 2 - 220, 180 + (5 * 30));
			if(!GAMESTATE.start){
				GAMESTATE.start = false;
				setTimeout(() => {
					GAMESTATE.menu = false;
					GAMESTATE.playing = true;
				},3000);
			};
		};
	} else if(GAMESTATE.playing) {
		socket.emit('update', player);
		Canvas.clear();
		PITCH.draw();

		player.moves();
		player.touch(players);
		player.takeFlag();
		player.draw();
		player.score();

		drawPlayers(players);

		FLAG_A.draw();
		FLAG_B.draw();

		if(FLAG_A.player.id==player.id){
			FLAG_A.x = player.x;
			FLAG_A.y = player.y;
			socket.emit('update FLAG_A', player);
		};

		if(FLAG_B.player.id==player.id){
			FLAG_B.x = player.x;
			FLAG_B.y = player.y;
			socket.emit('update FLAG_B', player);
		};

		SCORE.draw();
		if(SCORE.TEAM_A >= 15 || SCORE.TEAM_B >= 15){
			GAMESTATE.playing = false;
			GAMESTATE.gameOver = true;
		};
	} else if(GAMESTATE.gameOver) {
		Canvas.clear();
		context.fillStyle = 'black';
		context.font = "30px Arial";
		context.fillText('FIM DE JOGO', Canvas.width / 2 - 90, 50);
		context.fillText(SCORE.TEAM_A+' X '+SCORE.TEAM_B, Canvas.width / 2 - 25, 100);
		context.fillText('Recarregue a página', Canvas.width / 2 - 130, 200);
		context.fillText('para jogar novamente', Canvas.width / 2 - 135, 250);
	};
}, 1000/45);

setTimeout(() => {
	window.addEventListener('keydown', function(e){
		player.onKeyDown(e.keyCode);
	});

	window.addEventListener('keyup', function(e){
		player.onKeyUp(e.keyCode);
	});
}, 500);