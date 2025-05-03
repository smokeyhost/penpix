import "./App.css";
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { UserAtom } from './atoms/UserAtom.js';
import Header from './components/Header.jsx';
import Authentication from './pages/Authentication/index.jsx';
import ForgotPasswordPage from './pages/ForgotPassword/index.jsx';
import ResetPasswordPage from './pages/ResetPassword/index.jsx';
import EmailVerificationPage from './pages/EmailVerification/index.jsx';
import Dashboard from './pages/DashboardPage/index.jsx';
import CreateTaskPage from './pages/CreateTaskPage/index.jsx';
import CreateClassPage from './pages/CreateClassPage/index.jsx';
import EditClassPage from './pages/EditClassPage/index.jsx';
import TaskPage from './pages/TaskPage/index.jsx';
import CircuitInspectorPage from './pages/CircuitInspector/index.jsx';
import SubmissionPage from './pages/SubmissionPage/index.jsx';
import ClassPage from './pages/ClassPage/index.jsx';
import NotificationPage from './pages/NotificationsPage/index.jsx';
import SettingsPage from './pages/SettingsPage/index.jsx';
import ContactPage from './pages/ContactPage/index.jsx';
import AboutPage from './pages/AboutPage/index.jsx';
import ErrorPage from './components/ErrorPage.jsx';
import PageTitle from './components/PageTitle.jsx';
import { ToastProvider } from './contexts/ToastContext';

import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css';
import EditTaskPage from './pages/EditTaskpage/index.jsx';
import { useEffect } from "react";
import axios from 'axios'

const ProtectedRoute = ({ element }) => {
  const user = useRecoilValue(UserAtom);
  return user ? element : <Navigate to="/auth" />;
};


const App = () => {
  const location = useLocation();
  const state = location.state || {};
  const [user, setUser] = useRecoilState(UserAtom);
 
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get("/auth/check-session", { withCredentials: true });

        if (response.status === 200) {
          setUser({ id: response.data.user_id }); // Set user if session is active
        }
      } catch (error) {
        if (error.response?.status === 401) {
          setUser(null); // Clear user state if session expired
          console.error("Session expired. Redirecting to login...");
        }
      }
    };

    checkSession();
  }, [setUser]);

  const pathsWithoutNavbar = [
    '/auth',
    '/error',
    '/reset-password',
    '/forgot-password',
    '/verify-email',
    `/student-upload/${location.pathname.split('/')[2]}`,
    `/circuit-evaluator/${location.pathname.split('/')[2]}`,
  ];
  const showNavbar = !pathsWithoutNavbar.some(path => location.pathname.startsWith(path)) && location.pathname !== '/';

  return (
    <ToastProvider>
      <PageTitle />
      {showNavbar && <Header />}
      <Routes>
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="/auth" element={user ? <Navigate to={`/dashboard/${user.id}`} /> : <Authentication />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard/:userId" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/classes/:userId" element={<ProtectedRoute element={<ClassPage />} />} />
        <Route path="/create-class" element={<ProtectedRoute element={<CreateClassPage />} />} />
        <Route path="/edit-class/:classId" element={<ProtectedRoute element={<EditClassPage />} />} />
        <Route path="/create-task" element={<ProtectedRoute element={<CreateTaskPage />} />} />
        <Route path="/edit-task/:taskId" element={<ProtectedRoute element={<EditTaskPage />} />} />
        <Route path="/task/:taskId" element={<ProtectedRoute element={<TaskPage />} />} />
        <Route path="/circuit-evaluator/:taskId" element={<ProtectedRoute element={<CircuitInspectorPage />} />} />
        <Route path="/notifications" element={<ProtectedRoute element={<NotificationPage />} />} />
        <Route path="/settings" element={<ProtectedRoute element={<SettingsPage />} />} />

        <Route path="/student-upload/:taskId" element={<SubmissionPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/error" element={<ErrorPage errorType={state.errorType} errorMessage={state.errorMessage} />} />
        <Route path="*" element={<ErrorPage errorType="404" errorMessage="Page not found!" />} />
      </Routes>
    </ToastProvider>
  );
};

export default App;