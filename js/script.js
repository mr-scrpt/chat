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
        usersBlockTitle = document.querySelector('.users__block_title'),
        countMembers = document.querySelector('.countMembers');
        usersList = document.querySelector('#usersList'),
        messagesPhoto = document.querySelector('#messagesPhoto'),
        templateOfMessage = document.querySelector('#messageList').textContent,
        templateOfUsers = document.querySelector('#listOfUsers').textContent,
        messageForm = document.querySelector('.message__form'),
        userPhoto = document.querySelector('#userPhoto'),
        avatarImage = document.querySelector('#avatarImage'),
        noPhoto = document.querySelector('.no_photo'),
        renderUsers = Handlebars.compile(templateOfUsers),
        renderMessages = Handlebars.compile(templateOfMessage),
        usersServer = [],
        usersServerOnline = [],
        userCurrent = {},
        messagesListOnPage = [],
        socket = io.connect('http://localhost:3000/'),
        fileReader = new FileReader();




    function checkLogin(users) {
        const loginData = JSON.parse(localStorage.getItem('login'));

        if(loginData){

            userCurrent = loginData;
            userNick = userCurrent.userNick;
            socket.emit('loginUser', loginData);

            if (users.length > 0){
                renderHistory(users, userCurrent);
            }
            renderUserHtml(userCurrent);
            avatarImage.classList.add(`ava_${userCurrent.userNick}`)
        }
    }

    function renderHistory(users, user){
        let userNick = user.userNick;

        users.forEach(item=>{
            if (item.userNick === userNick){
                if (item.userHistory) {
                    messagesListOnPage = [...item.userHistory];

                    let messagesList = renderMessages(messagesListOnPage);
                    messages.innerHTML = messagesList;
                    messageContainer.scrollTop = messageContainer.scrollHeight;
                }
            }
        })
    }

    socket.on('updUsers', users=>{
        usersServer = users;
        usersServerOnline = [];
        users.forEach(item=>{
            if (item.online === true){
                usersServerOnline.push(item);
            }

        });
        let usersActiveList = renderUsers(usersServerOnline);
        usersList.innerHTML = usersActiveList;
        countUsersHtml(usersServerOnline);
    });

    socket.on('updAva', users=>{
        usersServer = users;

        usersServer.forEach(item=>{
            console.log(item);
            if(item.userAvatar){
                const images = document.querySelectorAll(`.ava_${item.userNick}`);
                if(images){
                    images.forEach(image=>{
                        image.src = item.userAvatar;
                    })
                }
                if(item.userNick === userCurrent.userNick){
                    userCurrent.userAvatar = item.userAvatar;
                }
            }
        });
        if (userCurrent.userAvatar){
            if (avatarImage.classList.contains('hidden')){
                avatarImage.classList.remove('hidden')
            }
            if (!noPhoto.classList.contains('hidden')){
                noPhoto.classList.add('hidden')
            }
        }

    });


    socket.on('connected', function (users) {
        usersServer = users;
        checkLogin(usersServer);

    });


    userPhoto.addEventListener('change', e=>{
        const [avatar] = e.target.files;
        if (avatar){
            if (avatar.size > 300 * 1024){
                alert(`Файл слишком большой: ${avatar.size}`)
            } else {
                fileReader.readAsDataURL(avatar);
            }
        }
    });
    fileReader.addEventListener('load', e => {
        socket.emit('loadAvatar', fileReader.result, userCurrent);
        if (avatarImage.classList.contains('hidden')){
            avatarImage.classList.remove('hidden')
        }
        if (!noPhoto.classList.contains('hidden')){
            noPhoto.classList.add('hidden')
        }
    });

    authBtn.addEventListener('click', e=>{
        const userName = name.value;
        const userNick = nickname.value;


        if (userName && userNick){
            const alertMessage = document.querySelector('.alertMessage');
            if (alertMessage) {
                alertMessage.parentNode.removeChild(alertMessage);
            }
            const user = {
                'userName': userName,
                'userNick': userNick,
                'online': true

            };
            localStorage.setItem('login', JSON.stringify(user));
            checkLogin(usersServer);

        } else {
            const alertMessage = document.createElement('div');
            alertMessage.classList.add('alertMessage');
            alertMessage.innerText = 'Все поля обязательны';
            authPopup.appendChild(alertMessage);

        }
    });

    sendBtn.addEventListener('click', (event) => {
        event.preventDefault();

        let messageInfo = {
            userNick: userNick.trim(),
            message: messageText.value.trim()
        };


        if(messageText.value){
            socket.emit('msg', messageInfo);
            messageText.value = '';

            if(messageText.classList.contains('message__form_input-error')){
                messageText.classList.remove('message__form_input-error');
            }
        }else {
            messageText.classList.add('message__form_input-error');
        }


    });

    socket.on('message', addMessage);

    function addMessage(message){

        messagesListOnPage.push(message);

        let messagesList = renderMessages(messagesListOnPage);
            messages.innerHTML = messagesList;
            messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    function renderUserHtml(user = false) {
        if (user){
            authPopup.classList.add('hidden');
            messageForm.classList.remove('hidden');
            members.classList.remove('hidden');
            nameOfuser.innerText = user.userNick;
            let logUot = document.createElement('button');
            logUot.classList.add('logout');
            logUot.innerText = 'Выйти';
            usersBlockTitle.appendChild(logUot);
            logUot.addEventListener('click', ()=>{
                localStorage.removeItem('login');
                document.location.reload();

            })
        }
    }
    function countUsersHtml() {
        countMembers.innerText =`(${usersServerOnline.length})`;
    }

});