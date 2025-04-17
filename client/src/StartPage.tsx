import { TextField, Button } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const StartPage = () => {
    const navigate = useNavigate()
    const [roomId, setRoomId] = useState('')

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <TextField value={roomId} onChange={(e) => setRoomId(e.target.value)} id="outlined-basic" label="Room ID" variant="outlined" />
            <Button onClick={() => navigate(`/room?id=${roomId}`)} variant="contained" style={{ marginLeft: '10px', height: '56px' }}>Join</Button>
        </div>
    )
}
