import { useState } from "react";
import { useStore } from "../../store/StoreContext";
import { Modal } from "../ui/Modal";
import client from "../../api/axiosClient";

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
                <option value="">-- Choisir --</option>
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

function AssignModal({ asset, onClose }) {
    const { state, dispatch, toast } = useStore();

    const employees   = state.employees   ?? [];
    const departments = state.departments ?? [];
    const seats       = state.seats       ?? [];
    const agences     = state.agences     ?? [];
    console.log("Agences disponibles:", agences);

    const [assignType,   setAssignType]   = useState('employee');
    const [assignTarget, setAssignTarget] = useState(null);
    const [loading,      setLoading]      = useState(false);

    async function handle(e) {
        e.preventDefault();

        if (!assignTarget) {
            toast('error', '❌', 'Veuillez choisir une cible');
            return;
        }

        // ── Construire le payload selon le type ───────────────────
        const payload = {
            asset_id: asset.id,
            type:     assignType,
        };

        if (assignType === 'employee') {
            if (assignTarget._new) {
                // Créer l'employé d'abord si nouveau — optionnel selon ton API
                toast('error', '❌', 'Veuillez sélectionner un employé existant');
                return;
            }
            payload.employee_id = assignTarget.id;
        } else if (assignType === 'department') {
            payload.department_id = assignTarget._new ? null : assignTarget.id;
        } else if (assignType === 'seat') {
            payload.seat_id = assignTarget._new ? null : assignTarget.id;
        }

        console.log("Payload assignment:", JSON.stringify(payload, null, 2));

        setLoading(true);
        try {
            const res = await client.post('/assignments', payload);
            console.log("Réponse API assignment:", res.data);
            
            dispatch({ type: 'ADD_ASSIGNMENT', payload: res.data });
            dispatch({ type: 'ASSIGN_ASSET',   assetId: asset.id, assignment: res.data });
            
            const label = assignTarget.name 
                ?? `${assignTarget.first_name} ${assignTarget.last_name}`;
            toast('success', '📋', `${asset.tag} → ${label}`);
            onClose();
        } catch (err) {
            console.error("Erreur assignment:", err?.response?.data ?? err);
            toast('error', '❌', err?.response?.data?.message ?? 'Erreur affectation');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal title={`📋 Affecter — ${asset.tag}`} onClose={onClose}>
            <form onSubmit={handle}>
                <div className="modal-body">

                    {/* ── Info asset ── */}
                    <div style={{ background: 'var(--bg3)', borderRadius: 7, padding: '9px 12px', marginBottom: 16, fontSize: 12, color: 'var(--text2)' }}>
                        <strong style={{ color: 'var(--text)' }}>{asset.model}</strong>
                        {' · '}{asset.category}{' · '}{asset.location}
                    </div>

                    {/* ── Type d'affectation ── */}
                    <div className="form-group" style={{ marginBottom: 14 }}>
                        <label>Type d'affectation</label>
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                            {[
                                { v: 'employee',   l: '👤 Employé'     },
                                { v: 'department', l: '🏢 Département' },
                                { v: 'seat',       l: '💺 Poste'       },
                            ].map(t => (
                                <button
                                    key={t.v}
                                    type="button"
                                    className={`filter-chip ${assignType === t.v ? 'active' : ''}`}
                                    onClick={() => { setAssignType(t.v); setAssignTarget(null); }}
                                >
                                    {t.l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Cible selon le type ── */}
                    {assignType === 'employee' && (
                        <div className="form-group">
                            <label>Employé *</label>
                            <select
                                required
                                value={assignTarget?.id ?? ''}
                                onChange={e => {
                                    const found = employees.find(emp => String(emp.id) === e.target.value);
                                    setAssignTarget(found ?? null);
                                }}
                            >
                                <option value="">-- Choisir un employé --</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.first_name} {emp.last_name}
                                        {emp.department ? ` — ${emp.department}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {assignType === 'department' && (
                        <div className="form-group">
                            <label>Département *</label>
                            <CreatableSelect
                                options={departments}
                                value={assignTarget}
                                onChange={setAssignTarget}
                                placeholder="Nouveau département..."
                            />
                        </div>
                    )}

                    {assignType === 'seat' && (
                        <div className="form-group">
                            <label>Poste *</label>
                            <CreatableSelect
                                options={seats}
                                value={assignTarget}
                                onChange={setAssignTarget}
                                placeholder="Nouveau poste..."
                            />
                        </div>
                    )}

                    {/* {assignType === 'agence' && (
                        <div className="form-group">
                            <label>Agence *</label>
                            <CreatableSelect
                                options={agences}
                                value={assignTarget}
                                onChange={setAssignTarget}
                                placeholder="Nouvelle agence..."
                            />
                        </div>
                    )} */}


                    {/* ── Résumé affectation ── */}
                    {assignTarget && (
                        <div style={{ marginTop: 14, padding: '8px 12px', background: 'var(--bg3)', borderRadius: 6, fontSize: 12, color: 'var(--accent2)' }}>
                            ✓ Sera affecté à : <strong>
                                {assignTarget.first_name
                                    ? `${assignTarget.first_name} ${assignTarget.last_name}`
                                    : assignTarget.name}
                            </strong>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
                    <button type="submit" className="btn btn-primary" disabled={loading || !assignTarget}>
                        {loading ? 'Envoi...' : 'Confirmer'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export { AssignModal };