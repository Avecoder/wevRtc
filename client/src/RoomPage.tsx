import { useLocation } from "react-router-dom"
import { UserCard } from "./UserCard"



export const RoomPage = () => {

    const pathname = useLocation()
    const searchParams = new URLSearchParams(pathname.search)
    const id = searchParams.get('id')

    console.log(id)
    return (
        <div>
            <h1>Room Page</h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '20px', gap: '20px' }}>
                <UserCard name="John Doe" />
                <UserCard name="Jane Doe" />
                <UserCard name="Test User" />
                <UserCard name="Qwerty" />
            </div>
        </div>
    )
}
