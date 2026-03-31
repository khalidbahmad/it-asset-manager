import { useState , useEffect} from "react";
import { useStore } from "../../store/StoreContext";

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

function CreatableSelect({ options = [], value, onChange, placeholder, labelKey = 'name' }) {
    const [adding, setAdding] = useState(false);
    const [custom, setCustom] = useState('');

    function confirm() {
        const v = custom.trim();
        if (v) onChange({ id: null, name: v, _new: true });
        setCustom('');
        setAdding(false);
    }

    if (adding) return (
        <div style={{ display: 'flex', gap: 6 }}>
            <input
                autoFocus
                value={custom}
                onChange={e => setCustom(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter') { e.preventDefault(); confirm(); }
                    if (e.key === 'Escape') setAdding(false);
                }}
                placeholder={placeholder}
                style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-primary"   style={{ padding: '0 10px' }} onClick={confirm}>✓</button>
            <button type="button" className="btn btn-secondary" style={{ padding: '0 10px' }} onClick={() => setAdding(false)}>✕</button>
        </div>
    );

    const selectedId = typeof value === 'object' ? value?.id : value;

    return (
        <div style={{ display: 'flex', gap: 6 }}>
            <select
                style={{ flex: 1 }}
                value={selectedId ?? ''}
                onChange={e => {
                    const found = options.find(o => String(o.id) === e.target.value);
                    if (found) onChange(found);
                }}
            >
                {typeof value === 'object' && value?._new &&
                    <option value="">{value.name}</option>}
                {options.map(o => (
                    <option key={o.id} value={o.id}>{o[labelKey]}</option>
                ))}
            </select>
            <button type="button" className="btn btn-secondary" style={{ padding: '0 10px', whiteSpace: 'nowrap' }} onClick={() => setAdding(true)}>
                + Nouveau
            </button>
        </div>
    );
}

