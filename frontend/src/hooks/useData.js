import { useEffect } from 'react';
import { useStore } from '../store/StoreContext';
import { getAllData } from '../api/alldataApi';

export function useData() {
    const { state, dispatch, toast } = useStore();

    useEffect(() => {
        getAllData()
            .then(data => {
                // console.log("Données chargées: " + JSON.stringify(data));
                dispatch({ type: 'SET_DATA', payload: data });
            })
            .catch(err => {
                console.error(err);
                toast('error', '❌', 'Erreur chargement données');
            });
    }, []);

    return { 
        assets:      state.assets, 
        brands:      state.brands, 
        categories:  state.categories, 
        locations:   state.locations, 
        departments: state.departments, 
        seats:       state.seats, 
        statuses:    state.statuses,
        auditLogs:   state.auditLogs,
        movements:   state.movements,
        users:       state.users || [],
        employees:   state.users.filter(u => u.role === 'employee') || [],
        assignments: state.assignments || [],
    };
}