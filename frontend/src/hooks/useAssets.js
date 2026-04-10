import { useCallback } from 'react';
import { useStore } from '../store/StoreContext';
import { createAndAssignAsset, deleteAsset as apiDelete } from '../api/assets.api';
import { returnAsset as apiReturn } from '../api/assignments.api';
import { getAllData } from '../api/alldataApi';

export function useAssets() {
    const { state, dispatch, toast } = useStore();

    const assets     = state.assets     ?? [];
    const brands     = state.brands     ?? [];
    const statuses   = state.statuses   ?? [];
    const categories = state.categories ?? [];
    const locations  = state.locations  ?? [];

    const brandName    = (id) => brands.find(b => b.id === id)?.name     ?? '—';
    const categoryName = (id) => categories.find(c => c.id === id)?.name ?? '—';
    const locationName = (id) => locations.find(l => l.id === id)?.name  ?? '—';

    const STATUS_MAP = {
        'Disponible':    'Disponible',
        'Affecté':       'Affecté',
        'En réparation': 'En réparation',
        'Retraité':      'Retraité',
        'available':     'Disponible',
        'assigned':      'Affecté',
        'maintenance':   'En réparation',
        'retired':       'Retraité',
    };

    function normalize(a) {
        const rawStatus = a.status?.name                                    // { id:2, name:"En réparation" } → "En réparation"
               ?? statuses.find(s => s.id === a.status_id)?.name   // résolution par ID
               ?? (typeof a.status === 'string' ? a.status : null) // string directe
               ?? '—';
        const status = STATUS_MAP[rawStatus] ?? rawStatus;

        const assignments      = state.assignments ?? [];
        const activeAssignment = assignments.find(asgn => asgn.asset_id === a.id);

        let assignedTo   = null;
        let assignedType = null;

        if (activeAssignment) {
            if (activeAssignment.employee) {
                assignedTo   = `${activeAssignment.employee.first_name} ${activeAssignment.employee.last_name}`;
                assignedType = 'employee';
            } else if (activeAssignment.department) {
                assignedTo   = activeAssignment.department.name;
                assignedType = 'department';
            } else if (activeAssignment.seat) {
                assignedTo   = activeAssignment.seat.name;
                assignedType = 'seat';
            } else if (activeAssignment.assigned_to) {
                assignedTo = activeAssignment.assigned_to;
            }
        }

        return {
            id:           a.id,
            tag:          a.asset_tag,
            serial:       a.serial_number,
            model:        a.model,
            description:  a.description,
            brand:        a.brand?.name    ?? brandName(a.brand_id),     // ✅
            category:     a.category?.name ?? categoryName(a.category_id), // ✅
            location:     a.location?.name ?? locationName(a.location_id), // ✅
            status,
            assignedTo,
            assignedType,
            assignmentId: activeAssignment?.id ?? null,
            purchase:     a.purchase_date,
            warranty:     a.warranty_end_date,
            is_assignable: a.is_assignable,
            status_id:    a.status_id,
            brand_id:     a.brand_id,
            category_id:  a.category_id,
            location_id:  a.location_id,
        };
    }

    // console.log("Assets bruts:", assets);
    const normalizedAssets = assets.map(normalize);
    // console.log("Assets normalisés:", normalizedAssets);

    const addAsset = useCallback(async (payload) => {
        console.log(payload);
        try {
            const res    = await createAndAssignAsset(payload);
            const asset      = res.data?.asset;
            const assignment = res.data?.assignment;

            if (!asset) {
                toast('error', '❌', 'Réponse API invalide');
                return;
            }
            getAllData()
            .then(data => {
                console.log("Données chargées: " + JSON.stringify(data));
                dispatch({ type: 'SET_DATA', payload: data });
            })
            .catch(err => {
                console.error(err);
                toast('error', '❌', 'Erreur chargement données');
            });

            if (assignment) {
                dispatch({ type: 'ADD_ASSIGNMENT', payload: assignment });
            }
            toast('success', '✅', `${asset.asset_tag} ajouté`);
        } catch (err) {
            console.error("Erreur addAsset:", err?.response?.data ?? err);
            toast('error', '❌', err?.response?.data?.message ?? 'Erreur création');
            throw err;
        }
    }, []);

    const deleteAsset = useCallback(async (asset) => {
        if (asset.status === 'Affecté') {   // ✅ statut français
            toast('error', '❌', 'Retourner l\'asset avant de le supprimer');
            return;
        }
        try {
            await apiDelete(asset.id);
            dispatch({ type: 'DELETE_ASSET', id: asset.id });
            toast('info', '🗑️', `${asset.tag} supprimé`);
        } catch (err) {
            toast('error', '❌', err?.response?.data?.message ?? 'Erreur suppression');
        }
    }, []);

    const returnAsset = useCallback(async (asset) => {  // ✅ reçoit l'asset complet
        try {
            if (!asset.assignmentId) {
                toast('error', '❌', 'Aucune affectation active trouvée');
                return;
            }
            await apiReturn(asset.id);
            dispatch({ type: 'RETURN_ASSET', assetId: asset.id, assignmentId: asset.assignmentId });
            toast('info', '↩️', 'Retourné au stock');
        } catch (err) {
            toast('error', '❌', err?.response?.data?.error ?? 'Erreur retour');
        }
    }, []);

    return {
        assets: normalizedAssets,
        addAsset,
        deleteAsset,
        returnAsset,
    };
}