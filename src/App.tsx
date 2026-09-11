import { BrowserRouter } from 'react-router-dom'
import AppRouter from './app/router'
import Header from './components/Header'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AppRouter />
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
