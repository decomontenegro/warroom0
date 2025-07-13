import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/common/Layout'
import WarRoom from './components/warroom/WarRoom'
import HomePage from './components/HomePage'
import LucideIconExample from './components/LucideIconExample'
import './styles/App.css'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/warroom" element={<WarRoom />} />
          <Route path="/icons" element={<LucideIconExample />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App