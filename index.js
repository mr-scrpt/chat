const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {serveClient: true});

let users = [];
//let users = new Set();
let connections = [];


app.use(express.static(__dirname));
//указываем корневую деректорию
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {

  console.log('до логина');
  socket.on('login', user => {
    console.log('внутри логина');
    users.push(user);
    console.log(users);
    io.emit('userUpdate', users);


    socket.on('disconnect', function () {

      let pos = users.indexOf(user);
      users.splice(pos, 1);
      console.log('выход');
      io.emit('userUpdate', users);
      //io.emit('user disconnected');
    });
  });


  socket.emit('connected');

  


  socket.join('all');
  socket.on('msg', function (msg) {

    console.log(msg);
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
      userName: msg.name
    };
    
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
