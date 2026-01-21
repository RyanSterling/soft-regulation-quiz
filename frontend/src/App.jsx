import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Quiz from './components/Quiz';
import AdminLayout from './components/AdminLayout';
import Privacy from './pages/Privacy';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <>
            <Quiz />
            <Footer />
          </>
        } />
        <Route path="/privacy" element={
          <>
            <Privacy />
            <Footer />
          </>
        } />
        <Route path="/admin" element={<AdminLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
