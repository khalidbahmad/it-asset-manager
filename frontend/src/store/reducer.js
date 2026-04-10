import initialState from './initialState';
const ts = () => new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});

function reducer(state= initialState, action){
    const log = (label) => [{type:action.type, label, time:ts()}, ...state.actionLog].slice(0,6);

    switch(action.type){

        /* AUTH */
        case 'LOGIN':
            return {
                ...state, 
                auth:{
                    loggedIn: true,
                    role:     action.role,
                    user:     action.user,   // ← stocker l'objet user complet
                    token:    action.token,
                }, 
                actionLog:log(`role=${action.role}`)
            };

        case 'LOGOUT':
            return {
                ...state, 
                auth:{
                    loggedIn:false,
                    role:''
                },
                actionLog:log('session cleared')
            };

        case 'UPDATE_USER':
            return {
                ...state,
                auth: { ...state.auth, user: { ...state.auth.user, ...action.payload } },
            };

        case 'ADD_EMPLOYEE':
            if (!action.payload) return state;
            return {
                ...state,
                employees: [...(state.employees ?? []), action.payload],
            };

        /* ASSETS */
        case 'SET_ASSETS':
            return { 
                ...state, 
                assets: action.payload 
        };

        case 'ADD_ASSET':
            if (!action.payload) return state;
            return {
                ...state,
                assets: [...(state.assets ?? []), action.payload],
            };
        case 'DELETE_ASSET': {
            const a = state.assets.find(x=>x.id===action.id);
            if(!a || a.status==='assigned') return state;
            return {
                ...state,
                assets: state.assets.filter(x=>x.id!==action.id),
                auditLogs: [{id:Date.now(),action:`Suppression ${a.tag}`,user:state.auth.role,time:ts(),dot:'#ff5c5c'}, ...state.auditLogs],
                actionLog: log(`tag=${a.tag}`),
            };
        }
        
        /* CATEGORIES, BRANDS, LOCATIONS */
        case 'SET_DATA':
            return {
                ...state,
                assets:      action.payload.assets      ?? state.assets,
                brands:      action.payload.brands       ?? state.brands,
                categories:  action.payload.categories   ?? state.categories,
                locations:   action.payload.locations    ?? state.locations,
                departments: action.payload.departments  ?? state.departments,
                seats:       action.payload.seats        ?? state.seats,
                statuses:    action.payload.statuses     ?? state.statuses,
                auditLogs:   action.payload.auditLogs    ?? state.auditLogs,
                movements:   action.payload.movements    ?? state.movements,
                users:       action.payload.users        ?? state.users,
                employees:   action.payload.employees    ?? state.employees,
                assignments: action.payload.assignments  ?? state.assignments,
                villes:        action.payload.villes       ?? state.villes,
                agences:       action.payload.agences      ?? state.agences,
                brand_category: action.payload.brand_category ?? state.brand_category,

            };


        /* EMPLOYEES */

        case 'ADD_LOCATION':
        if (!action.payload) return state;
        return {
            ...state,
        agences: [...(state.agences ?? []), action.payload],
    };

        case 'DELETE_EMPLOYEE': {
            const e = state.employees.find(x=>x.id===action.id);
            return {
                ...state,
                employees: state.employees.filter(x=>x.id!==action.id),
                auditLogs: [{id:Date.now(),action:`Employé ${e?.name} supprimé`,user:state.auth.role,time:ts(),dot:'#ff5c5c'}, ...state.auditLogs],
                actionLog: log(`name=${e?.name}`),
            };
        }

        /* ADMIN LISTS */
        case 'ASSIGN_ASSET':
            return {
                ...state,
                assets: state.assets.map(a =>
                    a.id === action.assetId
                        ? { ...a, status_id: action.assignment?.asset?.status_id ?? a.status_id }
                        : a
                ),
                assignments: [...(state.assignments ?? []), action.assignment],
            };

        case 'RETURN_ASSET':
            return {
                ...state,
                assets: state.assets.map(a =>
                    a.id === action.assetId
                        ? { ...a, status_id: 1 }  // ← 1 = Disponible
                        : a
                ),
                assignments: (state.assignments ?? []).map(a =>
                    a.id === action.assignmentId
                        ? { ...a, status: 'returned' }
                        : a
                ),
            };
    

        /* TOASTS */
        case 'ADD_TOAST':
            return {
                ...state, 
                toasts:[
                    ...state.toasts, 
                    {
                        ...action.payload, 
                        id:action.payload.id||Date.now()
                    }
                ]
            };
        case 'REMOVE_TOAST':
        return {
            ...state, 
            toasts:state.toasts.filter(t=>t.id!==action.id)
        };

        case 'ADD_ASSIGNMENT':
            if (!action.payload) return state;  // ← si pas d'affectation, ne rien faire
            return {
                ...state,
                assignments: [...(state.assignments ?? []), action.payload],
            };
        default: return state;

        



        case 'ADD_ADMIN_ITEM':
            return {
                ...state,
                [action.listKey]: [
                    ...(state[action.listKey] ?? []),
                    action.payload ?? { id: Date.now(), name: action.value }, // ← objet API ou local
                ],
            };

        case 'DELETE_ADMIN_ITEM':
            return {
                ...state,
                [action.listKey]: (state[action.listKey] ?? []).filter(item =>
                    typeof item === 'object'
                        ? item.id !== action.value.id
                        : item !== action.value
                ),
            };
    }
}

export default reducer;