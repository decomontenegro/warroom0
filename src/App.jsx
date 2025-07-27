import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/common/Layout'
import WarRoom3 from './components/warroom/WarRoom3'
import WarRoom3Test from './components/warroom/WarRoom3Test'
import WarRoom3Minimal from './components/warroom/WarRoom3Minimal'
import WarRoom3Fixed from './components/warroom/WarRoom3Fixed'
import HomePage from './components/HomePage'
import './styles/App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/warroom3" element={<WarRoom3 />} />
        <Route path="/test" element={<WarRoom3Test />} />
      </Routes>
    </Router>
  )
}

export default App