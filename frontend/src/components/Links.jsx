import { Link, useLocation } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { UserAtom } from "../atoms/UserAtom";
import style from './styles/links.module.css';

const Links = ({ onClickLink }) => {
  const user = useRecoilValue(UserAtom);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <ul className={style.container}>
      <Link
        to={`/dashboard/${user?.id}`}
        className={`${style.link} ${isActive(`/dashboard/${user?.id}`) ? style.active : ''}`}
        onClick={onClickLink}
      >
        Dashboard
      </Link>
      <Link
        to={`/classes/${user?.id}`}
        className={`${style.link} ${isActive(`/classes/${user?.id}`) ? style.active : ''}`}
        onClick={onClickLink}
      >
        Classes
      </Link>
      <Link
        to="#"
        className={`${style.link} ${isActive("#") ? style.active : ''}`}
        onClick={onClickLink}
      >
        About
      </Link>
      <Link
        to="/contact"
        className={`${style.link} ${isActive("/contact") ? style.active : ''}`}
        onClick={onClickLink}
      >
        Contact
      </Link>
    </ul>
  );
};

export default Links;