function AddAssetModal({ onClose, onSubmit }) {
    const { state, toast } = useStore();
    const currentUserId = state.auth?.user?.id ?? state.auth?.id ?? null;
    const STATUSES_STATIC = [
        { id: 'Disponible',    name: 'Disponible'    },
        { id: 'Affecté',       name: 'Affecté'       },
        { id: 'En réparation', name: 'En réparation' },
        { id: 'Retraité',      name: 'Retraité'      },
    ];
    const categories  = state.categories  ?? [];
    const brands      = state.brands      ?? [];
    const locations   = state.locations   ?? [];
    // ← "stauses" dans le JSON Laravel, "statuses" dans le reducer — on accepte les deux
    const statuses    = state.statuses    ?? state.stauses ?? [];
    const departments = state.departments ?? [];
    const employees   = state.employees   ?? [];
    const seats       = state.seats       ?? [];
    const agences     = state.agences     ?? [];
    // console.log("Agences disponibles:", agences);
    
    const [f, setF] = useState({
    asset_tag:         '',
    serial_number:     '',
    model:             '',
    description:       '',
    category:          categories[0] ?? null,
    brand:             brands[0]     ?? null,
    location:          locations[0]  ?? null,
    status:            STATUSES_STATIC[0],   // ← { id: 'Disponible', name: 'Disponible' }
    purchase_date:     '',
    warranty_end_date: '',
    is_assignable:     true,
    assign_type:       'employee',
    assign_target:     null,
    assigned_by:       null,
});

    // ← comparaison insensible à la casse pour sécurité
    // Doit être recalculé à chaque render depuis f.status
    const isAffecte = f.status?.name === 'Affecté' || f.status?.id === 'Affecté';

async function handle(e) {
    e.preventDefault();

    // console.log("f.status:", f.status);
    // console.log("isAffecte:", isAffecte);
    // console.log("f.category:", f.category);
    // console.log("f.brand:", f.brand);
    // console.log("f.location:", f.location);

    // ── Validation champs obligatoires ────────────────────────────
    if (!f.category?.name) {
        toast('error', '❌', 'Veuillez choisir une catégorie');
        return;
    }
    if (!f.brand?.name) {
        toast('error', '❌', 'Veuillez choisir une marque');
        return;
    }
    if (!f.location?.name) {
        toast('error', '❌', 'Veuillez choisir un site');
        return;
    }
    if (!f.status?.name) {
        toast('error', '❌', 'Veuillez choisir un statut');
        return;
    }
    if (isAffecte && !f.assign_target) {
        toast('error', '❌', "Veuillez choisir une cible d'affectation");
        return;
    }

    try {
        const payload = {
            asset_tag:         f.asset_tag,
            serial_number:     f.serial_number,
            model:             f.model,
            description:       f.description,
            category:          f.category?.name,
            brand:             f.brand?.name,
            location:          f.location?.name,
            status:            f.status?.name ?? f.status?.id,
            purchase_date:     f.purchase_date     || null,
            warranty_end_date: f.warranty_end_date || null,
            is_assignable:     f.is_assignable,
            ...(isAffecte && f.assign_target ? {
                assign_type:        f.assign_type,
                assign_target_id:   f.assign_target._new ? null                  : f.assign_target.id,
                assign_target_name: f.assign_target._new ? f.assign_target.name  : null,
                assigned_by:        currentUserId,
                assigned_to:        f.assign_target.name,
            } : {}),
        };

        console.log(JSON.stringify(payload, null, 2));
        await onSubmit(payload);
        onClose();
    } catch (err) {
        // // console.error("Erreur:", err?.response?.data ?? err);
        toast('error', '❌', err?.response?.data?.message ?? err?.response?.data?.error ?? "Erreur lors de l'ajout");
    }
}

    return (
        <Modal title="➕ Ajouter un Matériel" onClose={onClose}>
            <form onSubmit={handle}>
                <div className="modal-body">
                    <div className="form-grid">

                        <div className="form-group">
                            <label>Asset Tag *</label>
                            <input required value={f.asset_tag} onChange={e => setF({ ...f, asset_tag: e.target.value })} placeholder="AST-2024-050" />
                        </div>
                        <div className="form-group">
                            <label>N° Série *</label>
                            <input required value={f.serial_number} onChange={e => setF({ ...f, serial_number: e.target.value })} placeholder="SN-HP-2024-050" />
                        </div>
                        <div className="form-group full">
                            <label>Modèle *</label>
                            <input required value={f.model} onChange={e => setF({ ...f, model: e.target.value })} placeholder="EliteBook 840 G9" />
                        </div>
                        <div className="form-group full">
                            <label>Description</label>
                            <input value={f.description} onChange={e => setF({ ...f, description: e.target.value })} placeholder="Laptop professionnel..." />
                        </div>

                        <div className="form-group">
                            <label>Catégorie</label>
                            <CreatableSelect options={categories} value={f.category} onChange={v => setF({ ...f, category: v })} placeholder="Nouvelle catégorie..." />
                        </div>

                        {/* ← Statut = select simple, PAS CreatableSelect */}
                        <div className="form-group">
                            <label>Statut</label>
                            <select
                                value={f.status?.id ?? ''}
                                onChange={e => {
                                    const found = STATUSES_STATIC.find(s => s.id === e.target.value);
                                    setF({ ...f, status: found ?? null, assign_target: null });
                                }}
                            >
                                {STATUSES_STATIC.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Marque</label>
                            <CreatableSelect options={brands} value={f.brand} onChange={v => setF({ ...f, brand: v })} placeholder="Nouvelle marque..." />
                        </div>
                        <div className="form-group">
                            <label>Site / Emplacement</label>
                            <CreatableSelect options={locations} value={f.location} onChange={v => setF({ ...f, location: v })} placeholder="Nouveau site..." />
                        </div>
                        <div className="form-group">
                            <label>Date achat</label>
                            <input type="date" value={f.purchase_date} onChange={e => setF({ ...f, purchase_date: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Fin garantie</label>
                            <input type="date" value={f.warranty_end_date} onChange={e => setF({ ...f, warranty_end_date: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <label style={{ marginBottom: 0 }}>Assignable</label>
                            <input type="checkbox" checked={f.is_assignable} onChange={e => setF({ ...f, is_assignable: e.target.checked })} style={{ width: 16, height: 16 }} />
                        </div>

                    </div>

                    {/* ── Section affectation ── */}
                    {isAffecte && (
                        <div style={{ marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                            <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
                                AFFECTATION
                            </div>
                            <div className="form-grid">
                                <div className="form-group full">
                                    <label>Affecter à</label>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {[
                                            { v: 'employee',   l: '👤 Employé' },
                                            { v: 'department', l: '🏢 Département' },
                                            { v: 'seat',       l: '💺 Poste' },
                                            { v: 'agence',     l: '🏬 Agence' }
                                        ].map(t => (
                                            <button key={t.v} type="button"
                                                className={`filter-chip ${f.assign_type === t.v ? 'active' : ''}`}
                                                onClick={() => setF({ ...f, assign_type: t.v, assign_target: null })}>
                                                {t.l}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {f.assign_type === 'employee' && (
                                    <div className="form-group full">
                                        <label>Employé *</label>
                                        <CreatableSelect
                                            options={employees.map(e => ({
                                                ...e,
                                                name: `${e.first_name} ${e.last_name}`  // ← fusionner pour l'affichage
                                            }))}
                                            value={f.assign_target}
                                            onChange={v => setF({ ...f, assign_target: v })}
                                            placeholder="Nouvel employé..."
                                        />
                                    </div>
                                )}
                                {f.assign_type === 'department' && (
                                    <div className="form-group full">
                                        <label>Département *</label>
                                        <CreatableSelect options={departments} value={f.assign_target} onChange={v => setF({ ...f, assign_target: v })} placeholder="Nouveau département..." />
                                    </div>
                                )}
                                {f.assign_type === 'seat' && (
                                    <div className="form-group full">
                                        <label>Poste *</label>
                                        <CreatableSelect options={seats} value={f.assign_target} onChange={v => setF({ ...f, assign_target: v })} placeholder="Nouveau poste..." />
                                    </div>
                                )}
                                
                                {f.assign_type === 'agence' && (
                                    <div className="form-group full">
                                        <label>Agence *</label>
                                        <CreatableSelect options={agences} value={f.assign_target} onChange={v => setF({ ...f, assign_target: v })} placeholder="Nouvelle agence..." labelKey="Agence" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
                    <button type="submit" className="btn btn-primary">Ajouter</button>
                </div>
            </form>
        </Modal>
    );
}

export { AddAssetModal, Modal };