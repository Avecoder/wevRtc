import { StartPage } from "./components/StartPage"
import { RoomPage } from "./components/RoomPage"


export const routes = [
    {
        path: "/",
        Component: StartPage
    },
    {
        path: "/room",
        Component: RoomPage
    }
]
