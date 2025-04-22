import { TextField, Button } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWebSocket } from '../context/WebSocketWrap'
import usePublicIP from '../hooks/usePublicIP'
import { Device } from 'mediasoup-client' // Импортируем Device из mediasoup-client
import { Edit, Save } from '@mui/icons-material'
import { useMicro } from '../hooks/useMicro'

export const StartPage = () => {
    const navigate = useNavigate()
    const [roomId, setRoomId] = useState('')
    const { offer } = usePublicIP()
    const {socket: ws, subscribe} = useWebSocket()
    const [device, setDevice] = useState(null) // Состояние для устройства mediasoup
    const [name, setName] = useState(localStorage.getItem('userName') || 'No name')
    const [isEdit, setEdit] = useState(false)


    const spanRef = useRef<HTMLSpanElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
  
    useEffect(() => {
      if (spanRef.current && inputRef.current) {
        const width = spanRef.current.offsetWidth
        inputRef.current.style.width = `${width + 10}px`
      }
    }, [name])


    const createDevice = async (response: any) => {
        const newDevice = new Device()
        await newDevice.load({ routerRtpCapabilities: response.routerRtpCapabilities })
        setDevice(newDevice)

        const sendTransport = newDevice.createSendTransport(response.transportOptions)
        const recvTransport = newDevice.createRecvTransport(response.transportOptions)

 
        subscribe('transport', () => {
            return {
                sendTransport,
                recvTransport
            }
        })
        return {
            sendTransport,
            recvTransport
        }
    }

    // Функция для создания комнаты
    const handleCreateRoom = async () => {
        if (!ws || !offer) return
        const data = JSON.stringify({ action: 'CREATE', name })
        ws.send(data)

        ws.onmessage = async (message) => {
            const response = JSON.parse(message.data)
            createDevice(response)
            if(response.roomId) navigate(`/room?id=${response.roomId}`)
        }
    }

    // Функция для подключения к комнате
    const handleJoinRoom = async () => {
        if (!ws || !roomId) return

        ws.send(JSON.stringify({ action: 'JOIN', roomId, name }))

        ws.onmessage = async (message) => {
            
            const response = JSON.parse(message.data)

            if (response.type === 'transportCreated') {
                const {sendTransport} = await createDevice(response)
                console.log('Transport created:', sendTransport)
                
                if(roomId) navigate(`/room?id=${roomId}`)
                
            }
        }
    }

    const handleChangeName = () => {
        localStorage.setItem('userName', name.trim())
        
    }

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    width: '100vw',
                    gap: '12px',
                    flexDirection: 'column',
                }}
            >
                <div style={{color: 'white', position: 'relative', paddingBottom: '100px'}}>
                <span
                    style={{
                        position: 'absolute',
                        visibility: 'hidden',
                        whiteSpace: 'pre',
                        fontSize: '51px',
                        fontWeight: 'bold',
                        fontFamily: 'inherit',
                    }}
                    ref={spanRef}
                >
                    {name || ' '}
                </span>
                    <input 
                        disabled={!isEdit}
                        ref={inputRef}
                        type="text" 
                        onChange={(e) => setName(e.target.value)}
                        style={{background: 'transparent', border: 'none', padding: 0, fontSize: '51px',  width: 'fit-content', fontWeight: 'bold', color: '#fff'}} value={name} 
                    />
                    <div 
                        style={{
                            cursor: 'pointer',
                            position: 'absolute',
                            top: -4,
                            right: -30
                        }} 
                        onClick={() => setEdit(prev => {
                            if(prev) handleChangeName()
                            return !prev
                        })}
                    >
                        {
                            isEdit ?
                            <Save sx={{size: 8}}  />
                            :
                            <Edit 
                                sx={{size: 8}} 
                            />
                        }
                    </div>
                </div>
                <Button style={{background: '#56f287', color: '#202020'}} variant="contained" onClick={handleCreateRoom}>
                    Create
                </Button>
                <div style={{color: 'white'}}>or</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TextField
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        id="outlined-basic"
                        label="Room ID"
                        variant="outlined"
                        sx={{
                            backgroundColor: '#333', // Цвет фона
                            '& .MuiInputBase-root': {
                                color: 'white', // Цвет текста
                            },
                            '& .MuiInputLabel-root': {
                                color: 'lightgray', // Цвет лейбла
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'lightgray', // Цвет рамки
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'white', // Цвет рамки при наведении
                            },
                            '& .MuiFormHelperText-root': {
                                color: 'lightgray', // Цвет подсказки
                            },
                        }}
                    />

                    <Button
                        variant="contained"
                        style={{ marginLeft: '10px', height: '56px', background: '#56f287', color: '#202020' }}
                        onClick={handleJoinRoom}
                    >
                        Join
                    </Button>
                </div>
            </div>
        </>
    )
}


