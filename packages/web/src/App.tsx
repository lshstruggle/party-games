import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './features/Home'
import Lobby from './features/Lobby'
import GameRoute from './features/shell/GameRoute'
import ToolsPage from './features/tools/ToolsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:code" element={<Lobby />} />
        <Route path="/play/:code" element={<GameRoute />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
