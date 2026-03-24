import { useState } from "react";
import { useStore } from "../store/StoreContext";
import { StorePanel } from "../store/storeIntspectorPanel";
import { addCategory, deleteCategory, addBrand, deleteBrand, addLocation, deleteLocation, addAgence, deleteAgence } from '../api/alldataApi';

function AgenceModal({ isOpen, onClose, onSubmit }) {
    const [f, setF] = useState({
        IDAgence: '',
        Adresse: '',
        Telephone: '',
        Agence: '',
        point_de_vente: '',
        emetteur: '',
        nom_ville: '',
        ville_id: '',
        ip_agence: '',
        type_agence: '',
        telephone_affiche: '',
        etat_agence: '',
        anydesk: '',
        Anydesk_2: '',
        Anydesk_3: '',
        autres: '',
        type_agence_code: '',
        etat_agence_code: '',
        asset_id: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit(f);
        onClose();
    };

    const handleChange = (k, v) => setF(prev => ({ ...prev, [k]: v }));

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 500 }}>
                <div className="modal-header">
                    <div className="modal-title">Ajouter une Agence</div>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'grid', gap: 8 }}>
                    {Object.keys(f).map(key => (
                        <div key={key} className="form-group">
                            <label>{key.replace(/_/g, ' ')}</label>
                            <input
                                type={key.includes('id') ? 'number' : 'text'}
                                value={f[key]}
                                onChange={e => handleChange(key, e.target.value)}
                                placeholder={key.replace(/_/g, ' ')}
                            />
                        </div>
                    ))}
                    <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
                        <button type="submit" className="btn btn-primary">Ajouter</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AdminPage() {
    const { state, dispatch, toast } = useStore();
    const [inputs, setInputs] = useState({ categories: '', brands: '', locations: '', roles: '', agences: '' });
    const [isAgenceModal, setAgenceModal] = useState(false);

    const sections = [
        { title: 'Catégories', key: 'categories', color: '#4f8ef7' },
        { title: 'Marques',    key: 'brands',     color: '#38d9a9' },
        { title: 'Sites',      key: 'locations',  color: '#f6a623' },
        { title: 'Rôles',      key: 'roles',      color: '#a78bfa' },
        { title: 'Agences',    key: 'agences',    color: '#e64980' }
    ];

    const API = {
        categories: { add: addCategory, del: deleteCategory },
        brands:     { add: addBrand,    del: deleteBrand    },
        locations:  { add: addLocation, del: deleteLocation },
        agences:    { add: addAgence,   del: deleteAgence   },
    };

    const label  = (item) => typeof item === 'object' ? (item.name ?? '—') : item;
    const itemId = (item, j, sectionKey) => typeof item === 'object' ? `${sectionKey}-${item.id}` : `${sectionKey}-${j}`;

    async function add(key) {
        const v = inputs[key].trim();
        if (!v) return;
        try {
            if (key === 'agences') {
                setAgenceModal(true); // Ouvre modal
                return;
            }
            if (API[key]) {
                const res = await API[key].add(v);
                dispatch({ type: 'ADD_ADMIN_ITEM', listKey: key, payload: res.data });
            } else {
                dispatch({ type: 'ADD_ADMIN_ITEM', listKey: key, value: v });
            }
            toast('success', '✅', `"${v}" ajouté`);
            setInputs(p => ({ ...p, [key]: '' }));
        } catch (err) {
            toast('error', '❌', err?.response?.data?.message ?? 'Erreur ajout');
        }
    }

    async function del(key, item) {
        try {
            if (API[key] && item.id) await API[key].del(item.id);
            dispatch({ type: 'DELETE_ADMIN_ITEM', listKey: key, value: item });
            toast('info', '🗑️', `"${label(item)}" supprimé`);
        } catch (err) {
            toast('error', '❌', err?.response?.data?.message ?? 'Erreur suppression');
        }
    }

    const handleAgenceSubmit = async (data) => {
        try {
            const res = await addAgence(data); // API complète avec tous les champs
            dispatch({ type: 'ADD_ADMIN_ITEM', listKey: 'agences', payload: res.data });
            toast('success', '✅', `Agence "${data.Agence}" ajoutée`);
        } catch (err) {
            toast('error', '❌', err?.response?.data?.message ?? 'Erreur ajout agence');
        }
    };

    return (
        <div className="content">
            <StorePanel />
            <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {sections.map(s => (
                    <div key={s.key} className="card">
                        <div className="card-header">
                            <div className="card-title" style={{ color: s.color }}>
                                {s.title.toUpperCase()}
                                <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text3)', fontFamily: 'Space Mono,monospace' }}>
                                    ({(state[s.key] ?? []).length})
                                </span>
                            </div>
                            <div className="card-actions" style={{ gap: 5 }}>
                                <input
                                    value={inputs[s.key]}
                                    onChange={e => setInputs(p => ({ ...p, [s.key]: e.target.value }))}
                                    onKeyDown={e => e.key === 'Enter' && add(s.key)}
                                    placeholder="Nouveau..."
                                    style={{ padding: '4px 9px', fontSize: 11, width: 110, borderRadius: 6 }}
                                />
                                <button className="topbar-btn primary" style={{ padding: '4px 10px' }} onClick={() => add(s.key)}>+</button>
                            </div>
                        </div>

                        <div style={{ padding: '6px 18px 10px' }}>
                            {(state[s.key] ?? []).length === 0 && (
                                <div style={{ fontSize: 12, color: 'var(--text3)', padding: '8px 0' }}>Aucun élément</div>
                            )}
                            {(state[s.key] ?? []).map((item, j) => (
                                <div
                                    key={itemId(item, j, s.key)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '7px 0',
                                        borderBottom: j < state[s.key].length - 1 ? '1px solid var(--border)' : 'none',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block', flexShrink: 0 }} />
                                        <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label(item)}</span>
                                        {typeof item === 'object' && item.id && (
                                            <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'Space Mono,monospace' }}>#{item.id}</span>
                                        )}
                                    </div>
                                    <button className="action-btn danger" onClick={() => del(s.key, item)}>✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <AgenceModal
                isOpen={isAgenceModal}
                onClose={() => setAgenceModal(false)}
                onSubmit={handleAgenceSubmit}
            />
        </div>
    );
}

export default AdminPage;