import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useRecoilValue} from 'recoil'; 
import { UserAtom } from './atoms/UserAtom.js';
import Header from './components/Header.jsx';
import Authentication from './pages/Authentication/index.jsx';
import ForgotPasswordPage from './pages/ForgotPassword/index.jsx'
import ResetPasswordPage from './pages/ResetPassword/index.jsx';
import EmailVerificationPage from './pages/EmailVerification/index.jsx';
import Dashboard from './pages/DashboardPage/index.jsx';
import CreateTaskPage from './pages/CreateTaskPage/index.jsx';
import CreateClassPage from './pages/CreateClassPage/index.jsx';
import EditClassPage from './pages/EditClassPage/index.jsx';
import TaskPage from './pages/TaskPage/index.jsx';
import LandingPage from './pages/LandingPage/index.jsx';
import CircuitInspectorPage from './pages/CircuitInspector/index.jsx';
import SubmissionPage from './pages/SubmissionPage/index.jsx'
import ClassPage from './pages/ClassPage/index.jsx';
import NotificationPage from './pages/NotificationsPage/index.jsx';
import SettingsPage from './pages/SettingsPage/index.jsx';
import ContactPage from './pages/ContactPage/index.jsx'
import ErrorPage from './components/ErrorPage.jsx';
import PageTitle from './components/PageTitle.jsx';
import { ToastProvider } from './contexts/ToastContext'; 

import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css';
import EditTaskPage from './pages/EditTaskpage/index.jsx';

const App = () => {
  const location = useLocation();
  const state = location.state || {};
  const user = useRecoilValue(UserAtom);

  const pathsWithoutNavbar = ['/auth', '/reset-password', '/forgot-password', '/verify-email',`/student-upload/${location.pathname.split('/')[2]}`, `/circuit-evaluator/${location.pathname.split('/')[2]}`];
  const showNavbar = !pathsWithoutNavbar.some(path => location.pathname.startsWith(path)) && location.pathname !== '/';

  return (
    <ToastProvider> 
        <PageTitle />
        {showNavbar && <Header />}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={user ? <Navigate to={`/dashboard/${user.id}`} /> : <Authentication />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/dashboard/:userId" element={<Dashboard />} />
            <Route path="/classes/:userId" element={<ClassPage />} />
            <Route path="/create-class" element={<CreateClassPage />} />
            <Route path="/edit-class/:classId" element={<EditClassPage />} />
            <Route path="/create-task" element={<CreateTaskPage />} />
            <Route path="/edit-task/:taskId" element={<EditTaskPage />} />
            <Route path="/task/:taskId" element={<TaskPage />} />
            <Route path="/circuit-evaluator/:taskId" element={<CircuitInspectorPage />} />
            <Route path="/student-upload/:taskId" element={<SubmissionPage />} />
            <Route path="/notifications" element={<NotificationPage/>} />
            <Route path="/contact" element={<ContactPage/>} />
            <Route path="/settings" element={<SettingsPage/>} />
            <Route path="/error" element={<ErrorPage errorType={state.errorType} errorMessage={state.errorMessage} />} />
            <Route path="*" element={<ErrorPage errorType="404" errorMessage="Page not found!" />} />
          </Routes>
        {/* </div> */}
      {/* </main> */}
    </ToastProvider>
  );
};

export default App;
