import { atom } from 'recoil';

export const UserAtom = atom({
  key: 'UserAtom', 
  default: JSON.parse(localStorage.getItem('user'))
});
