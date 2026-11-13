import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
const Ctx = createContext();
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('sp_token')) return setReady(true);
    api.me().then(setUser).catch(() => localStorage.removeItem('sp_token')).finally(() => setReady(true));
  }, []);
  const save = ({ token, user }) => { localStorage.setItem('sp_token', token); setUser(user); return user; };
  const login = async (b) => save(await api.login(b));
  const register = async (b) => save(await api.register(b));
  const logout = () => { localStorage.removeItem('sp_token'); setUser(null); };
  return <Ctx.Provider value={{ user, ready, login, register, logout }}>{children}</Ctx.Provider>;
}
