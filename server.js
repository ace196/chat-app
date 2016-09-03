var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// mongoDB init
var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/chat");
var Message = require('./server/datasets/message');

var util = require('./server/util/util');

//chatrooms which contain all users
var nicknames = {
    'Music': [], 
    'Videogames': [], 
    'Sports': [], 
    'TV': [],
    'Politics': []
};

// middleware
// serves static files
app.use('/client', express.static(__dirname + '/client'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));


// routes
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
});

app.get('/api/rooms/get', function(req, res){
    res.json(nicknames);
});


server.listen(2000);


// socket functionality
io.sockets.on('connection', function(socket){
    
    socket.on('new user', function(data, callback){
        util.returnAvailable(io, socket, nicknames, Message, data, callback);
    });

    // do when 'send message' data is received from client
	socket.on('send message', function(data){
    	util.processMessage(io, socket, Message, data);
    });

    // do when 'disconnect' data is received from the client
    socket.on('disconnect', function(data){
        util.removeUser(io, socket, nicknames);
	});

    socket.on('leave room', function(){
        util.removeUser(io, socket, nicknames);
    });

});