const uuid = require('uuid/v1');
const express = require('express');
const SocketServer = require('ws').Server

const PORT = 3001;

const server = express()
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => { console.log(`Listening on ${PORT}`);});

const wss = new SocketServer({server});

function broadcast(data) {
  //send the messages coming from one client to all the clients
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(data))
  })
}

function handleIncomingMessage(data) {
  const parsedData = JSON.parse(data);
  //Add a uuid for every message that is being sent back from the client
  parsedData.id = uuid();
  console.log(parsedData);
  broadcast(parsedData);
}

// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (client) => {
  console.log('client connected');
  client.on('message', (data) => {
    handleIncomingMessage(data)
  });

  // Set up a callback for when a client closes the socket.
  client.on('close', () => console.log('Client disconnected'));
})
