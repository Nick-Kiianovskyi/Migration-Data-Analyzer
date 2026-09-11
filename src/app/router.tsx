import { Routes, Route } from 'react-router-dom'
import UploadPage from '@pages/UploadPage'
import ResultsPage from '@pages/ResultsPage'
import NotFoundPage from '@pages/NotFoundPage'

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<UploadPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRouter
