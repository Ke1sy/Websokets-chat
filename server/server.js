const ws = require('ws');
const {v4: uuidv4} = require('uuid');

const port = 3000;

const webSocketServer = new ws.Server({port}, () => {
    console.log(`Server is running on ${port}`);
});

let activeUsers = [];

const userConnected = (user) => {
    activeUsers.push(user)
}

const userDisconnected = (userId) => {
    activeUsers = activeUsers.filter(({id}) => id !== userId);
}

const getUserById = (userId) => {
    return activeUsers.find(({id}) => id === userId);
}

webSocketServer.on('connection', ws => {
    const uniqueId = uuidv4();
    ws.id = uniqueId;

    ws.on("message", message => {
        const parsedMessage = JSON.parse(message);
        switch (parsedMessage.event) {
            case 'connection':
                console.log(`${parsedMessage.username} has joined the chat`);

                userConnected({
                    id: uniqueId,
                    username: parsedMessage.username
                });

                broadcastMessage(JSON.stringify({
                    type: 'notification',
                    message: `${parsedMessage.username} has joined the chat`
                }))

                broadcastMessage(JSON.stringify({
                    type: 'activeUsers',
                    message: JSON.stringify(activeUsers)
                }))

                break;
           case 'message':
               broadcastMessage(JSON.stringify({
                   type: 'message',
                   ...parsedMessage
               }))
                break;
           default:
                break;
        }
    });

    ws.on('close', () => {
        const selectedUser = getUserById(ws.id);

        userDisconnected(ws.id)

        broadcastMessage(JSON.stringify({
            type: 'notification',
            message: `${selectedUser.username} has disconnected`
        }))

        broadcastMessage(JSON.stringify({
            type: 'activeUsers',
            message: JSON.stringify(activeUsers)
        }))
    })
});

const broadcastMessage = (message) => {
    webSocketServer.clients.forEach(client => {
        client.send(message);
    })
}