import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  ReactNode
} from 'react'
import { useLocation } from 'react-router-dom'

export type WebSocketContextType = {
  socket: WebSocket | null
  sendMessage: (data: any) => void
  subscribe: (type: string, callback: (payload: any) => void) => void
  unsubscribe: (type: string) => void
  getSubscribe: (type: string) => ((payload: any) => void) | undefined;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketWrap')
  }
  return context
}

export const WebSocketWrap = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const subscribersRef = useRef<Map<string, (data: any) => void>>(new Map())

  useEffect(() => {
    const ws = new WebSocket('ws://192.168.3.13:8080')

    ws.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data)

        const type = data?.type
        if (type && subscribersRef.current.has(type)) {
          const handler = subscribersRef.current.get(type)
          handler?.(data)
        } else {
          console.log('Unhandled WS message:', data)
        }
      } catch (err) {
        console.error('Invalid message', message.data)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
    }

    setSocket(ws)

    return () => {
      ws.close()
    }
  }, [])

  const sendMessage = (data: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket not ready')
    }
  }

  const subscribe = (type: string, callback: (data: any) => void) => {
    subscribersRef.current.set(type, callback)
  }

  const unsubscribe = (type: string) => {
    subscribersRef.current.delete(type)
  }

  const getSubscribe = (type: string): ((data: any) => void) | undefined => {
    return subscribersRef.current.get(type)
  }



  return (
    <WebSocketContext.Provider
      value={{ socket, sendMessage, subscribe, unsubscribe, getSubscribe }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}
