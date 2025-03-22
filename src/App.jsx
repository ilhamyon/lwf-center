import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Register from './pages/Register'
import DataKegiatan from './pages/DataKegiatan'
import GISMap from './pages/GisMap'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GISMap />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/entry" element={<Home />} />
        <Route path="/data-kegiatan" element={<DataKegiatan />} />
      </Routes>
    </Router>
  )
}

export default App
