import { createWorker } from 'mediasoup';
import { v4 as uuidv4 } from 'uuid';

export class Room {
  constructor(roomId) {
    this.roomId = roomId;
    this.users = []; // [{ socket, transport, consumers, producers }]
    this.transports = [];
    this.producers = [];
    this.worker = null;
    this.router = null;
  }

  async initializeRouter() {
    this.worker = await createWorker({
      rtcMinPort: 10000,
      rtcMaxPort: 20000,
    });

    console.log(`Worker initialized for room ${this.roomId}`);

    this.router = await this.worker.createRouter({
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2,
        },
      ],
    });

    console.log(`Router initialized for room ${this.roomId}`);
  }

  addUser(ws) {
    const userExists = this.users.some(u => u.socket === ws);
    if (!userExists) {
      this.users.push({
        socket: ws,
        transport: null,
        producers: [],
        consumers: [],
      });
      console.log(`User added to room ${this.roomId}`);
    }
  }

  removeUser(ws) {
    this.users = this.users.filter(user => user.socket !== ws);
    this.transports = this.transports.filter(t => t.appData.socket !== ws);
    this.producers = this.producers.filter(p => p.socket !== ws);
    console.log(`User removed from room ${this.roomId}`);
  }

  getUser(ws) {
    return this.users.find(user => user.socket === ws);
  }

  getTransport(ws) {
    const user = this.getUser(ws);
    return user?.transport || null;
  }

  getTransportBySocket(ws) {
    return this.transports.find(t => t.appData?.socket === ws);
  }

  async createTransport(ws) {
    const transport = await this.router.createWebRtcTransport({
      listenIps: [{ ip: '127.0.0.1', announcedIp: null }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      appData: { socket: ws },
    });

    this.transports.push(transport);

    const user = this.getUser(ws);


    
    if (user) {
      user.transport = transport;
    }

    transport.observer.on('newproducer', (producer) => {
      console.log(`New producer created [id:${producer.id}]`);
      this.broadcast({
        action: 'NEW_PRODUCER',
        producerId: producer.id,
      });
    });

    return transport;
  }

  async createProducer(ws, rtpParameters, kind) {
    const transport = this.getTransport(ws);
    if (!transport) throw new Error('Transport not found for user');

    const producer = await transport.produce({ kind, rtpParameters });

    this.producers.push({ socket: ws, producer });

    const user = this.getUser(ws);
    if (user) {
      user.producers.push(producer);
    }

    return producer;
  }

  saveProducer(ws, producer) {
    this.producers.push({ socket: ws, producer });

    const user = this.getUser(ws);
    if (user) {
      user.producers.push(producer);
    }
  }

  addConsumer(ws, consumer) {
    const user = this.getUser(ws);
    if (user) {
      user.consumers.push(consumer);
    }
  }

  broadcast(message) {
    for (const user of this.users) {
      try {
        user.socket.send(JSON.stringify(message));
      } catch (e) {
        console.error('Broadcast error:', e);
      }
    }
  }
}
