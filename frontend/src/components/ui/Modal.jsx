import { useState, useMemo } from "react";
import { useStore } from "../../store/StoreContext";

/* ───────── Modal ───────── */
function Modal({ title, onClose, children }) {
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <div className="modal-title">{title}</div>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                {children}
            </div>
        </div>
    );
}

/* ───────── Select ───────── */
function CreatableSelect({ options = [], value, onChange }) {
    return (
        <select
            value={value?.id ?? ""}
            onChange={e => {
                const found = options.find(o => String(o.id) === e.target.value);
                onChange(found);
            }}
        >
            <option value="">-- Choisir --</option>
            {options.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
            ))}
        </select>
    );
}

/* ───────── DATA ───────── */
const TYPES_BY_CATEGORY = {
    Informatique: ['Laptop', 'Desktop', 'Workstation'],
    Réseau: ['Switch', 'Routeur'],
    Téléphonie: ['Smartphone'],
};

const BRANDS_BY_TYPE = {
    Laptop: ['HP', 'Dell', 'Lenovo'],
    Desktop: ['HP', 'Dell'],
    Switch: ['Cisco', 'TP-Link'],
    Smartphone: ['Apple', 'Samsung'],
};

const STATUSES = [
    { id: 'Disponible', name: 'Disponible' },
    { id: 'Affecté', name: 'Affecté' },
    { id: 'En réparation', name: 'En réparation' },
];

/* ───────── MAIN ───────── */
function AddAssetModal({ onClose, onSubmit }) {
    const { state, toast } = useStore();

    const categories  = state.categories  ?? [];
    const employees   = state.employees   ?? [];
    const departments = state.departments ?? [];
    const seats       = state.seats       ?? [];
    const agences     = state.agences     ?? [];

    const [f, setF] = useState({
        category: null,
        type_materiel: null,
        brand: null,
        model: '',
        asset_tag: '',
        serial_number: '',
        status: STATUSES[0],
        assign_type: 'employee',
        assign_target: null,
    });

    const isAffecte = f.status?.id === 'Affecté';

    /* ───────── FILTER ───────── */
    const availableTypes = useMemo(() => {
        return TYPES_BY_CATEGORY[f.category?.name] || [];
    }, [f.category]);

    const availableBrands = useMemo(() => {
        return BRANDS_BY_TYPE[f.type_materiel?.name] || [];
    }, [f.type_materiel]);

    /* ───────── SUBMIT ───────── */
    async function handle(e) {
        e.preventDefault();

        if (!f.category) return toast('error', '❌', 'Catégorie obligatoire');
        if (!f.type_materiel) return toast('error', '❌', 'Type obligatoire');
        if (!f.brand) return toast('error', '❌', 'Marque obligatoire');
        if (!f.model) return toast('error', '❌', 'Modèle obligatoire');
        if (!f.asset_tag) return toast('error', '❌', 'Asset tag obligatoire');

        if (isAffecte && !f.assign_target)
            return toast('error', '❌', "Choisir une affectation");

        const payload = {
            category: f.category.name,
            type: f.type_materiel.name,
            brand: f.brand.name,
            model: f.model,
            asset_tag: f.asset_tag,
            status: f.status.id,
            assign_type: f.assign_type,
            assign_target_id: f.assign_target?.id || null,
        };

        await onSubmit(payload);
        onClose();
    }

    return (
        <Modal title="➕ Ajouter Matériel" onClose={onClose}>
            <form onSubmit={handle}>
                <div className="modal-body">

                    <div className="form-grid">

                        {/* Catégorie */}
                        <div className="form-group">
                            <label>Catégorie *</label>
                            <CreatableSelect
                                options={categories}
                                value={f.category}
                                onChange={v => setF({ ...f, category: v, type_materiel: null, brand: null })}
                            />
                        </div>

                        {/* Type */}
                        <div className="form-group">
                            <label>Type *</label>
                            <select
                                disabled={!f.category}
                                value={f.type_materiel?.name || ''}
                                onChange={e =>
                                    setF({ ...f, type_materiel: { name: e.target.value }, brand: null })
                                }
                            >
                                <option value="">-- Choisir --</option>
                                {availableTypes.map((t, i) => (
                                    <option key={i}>{t}</option>
                                ))}
                            </select>
                        </div>

                        {/* Marque */}
                        <div className="form-group">
                            <label>Marque *</label>
                            <select
                                disabled={!f.type_materiel}
                                value={f.brand?.name || ''}
                                onChange={e =>
                                    setF({ ...f, brand: { name: e.target.value } })
                                }
                            >
                                <option value="">-- Choisir --</option>
                                {availableBrands.map((b, i) => (
                                    <option key={i}>{b}</option>
                                ))}
                            </select>
                        </div>

                        {/* Modèle */}
                        <div className="form-group">
                            <label>Modèle *</label>
                            <input
                                value={f.model}
                                onChange={e => setF({ ...f, model: e.target.value })}
                            />
                        </div>

                        {/* Asset tag */}
                        <div className="form-group">
                            <label>Asset Tag *</label>
                            <input
                                value={f.asset_tag}
                                onChange={e => setF({ ...f, asset_tag: e.target.value })}
                            />
                        </div>

                        {/* Statut */}
                        <div className="form-group">
                            <label>Statut *</label>
                            <select
                                value={f.status.id}
                                onChange={e => {
                                    const s = STATUSES.find(x => x.id === e.target.value);
                                    setF({ ...f, status: s, assign_target: null });
                                }}
                            >
                                {STATUSES.map(s => (
                                    <option key={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                    </div>

                    {/* Affectation */}
                    {isAffecte && (
                        <div style={{ marginTop: 20 }}>
                            <label>Affecter à :</label>

                            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                                {['employee', 'department', 'seat', 'agence'].map(t => (
                                    <button
                                        type="button"
                                        key={t}
                                        className={`filter-chip ${f.assign_type === t ? 'active' : ''}`}
                                        onClick={() => setF({ ...f, assign_type: t, assign_target: null })}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>

                            {/* Cibles */}
                            {f.assign_type === 'employee' && (
                                <CreatableSelect
                                    options={employees.map(e => ({
                                        ...e,
                                        name: e.first_name + ' ' + e.last_name
                                    }))}
                                    value={f.assign_target}
                                    onChange={v => setF({ ...f, assign_target: v })}
                                />
                            )}

                            {f.assign_type === 'department' && (
                                <CreatableSelect
                                    options={departments}
                                    value={f.assign_target}
                                    onChange={v => setF({ ...f, assign_target: v })}
                                />
                            )}

                            {f.assign_type === 'seat' && (
                                <CreatableSelect
                                    options={seats}
                                    value={f.assign_target}
                                    onChange={v => setF({ ...f, assign_target: v })}
                                />
                            )}

                            {f.assign_type === 'agence' && (
                                <CreatableSelect
                                    options={agences}
                                    value={f.assign_target}
                                    onChange={v => setF({ ...f, assign_target: v })}
                                />
                            )}
                        </div>
                    )}

                </div>

                <div className="modal-footer">
                    <button type="button" onClick={onClose}>Annuler</button>
                    <button type="submit">Ajouter</button>
                </div>
            </form>
        </Modal>
    );
}

export { AddAssetModal , Modal}