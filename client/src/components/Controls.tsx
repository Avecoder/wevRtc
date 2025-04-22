

import React, { useState, JSXElementConstructor, ReactNode } from 'react'
import { Mic, MicOff, CallEnd, ScreenShare, Videocam, VideocamOff, StopScreenShare } from '@mui/icons-material'
import {motion} from 'framer-motion'
import { useNavigate } from 'react-router-dom';

interface BtnProps {
    action?: () => void; 
    children: ReactNode; 
    background?: string;
}

const ControlBtn = ({action = () => {}, children, background = ''}: BtnProps) => (
    <motion.button 
        onClick={action}
        style={{padding: '4px 10px 2px', borderRadius: '8px', background}}
        whileTap={{scale: .85}}
        whileHover={{scale: 1.05}}
    >
        {children}
    </motion.button>
)

interface Props {
    hadleLeaveRoom: () => void;
}

export const Controls = ({hadleLeaveRoom}: Props) => {

  const [activeMic, setActiveMic] = useState(true)
  const [activeDemo, setActiveDemo] = useState(false)
  const [activeVideo, setActiveVideo] = useState(false)

  const navigate = useNavigate()


  const handleCloseRoom = () => {
    hadleLeaveRoom()
    navigate('/')
  }

  return (
    <div 
        style={{
            position: 'absolute',
            bottom: '30px',
            left: '50%',
            transform: 'translate(-50%)',
            background: '#303030',
            color: '#fff',
            padding: '8px 8px',
            borderRadius: '16px',
            display: 'flex',
            gap: '4px'
        }}
    >
        <ControlBtn background={activeMic ? undefined : '#ed4245'} action={() => setActiveMic(prev => !prev)} >
            {
                activeMic ?
                <Mic sx={{ color: '#fff', fontSize: 18 }}  />
                :
                <MicOff sx={{ color: '#fff', fontSize: 18 }}  />
            }
        </ControlBtn>
        <ControlBtn background={activeVideo ? '#56f287' : undefined} action={() => setActiveVideo(prev => !prev)}>
            {
                activeVideo ?
                <VideocamOff sx={{ color: '#fff', fontSize: 18 }} />
                :
                <Videocam sx={{ color: '#fff', fontSize: 18 }} />
            }
        </ControlBtn>
        <ControlBtn background={activeDemo ? '#56f287' : undefined} action={() => setActiveDemo(prev => !prev)}>
            {
                activeDemo ?
                <StopScreenShare sx={{ color: '#fff', fontSize: 18 }} />
                :
                <ScreenShare sx={{ color: '#fff', fontSize: 18 }} />
            }
        </ControlBtn>
        <ControlBtn action={handleCloseRoom} background="#ed4245">
            <CallEnd sx={{ color: '#fff', fontSize: 18 }}/>
        </ControlBtn>

    </div>
  )
}
