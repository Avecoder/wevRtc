import { useEffect, useRef, useState } from 'react'
import { useWebSocket } from '../context/WebSocketWrap'

export const useConsumer = (roomId: string, time: number) => {
  const { socket: ws, getSubscribe } = useWebSocket()
  const [consumers, setConsumers] = useState<any[]>([])

  const transportInfo: any = getSubscribe('transport')
  const { recvTransport } = transportInfo()

  const handleNewProducer = async (producerId: string, producerUserId: string) => {
    if (!recvTransport || !ws) return

    // Запрашиваем у сервера разрешение на consume
    const msg = {
      action: 'CONSUME',
      producerId,
      producerUserId,
      roomId
    }

    ws.send(JSON.stringify(msg))
  }

  // Мутация и управление громкостью аудио
  const muteAudio = (userId: string, muted: boolean) => {
    const consumer = consumers.find(c => c.userId === userId)
    if (consumer && consumer.audio) {
      consumer.audio.muted = muted
    }
  }

  const setTalkingUser = (userId: string) => {
    const currentTalking = consumers.find(c => c.isTalking)
    if (currentTalking) {
      currentTalking.audio.muted = true // Мутим текущего говорящего
    }
    const newTalking = consumers.find(c => c.userId === userId)
    if (newTalking) {
      newTalking.audio.muted = false // Размутим нового говорящего
      newTalking.isTalking = true
    }
  }

  useEffect(() => {
    if (!ws) return

    const handleMessage = async (e: MessageEvent) => {
      const data = JSON.parse(e.data)

      console.log(data)

      if (data.type === 'consumerCreated') {
        const {
          id,
          producerId,
          kind,
          rtpParameters,
          appData,
        } = data.consumerParameters

        if(appData.time == time) return;

        recvTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {

          console.log('RECV DTLS PARAMS', dtlsParameters)
          try {
            // Отправь на сервер dtlsParameters, чтобы сервер-side transport смог принять соединение
            ws.send(JSON.stringify({
              action: 'CONNECT_RECV_TRANSPORT',
              dtlsParameters,
              roomId,
            }))
            // вызываешь callback, когда сервер подтвердил
            callback()
          } catch (err) {
            errback(err)
          }
        })

        try {
          const consumer = await recvTransport.consume({
            id,
            producerId,
            kind,
            rtpParameters,
            appData,
          })

          console.log(consumer)

          console.log('consumerCreated:', rtpParameters);

          const stream = new MediaStream([consumer.track]);

          const track = stream.getAudioTracks()[0];
          console.log('Track:', track);
          console.log('Enabled:', track?.enabled);
          console.log('ReadyState:', track?.readyState);


          // const stream2 = new MediaStream()
          // stream2.addTrack(audioTrack)

          // console.log(stream)
          // console.log(stream2)

          const audioContext = new AudioContext();
          if (!audioContext) {
            console.error('Не удалось создать AudioContext');
          } else {
            console.log('AudioContext успешно создан');
          }

          const source = audioContext.createMediaStreamSource(new MediaStream([consumer.track]));
          if (!source) {
            console.error('Не удалось создать источник для MediaStream');
          } else {
            console.log('Источник MediaStream успешно создан');
          }

          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }


          const audio = new Audio();
          // audio.srcObject = stream; // Поток с нужными треками
          // audio.autoplay = true;
          // audio.muted = false;
          // // audio.controls = true;
          // audio.volume = 1;

          // // Отслеживаем событие, когда аудио готово к воспроизведению
          // audio.oncanplaythrough = () => {
          //   console.log('Audio is ready to play');
          // };

          setConsumers(prev => [
            ...prev,
            {
              consumer,
              stream,
              userId: appData?.userId || '',
              audio,
              isTalking: false // По умолчанию никто не говорит
            }
          ])

        } catch (err) {
          console.error('Consumer error:', err)
        }
      }

      // Сервер говорит, что появился новый producer
      if (data.type === 'NEW_PRODUCER_CREATED') {
        console.log(data)
        const { producerId, producerUserId } = data
        await handleNewProducer(producerId, producerUserId)
      }
    }

    ws.addEventListener('message', handleMessage)

    return () => {
      ws.removeEventListener('message', handleMessage)
    }
  }, [ws, recvTransport])

  console.log(consumers)

  return {
    consumers,
    muteAudio,
    setTalkingUser, // Возвращаем функцию для изменения говорящего
  }
}
