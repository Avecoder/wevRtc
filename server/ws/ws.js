import WebSocket, {WebSocketServer} from "ws";
import dotenv from 'dotenv'
import {parseMessage, rooms} from '../handlers/socketHandler.js'
dotenv.config()




export const PORT = process.env.WS_PORT || 5555;


export const webSocket = new WebSocketServer({port: PORT})



webSocket.on('connection', (ws) => {
    console.log('A user connected');
    
    // Когда сервер получает сообщение от клиента
    ws.on('message', (message) => {

      try {
        const {currAction, roomId, name, kind, rtpParameters, producerUserId} = parseMessage(message)
        currAction?.({ws, roomId, name, kind, rtpParameters, producerUserId})
      } catch(err) {
        console.log('ERROR ws message - ', err)
      }
    });
  
    // Когда клиент закрывает соединение
    ws.on('close', () => {
      console.log('A user disconnected');
      for (const room of Object.values(rooms)) {
        room.removeUser(ws)
    
        // Опционально — удаляем transport, привязанный к этому ws
        const transportsToRemove = room.transports.filter(t => t.appData?.ws === ws)
        transportsToRemove.forEach(t => {
          t.close()
          room.transports = room.transports.filter(r => r !== t)
        })
      }
    });
  });