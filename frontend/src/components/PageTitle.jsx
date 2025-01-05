import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    let title = 'Default Page Title';

    if (location.pathname === '/') {
      title = 'Landing Page';
    } else if (location.pathname === '/auth') {
      title = 'Authentication';
    } else if (location.pathname === '/forgot-password') {
      title = 'Forgot Password';
    } else if (location.pathname === '/reset-password') {
      title = 'Reset Password';
    } else if (location.pathname === '/verify-email') {
      title = 'Email Verification';
    } else if (location.pathname.startsWith('/dashboard')) {
      title = 'Dashboard';
    } else if (location.pathname.startsWith('/classes')) {
      title = 'Class Page';
    } else if (location.pathname === '/create-class') {
      title = 'Create Class';
    } else if (location.pathname === '/edit-class') {
      title = 'Edit Class';
    } else if (location.pathname === '/create-task') {
      title = 'Create Task';
    } else if (location.pathname === '/edit-task') {
      title = 'Edit Task';
    } else if (location.pathname.startsWith('/task')) {
      title = 'Task Page';
    } else if (location.pathname.startsWith('/circuit-evaluator')) {
      title = 'Circuit Evaluator';
    } else if (location.pathname.startsWith('/student-upload')) {
      title = 'Student Upload';
    } else if (location.pathname === '/notifications') {
      title = 'Notifications';
    } else if (location.pathname === '/contact') {
      title = 'Contact Us';
    } else if (location.pathname === '/settings') {
      title = 'Settings';
    } else if (location.pathname === '/error') {
      title = 'Error';
    }

    document.title = title;
  }, [location]);

  return null;
};

export default PageTitle;
