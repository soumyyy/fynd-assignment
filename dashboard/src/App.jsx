import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ReviewAnalyzer from './pages/ReviewAnalyzer'
import BatchAnalysis from './pages/BatchAnalysis'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ReviewAnalyzer />} />
          <Route path="/admin" element={<BatchAnalysis />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
