import { useState } from "react";
import { useStore } from "../store/StoreContext";
import { StorePanel } from "../store/storeIntspectorPanel";
import { addBrand, deleteBrand, addLocation, deleteLocation } from '../api/alldataApi';

function AdminPage() {
    const { state, dispatch, toast } = useStore();

    const [inputs, setInputs] = useState({
        brand_category: { name: '', category_name: '' },
        locations: ''
    });

    const sections = [
        { title: 'Brands', key: 'brand_category', color: '#38d9a9' },
        { title: 'Sites',  key: 'locations',      color: '#f6a623' },
    ];

    const API = {
        brand_category: { add: addBrand,    del: deleteBrand    },
        locations:      { add: addLocation, del: deleteLocation },
    };

    const label  = (item, key) => {
        if (key === 'brand_category') return item.brand ?? '—';
        return typeof item === 'object' ? (item.name ?? '—') : item;
    };
    const itemId = (item, j, key) => typeof item === 'object' ? `${key}-${item.id}` : `${key}-${j}`;

    async function add(key) {
        try {
            let res, displayName;

            if (key === 'brand_category') {
                const { name, category_name } = inputs.brand_category;
                if (!name.trim() || !category_name.trim()) return;
                res = await API.brand_category.add({ name: name.trim(), category_name: category_name.trim() });
                displayName = name.trim();
                setInputs(p => ({ ...p, brand_category: { name: '', category_name: '' } }));
            } else {
                const v = inputs[key].trim();
                if (!v) return;
                res = await API[key].add(v);
                displayName = v;
                setInputs(p => ({ ...p, [key]: '' }));
            }

            dispatch({ type: 'ADD_ADMIN_ITEM', listKey: key, payload: res.data });
            toast('success', '✅', `"${displayName}" ajouté`);
        } catch (err) {
            toast('error', '❌', err?.response?.data?.message ?? 'Erreur ajout');
        }
    }

    async function del(key, item) {
        try {
            if (API[key] && item.id) await API[key].del(item.id);
            dispatch({ type: 'DELETE_ADMIN_ITEM', listKey: key, value: item });
            toast('info', '🗑️', `"${label(item, key)}" supprimé`);
        } catch (err) {
            toast('error', '❌', err?.response?.data?.message ?? 'Erreur suppression');
        }
    }

    function renderInputs(s) {
        if (s.key === 'brand_category') {
            return (
                <div className="card-actions" style={{ gap: 5 }}>
                    <input
                        value={inputs.brand_category.name}
                        onChange={e => setInputs(p => ({ ...p, brand_category: { ...p.brand_category, name: e.target.value } }))}
                        onKeyDown={e => e.key === 'Enter' && add('brand_category')}
                        placeholder="Marque..."
                        style={{ padding: '4px 9px', fontSize: 11, width: 90, borderRadius: 6 }}
                    />
                    <input
                        value={inputs.brand_category.category_name}
                        onChange={e => setInputs(p => ({ ...p, brand_category: { ...p.brand_category, category_name: e.target.value } }))}
                        onKeyDown={e => e.key === 'Enter' && add('brand_category')}
                        placeholder="Catégorie..."
                        style={{ padding: '4px 9px', fontSize: 11, width: 90, borderRadius: 6 }}
                    />
                    <button className="topbar-btn primary" style={{ padding: '4px 10px' }} onClick={() => add('brand_category')}>+</button>
                </div>
            );
        }

        return (
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
        );
    }

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
                            {renderInputs(s)}
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
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, flexShrink: 0 }} />

                                        {s.key === 'brand_category' ? (
                                            <>
                                                {/* Brand */}
                                                <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>
                                                    {item.brand}
                                                </span>
                                                {/* Separator */}
                                                <span style={{ fontSize: 11, color: 'var(--text3)' }}>›</span>
                                                {/* Category badge */}
                                                <span style={{
                                                    fontSize: 10,
                                                    color: '#38d9a9',
                                                    background: 'rgba(56,217,169,0.1)',
                                                    borderRadius: 4,
                                                    padding: '1px 7px',
                                                    fontFamily: 'Space Mono, monospace'
                                                }}>
                                                    {item.category}
                                                </span>
                                                {/* ID */}
                                                <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'Space Mono,monospace' }}>
                                                    #{item.id}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span style={{ fontSize: 13, color: 'var(--text2)' }}>{label(item, s.key)}</span>
                                                {typeof item === 'object' && item.id && (
                                                    <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'Space Mono,monospace' }}>#{item.id}</span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <button className="action-btn danger" onClick={() => del(s.key, item)}>✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminPage;