// By wrapping code in an anonymous function, you keep it 
// from conflicting with other variables if they have same names
 

(function(){
	var app = angular.module('chat', ['btford.socket-io', 'ngSanitize']);

    app.controller('main', ['$scope', '$http', 'socket', function($scope, $http, socket){
            $scope.availableRooms;
            
            $scope.chatRoom;
            
            $scope.username;
            
            $scope.chatWindow = '';
            $scope.usersOnline = '';
            $scope.message = '';

            
            
            $scope.error;

            $scope.inRoom = false;
            $scope.wroteOld = false;

            getRooms();
            checkLocalStorage();

            $scope.enter = function(){
                socket.emit('new user', {username: $scope.username, room: $scope.chatRoom}, checkAvailable);
            }

            $scope.leave = function(){
                socket.emit('leave room');
                $scope.chatWindow = '';
                $scope.inRoom = false;
                $scope.wroteOld = false;
            }
            
            $scope.sendMessage = function(){
                if($scope.message === ''){ return; }
                
                var date = new Date;
                
                socket.emit('send message', $scope.message);
                $scope.message = '';
            }
            
            socket.on('new message', function(data){  // prints new messages
                var time = new Date;
                var hms = getTime(time);
                $scope.chatWindow += '['+ hms + ']  <b>' + data.nick + ': </b>' + data.msg + "<br/>";
            });

            socket.on('old messages', function(data){
                if(!$scope.wroteOld){
                    console.log('old messages fires')
                    for(var i=data.length-1; i>=0; i--){
                        
                        var time = new Date(data[i].created);
                        var hms = getTime(time);
                        $scope.chatWindow += '['+ hms + ']  <b>' + data[i].user + ': </b>' + data[i].message + "<br/>";
                    }
                }
                $scope.wroteOld = true;

            });

            socket.on('usernames', function(data){
                console.log(data);
                var html = '';
                for(i=0; i<data.length; i++){
                    html += '  ' + data[i] + '<br/>';
                }
                $scope.usersOnline = html;
            });

            function getRooms(){
                $http.get('api/rooms/get').then(function(response){
                    var res = response.data;
                    
                    // put response.data keys in array keys[]
                    var keys = [];
                    for(var k in res) {keys.push(k)};

                    console.log('getRooms fires')
                    $scope.availableRooms = keys;
                    //$scope.chatRoom = $scope.availableRooms[1];    

                });
                
            }

            function checkAvailable(data){
                if(data['bool'] === true){
                    localStorage.setItem('User-Data', data['nickname']);
                    localStorage.setItem('Chatroom', $scope.chatRoom);
                    
                    socket.emit('join room', $scope.chatRoom);
                    $scope.inRoom = true;  
                }else {
                    $scope.error = "Username taken!"
                    localStorage.clear();
                }
            }

            function getTime(dateobj){
                var hms =   ("0" + dateobj.getHours()).slice(-2)   + ":" + 
                            ("0" + dateobj.getMinutes()).slice(-2) + ":" + 
                            ("0" + dateobj.getSeconds()).slice(-2);
                return hms;
            }

            function checkLocalStorage(){
                if(localStorage['User-Data'] && localStorage['Chatroom']){
                    //console.log('fires')
                    $scope.chatRoom = localStorage['Chatroom'];
                    $scope.username = localStorage['User-Data'];

                    socket.emit('new user', {username: $scope.username, room: $scope.chatRoom}, checkAvailable);

                    console.log($scope.chatRoom, $scope.username)
                }else{
                    console.log('local storage empty!')
                }
            }
        }]);
		
}());