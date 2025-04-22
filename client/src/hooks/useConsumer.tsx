import { useEffect, useRef, useState } from 'react'
import { useWebSocket } from '../context/WebSocketWrap'

export const useConsumer = (roomId: string) => {
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
    }

    ws.send(JSON.stringify(msg))
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
        } = data

        try {
          const consumer = await recvTransport.consume({
            id,
            producerId,
            kind,
            rtpParameters,
            appData,
          })

          setConsumers(prev => [...prev, consumer])

          const stream = new MediaStream()
          stream.addTrack(consumer.track)

          // Ты можешь сделать так, чтобы вернуть { stream, consumer, userId } и потом использовать
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
  }
}
