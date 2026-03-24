import { createContext, useContext, useReducer, useCallback } from 'react';
import reducer from './reducer';
import initialState from './initialState';


const StoreCtx = createContext(null);
const useStore = () => useContext(StoreCtx);

function StoreProvider({children}){
    const [state,dispatch] = useReducer(reducer, initialState);
    const toast = useCallback((type,icon,msg)=>{
        const id=Date.now();
        dispatch({
            type:'ADD_TOAST',
            payload:{type,icon,msg,id}});
        setTimeout(()=>dispatch({type:'REMOVE_TOAST',id}),3500);
    },[]);
    return <StoreCtx.Provider value={{state,dispatch,toast}}>{children}</StoreCtx.Provider>;
}
export {StoreProvider, useStore, StoreCtx};