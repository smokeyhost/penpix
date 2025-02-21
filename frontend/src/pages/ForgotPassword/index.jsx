import { useEffect } from 'react';
import style from '../Authentication/index.module.css'
import ForgotPassword from './components/ForgotPassword'


const ForgotPasswordPage = () => {
  useEffect(() => {
          document.body.style.overflowY = "hidden"; 
          return () => {
            document.body.style.overflowY = "auto"; // Restore when unmounting
          };
        }, []);

  return (
    <div className={`${style.bg_cover} ${style.bg_image} min-h-screen flex items-center justify-center`}>
      <ForgotPassword/>
    </div>
  )
}

export default ForgotPasswordPage