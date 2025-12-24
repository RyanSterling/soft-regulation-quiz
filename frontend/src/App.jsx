import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Quiz from './components/Quiz';
import AdminLayout from './components/AdminLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Quiz />} />
        <Route path="/admin" element={<AdminLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
