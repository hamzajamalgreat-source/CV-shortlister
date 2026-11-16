import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import JobSetupPage from './pages/JobSetupPage';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import CandidateDetailPage from './pages/CandidateDetailPage';
import ProtectedRoute from './components/common/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/jobs/new" element={<ProtectedRoute><JobSetupPage /></ProtectedRoute>} />
        <Route path="/jobs/:id/edit" element={<ProtectedRoute><JobSetupPage /></ProtectedRoute>} />
        <Route path="/jobs/:id/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
        <Route path="/jobs/:id/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
        <Route path="/jobs/:id/candidates/:cid" element={<ProtectedRoute><CandidateDetailPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
