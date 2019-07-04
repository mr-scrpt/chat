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
    io.emit('updAva', users);

    socket.on('disconnect', function () {
      users.forEach(item=>{

        if(item.userName === user.userName){
          item.online = false;
        }
      });
      io.emit('updUsers', users);
    });

  });

  socket.on('loadAvatar', (file, user) =>{
    let changeAva = false;

    users.forEach(item=>{
      if(item.userNick === user.userNick){
        item.userAvatar = file;
        changeAva = true;
      }
    });

    if (changeAva === true){
      io.emit('updAva', users);
    }


  });

  socket.join('all');
  socket.on('msg', function (msg) {

    const dataOptions = {
      timezone: 'UTC',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    };
    /*let userAvatar = '';
    users.forEach(item=>{
      if (msg.userNick == item.userNick){
        userAvatar = item.userAvatar;
      }
    });*/

    const obj = {
      date: new Date().toLocaleString("ru", dataOptions),
      content: msg.message,
      userId: socket.id,
      userNick: msg.userNick

    };

    users.forEach(user=>{
      if(user.online){
        if(!user.userHistory){
          user.userHistory = []
        }
        user.userHistory.push(obj);
      }
    });

    socket.emit('message', obj);
    socket.to('all').emit('message', obj);
    io.emit('updAva', users);


  });

});


http.listen(3000, function () {
  console.log('listening on *:3000');
});
