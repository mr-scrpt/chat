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
            /*users.push({
                name: data.userName
            });*/
        }
    }

    function checkLogin(users) {

        const loginData = localStorage.getItem('login');

        if(loginData){
            authPopup.classList.add('hidden');
            messageForm.classList.remove('hidden');
            members.classList.remove('hidden');

            //checkHistory();
            renderHistory(users, JSON.parse(loginData));


        }else {
            messageForm.classList.add('hidden');
            members.classList.add('hidden');

        }
    }


    // function checkHistory(){
    //     const loginData = JSON.parse(localStorage.getItem('login'));
    //
    //     if(loginData.userHistory.length > 0){
    //         messagesListOnPage = [...loginData.userHistory];
    //
    //         let messagesList = renderMessages(messagesListOnPage);
    //         messages.innerHTML = messagesList;
    //         messageContainer.scrollTop = messageContainer.scrollHeight;
    //     }
    // }
    function renderHistory(users, user){
        let userNick = user.userNick;
        console.log('Загрузка истории');

        users.forEach(item=>{
            if (item.userNick === userNick){

                console.log(item.userHistory);
                messagesListOnPage = [...item.userHistory];

                let messagesList = renderMessages(messagesListOnPage);
                messages.innerHTML = messagesList;
                messageContainer.scrollTop = messageContainer.scrollHeight;
            }
        })
    }

    socket.on('connected', function (users) {

        checkLogin(users);

        const loginData = JSON.parse(localStorage.getItem('login'));

        emitLogin(loginData);


    });

    socket.on('userUpdate', (users)=>{
        let usersActiveList = renderUsers(users);
        usersList.innerHTML = usersActiveList;
    });



    authBtn.addEventListener('click', e=>{
        const userName = name.value;
        const userNick = nickname.value;

        if (userName && userNick){
            const alertMessage = document.querySelector('.alertMessage');
            if (alertMessage) {
                alertMessage.parentNode.removeChild(alertMessage);
            }
            const data = {
                'userName': userName,
                'userNick': userNick,
                'online': true,
                'userAva': '',
                'userHistory': []
            };
            localStorage.setItem('login', JSON.stringify(data));

            socket.emit('getUser', userNick);

            socket.on('sendUser', users=>{
                checkLogin(users);
            });

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
            userNick: userNick.trim(),
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

        const user = JSON.parse(localStorage.getItem('login'));
        user.userHistory.push(message);
        localStorage.setItem('login', JSON.stringify(user));
        messagesListOnPage.push(message);

        let messagesList = renderMessages(messagesListOnPage);
            messages.innerHTML = messagesList;
            messageContainer.scrollTop = messageContainer.scrollHeight;
    }


});