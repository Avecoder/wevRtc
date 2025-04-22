import { Avatar, Card, CardContent, Typography } from '@mui/material'
import { getRandomColor } from '../utils/color'
import { motion } from 'framer-motion'

export const UserCard = ({ name, index }: { name: string, index: number }) => {
    const background = getRandomColor(index)

    return (
        <motion.div
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 30 }} // Плавная анимация
            style={{
                width: '100%', 
                height: '100%', 
                maxHeight: '50vh',
                maxWidth: '50vw'
            }}
        >
            <Card 
                variant="outlined" 
                style={{
                    background,  
                    width: '100%', 
                    height: '100%', 
                    maxHeight: '50vh',
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between' 
                }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <Avatar src={`https://avatar.iran.liara.run/public/?username=${name}`} sx={{ width: 100, height: 100 }} />
                    <Typography variant="h5" component="div">
                        {name}
                    </Typography>
                </CardContent>
                {/* <audio style={{ width: 'calc(100% - 20px)', height: '30px', padding: '10px' }} src="" controls></audio> */}
            </Card>
        </motion.div>
    )
}
