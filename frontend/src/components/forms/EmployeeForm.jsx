import { useState } from "react";
import { useStore } from "../../store/StoreContext";
import { Modal } from "../ui/Modal";
import client from "../../api/axiosClient";

function AddEmployeeModal({ onClose }) {
    const { state, dispatch, toast } = useStore();
    const departments = state.departments ?? [];

    const [f, setF] = useState({
        first_name: '',
        last_name:  '',
        email:      '',
        phone:      '',
        department: departments[0]?.name ?? 'Informatique',
        password:   '',   // ← vide = défaut test1234
    });

    const [loading, setLoading] = useState(false);

    async function handle(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await client.post('/employees/create', {
                first_name: f.first_name,
                last_name:  f.last_name  || null,
                email:      f.email,
                phone:      f.phone      || null,
                department: f.department || null,
                password:   f.password   || undefined,  // ← si vide, backend utilise test1234
            });

            dispatch({ type: 'ADD_EMPLOYEE', payload: res.data.employee });
            toast('success', '👤', `${f.first_name} ${f.last_name} ajouté`);
            
            if (res.data.default_password) {
                toast('info', '🔑', 'Mot de passe par défaut : test1234');
            }

            onClose();
        } catch (err) {
            console.error("Erreur addEmployee:", err?.response?.data ?? err);
            toast('error', '❌', err?.response?.data?.message ?? err?.response?.data?.error ?? 'Erreur création employé');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal title="👤 Ajouter un Employé" onClose={onClose}>
            <form onSubmit={handle}>
                <div className="modal-body">
                    <div className="form-grid">

                        <div className="form-group">
                            <label>Prénom *</label>
                            <input
                                required
                                value={f.first_name}
                                onChange={e => setF({ ...f, first_name: e.target.value })}
                                placeholder="Mohamed"
                            />
                        </div>
                        <div className="form-group">
                            <label>Nom</label>
                            <input
                                value={f.last_name}
                                onChange={e => setF({ ...f, last_name: e.target.value })}
                                placeholder="Benali"
                            />
                        </div>

                        <div className="form-group full">
                            <label>Email *</label>
                            <input
                                required
                                type="email"
                                value={f.email}
                                onChange={e => setF({ ...f, email: e.target.value })}
                                placeholder="m.benali@company.ma"
                            />
                        </div>

                        <div className="form-group">
                            <label>Téléphone</label>
                            <input
                                value={f.phone}
                                onChange={e => setF({ ...f, phone: e.target.value })}
                                placeholder="0600000000"
                            />
                        </div>

                        <div className="form-group">
                            <label>Département</label>
                            {departments.length > 0 ? (
                                <select
                                    value={f.department}
                                    onChange={e => setF({ ...f, department: e.target.value })}
                                >
                                    {departments.map(d => (
                                        <option key={d.id ?? d} value={d.name ?? d}>
                                            {d.name ?? d}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    value={f.department}
                                    onChange={e => setF({ ...f, department: e.target.value })}
                                    placeholder="Informatique"
                                />
                            )}
                        </div>

                        <div className="form-group full">
                            <label>
                                Mot de passe
                                <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 6 }}>
                                    (vide = test1234 par défaut)
                                </span>
                            </label>
                            <input
                                type="password"
                                value={f.password}
                                onChange={e => setF({ ...f, password: e.target.value })}
                                placeholder="Laisser vide pour test1234"
                            />
                        </div>

                    </div>
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Annuler
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Création...' : '👤 Ajouter'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default AddEmployeeModal;