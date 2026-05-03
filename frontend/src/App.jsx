import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Quiz from './components/Quiz';
import RootCauseQuiz from './components/RootCauseQuiz';
import CoachingQuiz from './components/CoachingQuiz';
import CoachingAdmin from './components/CoachingAdmin';
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
        <Route path="/root-cause" element={
          <>
            <RootCauseQuiz />
            <Footer />
          </>
        } />
        <Route path="/admin" element={<AdminLayout />} />
        <Route path="/coaching" element={
          <>
            <CoachingQuiz />
            <Footer />
          </>
        } />
        <Route path="/coaching/admin" element={<CoachingAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
