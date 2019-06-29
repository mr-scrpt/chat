document.addEventListener('DOMContentLoaded', function() {
    let name = document.querySelector('#name'),
        nickname = document.querySelector('#nickname'),
        authBtn = document.querySelector('#authBtn'),
        sendBtn = document.querySelector('#sendBtn'),
        messageText = document.querySelector('#messageText'),
        messages = document.querySelector('#messages');
        messageContainer = document.querySelector('.message__container'),
        authPopup = document.querySelector('#authPopup'),
        loadPhoto = document.querySelector('#loadPhoto'),
        fileLoadPopup = document.querySelector('#fileLoadPopup'),
        cancel = document.querySelector('#cancel'),
        sendPhoto = document.querySelector('#sendPhoto'),
        container = document.querySelector('.container'),
        nameOfuser = document.querySelector('.users__block_name'),
        members = document.querySelector('.users__block_members'),
        usersList = document.querySelector('#usersList'),
        messagesPhoto = document.querySelector('#messagesPhoto'),
        templateOfMessage = document.querySelector('#messageList').textContent,
        templateOfUsers = document.querySelector('#listOfUsers').textContent,
        messageForm = document.querySelector('.message__form'),
        renderUsers = Handlebars.compile(templateOfUsers),
        renderMessages = Handlebars.compile(templateOfMessage),
        users = [],
        messagesListOnPage = [],
        socket = io.connect('http://localhost:3000/');

    socket.on('connected', function (msg) {
        //socket.emit('receiveHistory');
        console.log(msg, 2222);
        const loginData = localStorage.getItem('login');
        users.push({
            name: JSON.parse(loginData).userName
        });

        let usersActiveList = renderUsers(users);
        console.log(usersList);
        usersList.innerHTML = usersActiveList;

    });

    function checkLogin() {
        const loginData = localStorage.getItem('login');
        console.log('test here');
        if(loginData){
            authPopup.classList.add('hidden');
            messageForm.classList.remove('hidden');
            members.classList.remove('hidden');

        }else {
            messageForm.classList.add('hidden');
            members.classList.add('hidden')
        }
    }


    const loginEvent = new Event('loginEvent');
    checkLogin();

  //const userAvatar = JSON.parse(localStorage.getItem('login')).userAvatar;

    authBtn.addEventListener('click', e=>{
    const userName = name.value;
    const userNick = nickname.value;
    if (userName && userNick){
      const alertMessage = document.querySelector('.alertMessage');
      if (alertMessage) {
        alertMessage.parentNode.removeChild(alertMessage);
      }
      const data = {
        'userName':userName,
        'userNick': userNick,
        'userAvatar': ''
      };
      localStorage.setItem('login', JSON.stringify(data));

      document.body.dispatchEvent(loginEvent);

    } else {
      const alertMessage = document.createElement('div');
      alertMessage.classList.add('alertMessage');
      alertMessage.innerText = 'Все поля обязательны';
      authPopup.appendChild(alertMessage);

    }
    });

    document.body.addEventListener('loginEvent', e=>{
    checkLogin()
    });



    socket.on('message', addMessage);

    sendBtn.addEventListener('click', (event) => {
      event.preventDefault();

        const userNick = JSON.parse(localStorage.getItem('login')).userNick;
        console.log(userNick);
        let messageInfo = {
            name: userNick.trim() + ':',
            message: messageText.value.trim()
        };


      if(messageInfo.length == 0){

        messageText.classList.add('message__form_input-error');
      }
      socket.emit('msg', messageInfo);
      messageText.value = '';

    });

    function addMessage(message){

      messagesListOnPage.push(message);
      console.log(messagesListOnPage);
      let messagesList = renderMessages(messagesListOnPage);
            messages.innerHTML = messagesList;
            messageContainer.scrollTop = messageContainer.scrollHeight;
    }


});
