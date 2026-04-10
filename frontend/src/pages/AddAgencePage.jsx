import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/StoreContext";
import client from "../api/axiosClient";
import { MapPicker } from "../components/ui/AddAgenceModal";

export default function AddAgencePage() {
    const navigate  = useNavigate();
    const { dispatch, toast } = useStore();
    const [loading, setLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);

    const TYPE_AGENCE = ['Siège', 'Agence', 'Bureau', 'Data Center', 'Annexe'];
    const ETAT_AGENCE = ['Active', 'Inactive', 'En travaux', 'Fermée'];

    const [f, setF] = useState({
        Agence:            '',
        Adresse:           '',
        Telephone:         '',
        point_de_vente:    '',
        emetteur:          '',
        nom_ville:         '',
        ip_agence:         '',
        type_agence:       '',
        telephone_affiche: '',
        etat_agence:       'Active',
        anydesk:           '',
        Anydesk_2:         '',
        Anydesk_3:         '',
        autres:            '',
        latitude:          null,
        longitude:         null,
    });

    async function handle(e) {
        e.preventDefault();
        if (!f.Agence)    { toast('error', '❌', 'Nom agence obligatoire'); return; }
        if (!f.Adresse)   { toast('error', '❌', 'Adresse obligatoire');    return; }
        if (!f.Telephone) { toast('error', '❌', 'Téléphone obligatoire');  return; }

        setLoading(true);
        try {
            const res = await client.post('/agences', f);
            dispatch({ type: 'ADD_LOCATION', payload: res.data.agence });
            toast('success', '🏢', `${f.Agence} créée avec succès`);
            navigate('/agents');   // ← retour à la liste des agences
        } catch (err) {
            console.error(err?.response?.data);
            toast('error', '❌', err?.response?.data?.message ?? 'Erreur création agence');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="content">
            <div className="card">
                <div className="card-header">
                    <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 12px', fontSize: 12 }}
                        onClick={() => navigate('/locations')}
                    >
                        ← Retour
                    </button>
                    <div className="card-title" style={{ marginLeft: 12 }}>🏢 CRÉER UNE AGENCE</div>
                </div>

                <form onSubmit={handle}>
                    <div className="modal-body">

                        {/* ── Informations principales ── */}
                        <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
                            INFORMATIONS PRINCIPALES
                        </div>
                        <div className="form-grid">
                            <div className="form-group full">
                                <label>Nom Agence *</label>
                                <input required value={f.Agence} onChange={e => setF({ ...f, Agence: e.target.value })} placeholder="Agence Casablanca Centre" />
                            </div>
                            <div className="form-group full">
                                <label>Adresse *</label>
                                <input required value={f.Adresse} onChange={e => setF({ ...f, Adresse: e.target.value })} placeholder="123 Rue Mohammed V, Casablanca" />
                            </div>
                            <div className="form-group">
                                <label>Téléphone *</label>
                                <input required value={f.Telephone} onChange={e => setF({ ...f, Telephone: e.target.value })} placeholder="0522000000" />
                            </div>
                            <div className="form-group">
                                <label>Téléphone affiché</label>
                                <input value={f.telephone_affiche} onChange={e => setF({ ...f, telephone_affiche: e.target.value })} placeholder="05 22 00 00 00" />
                            </div>
                        </div>

                        {/* ── Localisation ── */}
                        <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: 1, margin: '16px 0 10px' }}>
                            LOCALISATION
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Ville</label>
                                <input value={f.nom_ville} onChange={e => setF({ ...f, nom_ville: e.target.value })} placeholder="Casablanca" />
                            </div>
                            <div className="form-group">
                                <label>Point de vente</label>
                                <input value={f.point_de_vente} onChange={e => setF({ ...f, point_de_vente: e.target.value })} placeholder="PDV-001" />
                            </div>
                            <div className="form-group">
                                <label>Émetteur</label>
                                <input value={f.emetteur} onChange={e => setF({ ...f, emetteur: e.target.value })} placeholder="EMT-001" />
                            </div>
                        </div>

                        {/* ── Carte ── */}
                        <div style={{ marginTop: 8 }}>
                            <button
                                type="button"
                                className={`filter-chip ${showMap ? 'active' : ''}`}
                                onClick={() => setShowMap(v => !v)}
                                style={{ marginBottom: 8 }}
                            >
                                🗺️ {showMap ? 'Masquer la carte' : 'Localiser sur la carte'}
                            </button>

                            {showMap && (
                                <MapPicker
                                    lat={f.latitude}
                                    lng={f.longitude}
                                    onChange={(lat, lng, geoData) => {
                                        setF(p => ({
                                            ...p,
                                            latitude:  lat,
                                            longitude: lng,
                                            ...(geoData ? {
                                                nom_ville: p.nom_ville || geoData.nom_ville,
                                                Adresse:   p.Adresse   || geoData.Adresse,
                                            } : {}),
                                        }));
                                    }}
                                />
                            )}

                            {f.latitude && f.longitude && !showMap && (
                                <div style={{ fontSize: 11, color: 'var(--accent2)', fontFamily: 'Space Mono,monospace' }}>
                                    📌 {f.latitude.toFixed(6)}, {f.longitude.toFixed(6)}
                                </div>
                            )}
                        </div>

                        {/* ── Réseau & Accès ── */}
                        <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: 1, margin: '16px 0 10px' }}>
                            RÉSEAU & ACCÈS DISTANT
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>IP Agence</label>
                                <input value={f.ip_agence} onChange={e => setF({ ...f, ip_agence: e.target.value })} placeholder="192.168.1.1" />
                            </div>
                            <div className="form-group">
                                <label>AnyDesk 1</label>
                                <input value={f.anydesk} onChange={e => setF({ ...f, anydesk: e.target.value })} placeholder="123 456 789" />
                            </div>
                            <div className="form-group">
                                <label>AnyDesk 2</label>
                                <input value={f.Anydesk_2} onChange={e => setF({ ...f, Anydesk_2: e.target.value })} placeholder="987 654 321" />
                            </div>
                            <div className="form-group">
                                <label>AnyDesk 3</label>
                                <input value={f.Anydesk_3} onChange={e => setF({ ...f, Anydesk_3: e.target.value })} placeholder="111 222 333" />
                            </div>
                        </div>

                        {/* ── Type & État ── */}
                        <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: 1, margin: '16px 0 10px' }}>
                            TYPE & ÉTAT
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Type Agence</label>
                                <select value={f.type_agence} onChange={e => setF({ ...f, type_agence: e.target.value })}>
                                    <option value="">-- Choisir --</option>
                                    {TYPE_AGENCE.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>État Agence</label>
                                <select value={f.etat_agence} onChange={e => setF({ ...f, etat_agence: e.target.value })}>
                                    {ETAT_AGENCE.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-group full">
                                <label>Autres informations</label>
                                <input value={f.autres} onChange={e => setF({ ...f, autres: e.target.value })} placeholder="Notes supplémentaires..." />
                            </div>
                        </div>

                    </div>

                    {/* ── Footer ── */}
                    <div className="modal-footer" style={{ padding: '16px 24px', justifyContent: 'space-between' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/locations')}>
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Création...' : '🏢 Créer l\'agence'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}