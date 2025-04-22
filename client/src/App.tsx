
import './App.css'

import { AppRouter } from './components/AppRouter'
import { WebSocketWrap } from './context/WebSocketWrap'
function App() {


  return (
    <WebSocketWrap>
      <AppRouter />
    </WebSocketWrap>
  )
}

export default App
