import { useLocation } from "react-router-dom"
import { UserCard } from "./UserCard"
import { useEffect, useMemo, useState } from "react"
import { useWebSocket } from "../context/WebSocketWrap"
import { calculationGrid } from "../utils/grid"
import { Controls } from "./Controls"
import { useMicro } from "../hooks/useMicro"
import { useProducer } from "../hooks/useProducer"
import { useConsumer } from "../hooks/useConsumer"



export const RoomPage = () => {

    const pathname = useLocation()
    const searchParams = new URLSearchParams(pathname.search)
    const id = searchParams.get('id')
    const [users, setUsers] = useState([
        {
            name: localStorage.getItem('userName') || 'You'
        },
    ])

    const capabilities = RTCRtpReceiver.getCapabilities('audio');
console.log(capabilities);

    const {socket: ws, getSubscribe} = useWebSocket()


    const handleGetList = () => {
        if(!ws) return;
        const message = JSON.stringify({action: 'LIST', roomId: id})

        
        
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message)
        } else { 
            ws.addEventListener('open', () => {
              ws.send(message)
            }, { once: true })
        }
    }

    const hadleLeaveRoom = () => {
        if(!ws) return;
        const message = JSON.stringify({action: 'LEAVE', roomId: id})
        ws.send(message)
    }

    const time = useMemo(() => Date.now(), []);

    useProducer(id ?? '', time)
      
    useConsumer(id ?? '', time)

    useEffect(() => {
        if(ws) {
            
            
            ws.onmessage = (event) => {
                // console.log(event)
                const {users: updatedUsers} = JSON.parse(event.data)

                console.log(updatedUsers)
                

               if(updatedUsers) setUsers([...updatedUsers])
            }

            ws.onopen = (event) => {
                handleGetList()
               
            }
        }
    }, [ws])


    useEffect(() => {
        
        handleGetList()
    }, [ws?.readyState])

    return (
        <>
        <div style={{  width: '100vw', height: '100vh', ...calculationGrid(users.length), padding: '20px', boxSizing: 'border-box', position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
            {
                users.map(({name}, i) =>
                    <UserCard key={i} name={name} index={i} />
                )
            }
            <Controls hadleLeaveRoom={hadleLeaveRoom} />
        </div>
        </>
    )
}
