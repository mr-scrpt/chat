const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {serveClient: true});

let users = [];



let connections = [];


app.use(express.static(__dirname));
//указываем корневую деректорию
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.emit('connected', users);
  //io.emit('connected', users);

  socket.on('getUser', user =>{
    console.log(user);
    users.forEach(item=>{
      if(item.userName === user){
        item.online = true;
      }
    });

    console.log(users);
    socket.emit('sendUser', users);
  });

  socket.on('login', user => {
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

    io.emit('userUpdate', users);



    socket.on('disconnect', function () {
      users.forEach(item=>{
        if(item.userName === user.userName){
          item.online = false;
        }
      });
      io.emit('userUpdate', users);

    });
  });



  
  

  socket.join('all');
  socket.on('msg', function (msg) {
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
      if(user.online){
        user.userHistory.push(obj);
      }
    });




    socket.emit('message', obj);
    socket.to('all').emit('message', obj);
  });
  socket.on('receiveHistory', ()=>{
    //localStorage
    console.log('history');
  });


});



// io.on('send mess', (data) => {
//   io.socket.emit('new mess', messageData);
// });
//localhost:3000
http.listen(3000, function () {
  console.log('listening on *:3000');
});
