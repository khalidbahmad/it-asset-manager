import { useContext } from 'react';
import { StoreCtx } from '../store/StoreContext';

export const useStore = () => useContext(StoreCtx);
