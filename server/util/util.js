module.exports.returnAvailable = function (io, socket, nicknames, Message, data, callback){
	console.log(data);

	if(nicknames[data.room].indexOf(data.username) != -1){
	    callback({ bool: false });
	}else {
	    socket.nickname = data.username;
	    joinRoom(io, socket, data.room, Message);

	    nicknames[data.room].push(socket.nickname);
	    console.log(nicknames[data.room]);
	            
	    io.sockets.to(data.room).emit('usernames', nicknames[data.room]);
	    callback({ bool: true, nickname: socket.nickname});
	}
}

module.exports.removeUser = function(io, socket, nicknames){
 	//console.log(socket.nickname + " disconnected. Bool value: " + socket.nickname==true);
	if(socket.nickname==false) return;
	// socket.room has to be defined, otherwise crashes if user reloads while not in a roomn
	if(socket.room)
	{
	    nicknames[socket.room].splice(nicknames[socket.room].indexOf(socket.nickname), 1);
	    socket.leave(socket.room);
	}
	    
	io.sockets.to(socket.room).emit('usernames', nicknames[socket.room]);
}

function joinRoom(io, socket, data, Message){
	socket.join(data);
	socket.room = data;
	console.log(socket.room);

	var query = Message.find({room: socket.room});
	query.sort({created:-1}).limit(5).exec(function(err, results){
	    if(err) { console.log(err); }

	    else if(results){ 
	        io.sockets.to(socket.room).emit('old messages', results); 
	    }
	});
}


module.exports.processMessage = function(io, socket, Message, data){
    io.sockets.to(socket.room).emit('new message', {msg : data, nick : socket.nickname});
    var message = new Message({
        created: new Date,
        user: socket.nickname,
        message: data,
        room: socket.room
    });

    message.save(function(err){
        if(err){
            console.log(err);
        }else{
            console.log('Successfully saved.');
        }
    });
}
