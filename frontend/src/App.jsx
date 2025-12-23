import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Quiz from './components/Quiz';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Quiz />} />
        {/* Admin dashboard route will be added later */}
        <Route path="/admin" element={<div className="p-8 text-center">Admin Dashboard - Coming Soon</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
