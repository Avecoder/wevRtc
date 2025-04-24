

import React, { useEffect } from 'react'
import { useMicro } from './useMicro';
import { useWebSocket } from '../context/WebSocketWrap';

export const useProducer = (roomId: string, time: number) => {
    const {socket: ws, getSubscribe} = useWebSocket()
    const {audioTrack} = useMicro()

    
  
    const handleCreateStream = async () => {
        const transportInfo: any = getSubscribe('transport');
        const { sendTransport, recvTransport } = transportInfo();
      
        if (!sendTransport || !audioTrack || !ws) {
          console.error("sendTransport or audioTrack is undefined");
          return;
        }
      
        try {
          // 🔌 Connect DTLS
          sendTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            console.log("DTLS PARAM - ", dtlsParameters)
            try {
              const message = JSON.stringify({
                action: 'CONNECTTRANSPORT',
                dtlsParameters,
                direction: 'send', // можно потом использовать для выбора транспорта на сервере
                roomId
              });
      
              ws.send(message);
              callback(); // Успешно соединены
            } catch (error) {
              console.error("Transport connect error:", error);
              errback(error);
            }
          });
      
          // 📡 Produce
          sendTransport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {

            console.log("RTP PARAM - ", rtpParameters)
            try {
              const message = {
                action: 'CREATEPRODUCER',
                kind,
                rtpParameters,
                roomId,
                time
              };
      
              const listener = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'PRODUCERCREATED') {
                  ws.removeEventListener('message', listener);
                  callback({ id: data.producerId });
                }
              };
      
              ws.addEventListener('message', listener);
              ws.send(JSON.stringify(message));
            } catch (error) {
              console.error("Produce error:", error);
              errback(error);
            }
          });

          console.log('audioTrack:', audioTrack);
          console.log('kind:', audioTrack.kind);
          console.log('id:', audioTrack.id);
          console.log('label:', audioTrack.label);
          console.log('enabled:', audioTrack.enabled);
          console.log('muted:', audioTrack.muted);
          console.log('readyState:', audioTrack.readyState);
                
          // 🧪 Пытаемся создать producer
          const producer = await sendTransport.produce({
            track: audioTrack,
            codecOptions: {
              opusStereo: true,
              opusDtx: true,
            },
            appData: {
              time
            }
          });
      
          console.log("Producer created:", producer);
        } catch (error) {
          console.error("Error during produce:", error);
        }
      };
      
      

    useEffect(() => {
        if(audioTrack) handleCreateStream()
    }, [audioTrack])
}
