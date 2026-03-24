import { useStore } from './useStore';

export function useAuth() {

    const { state, dispatch } = useStore();

    const login  = (role) => dispatch({ type: 'LOGIN',  role });
    const logout = ()     => dispatch({ type: 'LOGOUT' });
    const isAdmin = () => state.auth.role === 'Admin';
    const hasRole = (r)   => state.auth.role === r;

    return { ...state.auth, login, logout, isAdmin, hasRole };
}