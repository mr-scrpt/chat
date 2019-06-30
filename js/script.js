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

    function emitLogin(data){
        if (data) {
            socket.emit('login', data);
            users.push({
                name: data.userName
            });
        }
    }

    socket.on('connected', function (msg) {
        checkLogin();
        //socket.emit('receiveHistory');
        const loginData = JSON.parse(localStorage.getItem('login'));
        emitLogin(loginData);
        socket.emit('userUpdate', loginData);
    });

    socket.on('userUpdate', (users)=>{
        console.log('рендер юзеров');
        console.log(users);
        let usersActiveList = renderUsers(users);
        console.log(usersList);
        usersList.innerHTML = usersActiveList;
    });

    function checkLogin() {
        const loginData = localStorage.getItem('login');

        if(loginData){
            authPopup.classList.add('hidden');
            messageForm.classList.remove('hidden');
            members.classList.remove('hidden');

        }else {
            messageForm.classList.add('hidden');
            members.classList.add('hidden');

        }
    }
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
            checkLogin();
            emitLogin(data);




        } else {
            const alertMessage = document.createElement('div');
            alertMessage.classList.add('alertMessage');
            alertMessage.innerText = 'Все поля обязательны';
            authPopup.appendChild(alertMessage);

        }
    });


    sendBtn.addEventListener('click', (event) => {
      event.preventDefault();

        const userNick = JSON.parse(localStorage.getItem('login')).userNick;

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

    socket.on('message', addMessage);
    function addMessage(message){
        messagesListOnPage.push(message);
        console.log(messagesListOnPage);
        let messagesList = renderMessages(messagesListOnPage);
            messages.innerHTML = messagesList;
            messageContainer.scrollTop = messageContainer.scrollHeight;
    }


});
