const messageMarkup = `
        <div class="chat-log__item chat-log__item--own">
            <div class="chat-log__author">{username}<span class="chat-log__time">{time}</span></div>
            <div class="chat-log__message">{message}</div>
        </div>
  `;
const notificationMarkup = `<div class="chat-log__noty">{message}</div>`;
const userMarkup = `<div class="user">{username}</div>`;

const addNotification = ({message, wrapper}) => {
    const notification = document.createElement('div');
    notification.className = 'chat-log__noty';
    notification.innerHTML = message;
    wrapper.appendChild(notification);
}

const addMessage = ({message, wrapper, username, time, isMyMessage}) => {
    const messageItem = document.createElement('div');
    messageItem.className = isMyMessage ? "chat-log__item chat-log__item--own" : "chat-log__item";
    messageItem.innerHTML = `
            <div class="chat-log__author">${username}<span class="chat-log__time">${time}</span></div>
            <div class="chat-log__message">${message}</div>
`;
    wrapper.appendChild(messageItem);
}

const updateActiveUsers = ({message, wrapper}) => {
    const users = JSON.parse(message);
    let markup = '';
    users.forEach(user => {
        markup += `<div class="user">${user.username}</div>`
    })
    wrapper.innerHTML = markup;
}

const webSocketsInit = () => {
    const form = document.getElementById("form");
    const input = document.getElementById("input");
    const usernameInput = document.getElementById("username");
    const messagesWrap = document.getElementById("messages");
    const usersWrap = document.getElementById("users");

    usernameInput.value = `User_${new Date().getTime().toString().slice(7)}`

    const ws = new WebSocket('ws://localhost:3000');

    ws.onopen = () => {
        console.log(`I've connected`);
        ws.send(JSON.stringify({
            event: 'connection',
            username: usernameInput.value
        }))
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        ws.send(JSON.stringify({
            event: 'message',
            username: usernameInput.value,
            message: input.value,
            time: new Date().toLocaleTimeString()
        }));
        input.value = '';
    })

    ws.onmessage = ({data}) => {
        const {type, message, username, time} = JSON.parse(data);

        switch (type) {
            case 'notification':
                addNotification({message, wrapper: messagesWrap})
                break;
            case 'activeUsers':
                updateActiveUsers({message, wrapper: usersWrap})
                break;
            case 'message':
                addMessage({
                    message,
                    wrapper: messagesWrap,
                    username,
                    time,
                    isMyMessage: username === usernameInput.value
                })
                break;
            default:
                break;
        }

    }

};

window.addEventListener("load", webSocketsInit);
