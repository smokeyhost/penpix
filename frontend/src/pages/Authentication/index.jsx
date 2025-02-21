import style from './index.module.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { useState, useEffect } from 'react';


function AuthPage() {
  const [currentView, setCurrentView] = useState('login'); // Default to 'login'
  const handleViewChange = (view) => {
    setCurrentView(view);
  };
  
  useEffect(() => {
        document.body.style.overflowY = "hidden"; 
        return () => {
          document.body.style.overflowY = "auto"; // Restore when unmounting
        };
      }, []);

    return (
    <div className={`${style.bg_cover} ${style.bg_image} p-5`}>
      {currentView === 'login' && <LoginForm onViewChange={handleViewChange} />}
      {currentView === 'register' && <RegisterForm onViewChange={handleViewChange} />}
    </div>
  );
}

export default AuthPage;
