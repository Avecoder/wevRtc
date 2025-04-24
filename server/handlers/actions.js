import { Room } from '../rooms/rooms.js';
import { v4 as uuidv4 } from 'uuid';

export let rooms = {};

function generateUniqueSSRC() {
  const uniqueId = uuidv4(); 
  return parseInt(uniqueId.replace(/-/g, '').slice(0, 9), 16);
}

const handleCreateRoom = async ({ ws, name }) => {
  const roomId = uuidv4();

  if (!rooms[roomId]) {
    const room = new Room(roomId);
    await room.initializeRouter();

    rooms[roomId] = room;

    ws.name = name;
    room.addUser(ws);

    const transport = await room.createTransport(ws);
    const transportOptions = {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters
    };

    ws.send(JSON.stringify({
      type: 'roomCreated',
      roomId,
      transportOptions,
      routerRtpCapabilities: room.router.rtpCapabilities
    }));
  } else {
    ws.send(JSON.stringify({ type: 'error', message: 'Room already exists' }));
  }
};

const handleJoinRoom = async ({ ws, roomId, name }) => {
  try {
    const room = rooms[roomId.trim()];
    if (!room) throw new Error('Room not found');

    ws.name = name;
    room.addUser(ws);

    const transport = await room.createTransport(ws);
    const transportOptions = {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters
    };

    ws.send(JSON.stringify({
      type: 'transportCreated',
      transportOptions,
      routerRtpCapabilities: room.router.rtpCapabilities
    }));

    room.broadcast({
      type: 'userListUpdated',
      users: room.users.map((user, i) => ({ id: i, name: user.socket.name }))
    });
  } catch (err) {
    ws.send(JSON.stringify({ type: 'error', message: err.message }));
    console.error(`Error joining room: ${err.message}`);
  }
};

const handleGetList = async ({ ws, roomId }) => {
  try {
    const room = rooms[roomId.trim()];
    if (!room) throw new Error('Room not found');

    ws.send(JSON.stringify({
      type: 'list',
      users: room.users.map(u => ({ ...u, name: u.socket.name }))
    }));
  } catch (err) {
    ws.send(JSON.stringify({ type: 'error', message: err.message }));
    console.error(`Error get room: ${err.message}`);
  }
};

const handleLeaveRoom = async ({ ws, roomId }) => {
  try {
    const room = rooms[roomId.trim()];
    if (!room) throw new Error('Room not found');

    room.removeUser(ws);

    room.broadcast({
      type: 'userListUpdated',
      users: room.users.map((user, i) => ({ id: i, name: user.socket.name }))
    });
  } catch (err) {
    ws.send(JSON.stringify({ type: 'error', message: err.message }));
    console.error(`Error leave room: ${err.message}`);
  }
};

const handleCreateProducer = async ({ ws, roomId, kind, rtpParameters, time }) => {
  try {
    const room = rooms[roomId];
    if (!room) throw new Error('Room not found');

    const transport = room.getTransport(ws);
    if (!transport) throw new Error('Transport not found for user');

    const producer = await transport.produce({
      kind,
      rtpParameters,
      appData: { time },
      paused: false,
      encodings: [
        { ssrc: generateUniqueSSRC(), maxBitrate: 1000000 }
      ],
      codecOptions: {
        videoGoogleStartBitrate: 1000
      }
    });

    room.saveProducer(ws, producer);

    room.broadcast({
      type: 'NEW_PRODUCER_CREATED',
      producerId: producer.id,
      producerUserId: ws.userId,
      appData: { time }
    });

    ws.send(JSON.stringify({
      type: 'PRODUCERCREATED',
      producerId: producer.id
    }));
  } catch (err) {
    console.error('Something wrong with producer:', err);
    ws.send(JSON.stringify({ type: 'error', message: 'Failed to create producer' }));
  }
};

const handleConsume = async ({ ws, roomId, producerId }) => {
  const room = rooms[roomId];
  if (!room) return ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));

  const rtpCapabilities = room.router.rtpCapabilities;
  const transport = room.getTransport(ws);
  const producer = room.findProducerById(producerId);

  if (!producer) return ws.send(JSON.stringify({ type: 'error', message: 'Producer not found' }));

  const canConsume = room.router.canConsume({ producerId, rtpCapabilities });
  if (!canConsume) {
    return ws.send(JSON.stringify({ type: 'error', message: 'Cannot consume' }));
  }

  try {
    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: false
    });

    room.addConsumer(ws, consumer);

    await consumer.resume();

    ws.send(JSON.stringify({
      type: 'consumerCreated',
      consumerParameters: {
        id: consumer.id,
        producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        appData: producer.appData
      }
    }));
  } catch (error) {
    console.error('Error while consuming:', error);
    ws.send(JSON.stringify({ type: 'error', message: 'Failed to consume' }));
  }
};

const handleConnectRecvTransport = async ({ ws, roomId, dtlsParameters }) => {
  try {
    const room = rooms[roomId.trim()];
    if (!room) throw new Error('Room not found');

    const transport = room.getTransport(ws);
    if (!transport) throw new Error('Transport not found for user');

    

  } catch (err) {
    console.error('Error connecting recv transport:', err);
    ws.send(JSON.stringify({ type: 'error', message: 'Failed to connect recv transport' }));
  }
};

const handleConnectTransport = async ({ ws, roomId, dtlsParameters, transportType }) => {
  try {
    const room = rooms[roomId.trim()];
    if (!room) throw new Error('Room not found');

    const transport = room.getTransport(ws, transportType);
    if (!transport) throw new Error('Transport not found for user');

    await transport.connect({ dtlsParameters });

    ws.send(JSON.stringify({
      type: `${transportType}_TRANSPORT_CONNECTED`,
      transportId: transport.id
    }));
  } catch (err) {
    console.error('Error connecting transport:', err);
    ws.send(JSON.stringify({ type: 'error', message: 'Failed to connect transport' }));
  }
};

const actions = {
  'JOIN': handleJoinRoom, // first
  'CREATE': handleCreateRoom, // first
  'LIST': handleGetList, // first
  'LEAVE': handleLeaveRoom, // recent
  'CREATEPRODUCER': handleCreateProducer, // first
  'CONSUME': handleConsume, // first
  'CONNECT_RECV_TRANSPORT': handleConnectRecvTransport, // second
  'CONNECTTRANSPORT': handleConnectTransport // second
};

export const parseMessage = (data) => {
  try {
    
    const { action, ...somethingData } = JSON.parse(data.toString());

    if(somethingData.roomId) {
      const room = rooms[somethingData.roomId.trim()];
      if(room) {
        const transports = room.getAllTransports()

      console.log('TRANSPORTS - ', transports)
      }
      
    }
    return { currAction: actions[action], ...somethingData };
  } catch (err) {
    console.error('Parse error - ', err);
    return () => {};
  }
};
