const uuid = require('uuid/v1');
const express = require('express');
const SocketServer = require('ws').Server;

const PORT = 3001;

//=============================***** set up the express server *****=========================================

const server = express()
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => { console.log(`Listening on ${PORT}`);});

//=========================********* Create the websocket server ****========================================

const wss = new SocketServer({server});

//=================================****** helpers fucntions ******===========================================

function broadcast(data) {
  const newData = JSON.stringify(data);
  //send the messages coming from one client to all the clients
  wss.clients.forEach((client) => {
    client.send(newData);
  });
}

function handleIncomingMessage(data, color) {
  const parsedData = JSON.parse(data);

  //we test an input against the expression that starts with http/https and ends in .jpg/.jpeg/.png/.gif  and it's case insensitive
  const reg = /^https?:\/\/.+\.(jpe?g|png|gif)$/i ;
  if (reg.test(parsedData.content)) {
    parsedData.type = 'imageMessage';
  }
  //Add a uuid for every message that is being sent back from the client
  parsedData.id = uuid();
  parsedData.color = color;
  broadcast(parsedData);
}

//=============================*******Handling the websocket connection******================================

// When a client connects they are assigned a socket, represented by the client parameter in the callback.
wss.on('connection', (client) => {
  console.log('client connected');

  //Create a color on a new connection and pass it to the handleIncomingMessage to set the username color
  const color= '#'+(Math.random()*0xFFFFFF<<0).toString(16);

  //Create an object to keep track of total # of clients connected and pass it to the broadcast function
  const usersNum = {
    num: wss.clients.size,
    type: 'userNumNotification'
  };

  broadcast(usersNum);

  client.on('message', (data) => {
    handleIncomingMessage(data, color);
  });

  client.on('close', () => {
    console.log('client disconnected');
    const usersNum = {
      num :wss.clients.size,
      type: 'userNumNotification'
    };
    broadcast(usersNum);
  });

});
