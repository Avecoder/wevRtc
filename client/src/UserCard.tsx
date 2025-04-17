import { Avatar, Card, CardContent, Typography } from '@mui/material'
import AvatarIcon from '@mui/icons-material/Person'

export const UserCard = ({ name }: { name: string }) => {
    return (
        <Card variant="outlined" style={{ maxWidth: '200px', width: '200px', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Avatar src={`https://avatar.iran.liara.run/public/?username=${name}`} sx={{ width: 100, height: 100 }} />
                <Typography variant="h5" component="div">
                    {name}
                </Typography>
            </CardContent>
            <audio style={{ width: 'calc(100% - 20px)', height: '30px', padding: '10px' }} src="" controls></audio>
        </Card>
    )
}
