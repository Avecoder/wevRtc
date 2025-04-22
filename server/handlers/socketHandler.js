import { Room } from '../rooms/rooms.js';
import { v4 as uuidv4 } from 'uuid';

export let rooms = {};



const handleCreateRoom = async ({ws, name}) => {
    const roomId = uuidv4();

    if (!rooms[roomId]) {
        // Создаем новую комнату и инициализируем ее
        const room = new Room(roomId);
        await room.initializeRouter(); 


        rooms[roomId] = room;

        
        

        // Получаем RTP-способности роутера
        const routerRtpCapabilities = room.router.rtpCapabilities;

        
        
        ws.name = name
        room.addUser(ws)
        const transport = await room.createTransport(ws)
        const transportOptions = {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters
        };
        console.log('Transport created:', transport.id);
        ws.send(JSON.stringify({ 
            type: 'roomCreated', 
            roomId,
            transportOptions,
            routerRtpCapabilities: routerRtpCapabilities
        }));
        console.log(`Room ${roomId} created.`);
    } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Room already exists' }));
    }
}

const handleJoinRoom = async ({ws, roomId, name}) => {
    try {

        if (!rooms[roomId.trim()]) {
            throw new Error('Room not found');
        }

        // Получаем комнату
        const room = rooms[roomId];
        
        
        // Получаем RTP-способности роутера
        const routerRtpCapabilities = room.router.rtpCapabilities;

        

        ws.name = name

        room.addUser(ws)

        const transport = await room.createTransport(ws)
        console.log('Transport created:', transport.id);

        const transportOptions = {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters
          };

        // Отправляем параметры транспорта и RTP-способности клиенту
        ws.send(JSON.stringify({
            type: 'transportCreated',
            transportOptions,
            routerRtpCapabilities: routerRtpCapabilities // Добавляем RTP-способности
        }));

        room.broadcast({
            type: 'userListUpdated',
            users: room.users.map((user, i) => ({ id: i, name: user.socket.name })) // можешь вместо id что-то свое вставить
        });

        console.log(`Client connected to room ${roomId}`);
    } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
        console.error(`Error joining room: ${err.message}`);
    }
};


const handleGetList = async ({ws, roomId}) => {
    try {
        const room = rooms[roomId.trim()]
        if (!room) {
            throw new Error('Room not found');
        }

        ws.send(JSON.stringify({ type: 'list', users: room.users.map(u => ({...u, name: u.socket.name}))}));

    } catch(err) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
        console.error(`Error get room: ${err.message}`);
    }
}
const handleLeaveRoom = async ({ws, roomId}) => {
    try {

        console.log('LEAVE - ', roomId)
        const room = rooms[roomId.trim()]
        if (!room) {
            throw new Error('Room not found');
        }

        room.removeUser(ws)

        room.broadcast({
            type: 'userListUpdated',
            users: room.users.map((user, i) => ({ id: i, name: user.name })) 
        });
    } catch(err) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
        console.error(`Error leave room: ${err.message}`);
    }
}


const handleCreateProducer = async ({ws, roomId, kind, rtpParameters}) => {
    try {
      const room = rooms[roomId];
      if (!room) {
        throw new Error('Room not found');
      }
  
  
      const transport = room.getTransport(ws);


      if (!transport) {
        throw new Error('Transport not found for user');
      }
  
      const producer = await transport.produce({
        kind,
        rtpParameters,
      });
  
      room.saveProducer(ws, producer); // Сохраняем, если надо
  
      console.log(`Producer created: ${producer.id}`);

      room.broadcast({
        type: 'NEW_PRODUCER_CREATED',
        producerId: producer.id,
        producerUserId: ws.userId, // Уникальный идентификатор пользователя
      });
  
      ws.send(JSON.stringify({
        type: 'PRODUCERCREATED',
        producerId: producer.id,
      }));
  
    } catch (err) {
      console.error('Something wrong with producer:', err);
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to create producer' }));
    }
  };
  
  const handleConsume = async ({ws, roomId, producerId}) => {
    
  

    const room = rooms[roomId];
    if (!room) return ws.send(JSON.stringify({ type: 'error', message: 'Room not tuts' }));
    const rtpCapabilities = room.router.rtpCapabilities
    const transport = room.getTransport(ws);
    const producer = room.findProducerById(producerId);
    if (!producer) return ws.send(JSON.stringify({ type: 'error', message: 'Producer not found' }));
  
    if (!room.router.canConsume({ producerId, rtpCapabilities })) {
      return ws.send(JSON.stringify({ type: 'error', message: 'Cannot consume' }));
    }
  
    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: false
    });
  
    // Сохраняем consumer, если нужно
    room.addConsumer(ws, consumer);
  
    ws.send(JSON.stringify({
      type: 'consumerCreated',
      consumerParameters: {
        id: consumer.id,
        producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
      }
    }));
  };
  


const actions = {
    'JOIN': handleJoinRoom,
    'CREATE': handleCreateRoom,
    'LIST': handleGetList,
    'LEAVE': handleLeaveRoom,
    'CREATEPRODUCER': handleCreateProducer,
    'CONSUME': handleConsume
}


export const parseMessage = (data) => {
    try {
        console.log(JSON.parse(data.toString()))
        const {action, roomId, name, kind, rtpParameters, producerUserId} = JSON.parse(data.toString());

        return {currAction: actions[action], roomId, name, kind, rtpParameters, producerUserId}
    } catch (err){
        console.error('Parse error - ', err)
        return () => {}
    }
}