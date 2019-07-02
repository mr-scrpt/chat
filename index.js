const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {serveClient: true});

let users = [];


app.use(express.static(__dirname));
//указываем корневую деректорию
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {


  socket.emit('connected', users);


  socket.on('loginUser', user => {
    let existing = false;

    users.forEach(item=>{
      if(item.userName === user.userName){
        existing = true;
        item.online = true;
      }
    });

    if (!existing){
      users.push(user);
    }
    io.emit('updUsers', users);

    socket.on('disconnect', function () {
      users.forEach(item=>{

        if(item.userName === user.userName){
          item.online = false;
        }
      });
      io.emit('updUsers', users);
    });

  });

  

  socket.join('all');
  socket.on('msg', function (msg) {

    console.log(users);


    const dataOptions = {
      timezone: 'UTC',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    };

    const obj = {
      date: new Date().toLocaleString("ru", dataOptions),
      content: msg.message,
      userId: socket.id,
      userNick: msg.userNick
    };

    users.forEach(user=>{
      console.log(user);
      if(user.online){
        if(!user.userHistory){
          user.userHistory = []
        }
        user.userHistory.push(obj);
      }
    });

    socket.emit('message', obj);
    socket.to('all').emit('message', obj);
  });

});


http.listen(3000, function () {
  console.log('listening on *:3000');
});
