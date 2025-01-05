import style from './index.module.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { useState } from 'react';

function AuthPage() {
  const [currentView, setCurrentView] = useState('login'); // Default to 'login'

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  return (
    <div className={`${style.bg_cover} ${style.bg_image} min-h-screen flex items-center justify-center`}>
      {currentView === 'login' && <LoginForm onViewChange={handleViewChange} />}
      {currentView === 'register' && <RegisterForm onViewChange={handleViewChange} />}
    </div>
  );
}

export default AuthPage;
