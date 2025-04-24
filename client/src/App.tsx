
import './App.css'

import { AppRouter } from './components/AppRouter'
import { WebSocketWrap } from './context/WebSocketWrap'
import { useGenerateId } from './hooks/useGenerateId'
function App() {


  useGenerateId()

  return (
    <>
    <WebSocketWrap>
      <AppRouter />
    </WebSocketWrap>
    </>
  )
}

export default App
