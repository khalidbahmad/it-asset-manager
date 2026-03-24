import { useState } from "react";
import { useStore } from "../store/StoreContext";
import { StorePanel } from "../store/storeIntspectorPanel";
import client from "../api/axiosClient";

function ProfilePage() {
    const { state: { auth }, dispatch, toast } = useStore();
    const user = auth?.user ?? {};

    const [tab, setTab] = useState('info');

    const [info, setInfo] = useState({
        name:  user.name  ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
    });

    const [pwd, setPwd] = useState({
        current:  '',
        newPwd:   '',
        confirm:  '',
    });

    const [loadingInfo, setLoadingInfo] = useState(false);
    const [loadingPwd,  setLoadingPwd]  = useState(false);

    // ── Mettre à jour les infos ───────────────────────────────────
    async function handleInfo(e) {
        e.preventDefault();
        setLoadingInfo(true);
        try {
            const res = await client.put('/profile', info);
            dispatch({ type: 'UPDATE_USER', payload: res.data });
            toast('success', '✅', 'Profil mis à jour');
        } catch (err) {
            toast('error', '❌', err?.response?.data?.message ?? 'Erreur mise à jour');
        } finally {
            setLoadingInfo(false);
        }
    }

    // ── Changer le mot de passe ───────────────────────────────────
    async function handlePwd(e) {
        e.preventDefault();
        if (pwd.newPwd !== pwd.confirm) {
            toast('error', '❌', 'Les mots de passe ne correspondent pas');
            return;
        }
        if (pwd.newPwd.length < 8) {
            toast('error', '❌', 'Minimum 8 caractères');
            return;
        }
        setLoadingPwd(true);
        try {
            await client.put('/profile/password', {
                current_password:      pwd.current,
                password:              pwd.newPwd,
                password_confirmation: pwd.confirm,
            });
            toast('success', '🔒', 'Mot de passe modifié');
            setPwd({ current: '', newPwd: '', confirm: '' });
        } catch (err) {
            toast('error', '❌', err?.response?.data?.message ?? 'Erreur mot de passe');
        } finally {
            setLoadingPwd(false);
        }
    }

    // ── Déconnexion ───────────────────────────────────────────────
    async function handleLogout() {
        try {
            await client.post('/logout');
        } catch { /* ignore */ } finally {
            localStorage.removeItem('token');
            dispatch({ type: 'LOGOUT' });
        }
    }

    const tabs = [
        { v: 'info',     l: '👤 Informations' },
        { v: 'security', l: '🔒 Sécurité'     },
    ];

    return (
        <div className="content">
            <StorePanel />

            {/* ── Header profil ── */}
            <div className="card" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '18px 24px' }}>
                    <div className="avatar" style={{ width: 56, height: 56, fontSize: 22, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                        {user.name?.[0]?.toUpperCase() ?? auth.role?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
                            {user.name ?? auth.role ?? '—'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                            {user.email ?? '—'}
                        </div>
                        <div style={{ marginTop: 6 }}>
                            <span className="tag available" style={{ fontSize: 10 }}>
                                <span className="tag-dot" />{auth.role ?? 'Utilisateur'}
                            </span>
                        </div>
                    </div>
                    <button
                        className="action-btn danger"
                        style={{ marginLeft: 'auto', padding: '7px 16px' }}
                        onClick={handleLogout}
                    >
                        🚪 Déconnexion
                    </button>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="filter-bar" style={{ marginBottom: 14 }}>
                {tabs.map(t => (
                    <button
                        key={t.v}
                        className={`filter-chip ${tab === t.v ? 'active' : ''}`}
                        onClick={() => setTab(t.v)}
                    >{t.l}</button>
                ))}
            </div>

            {/* ── Tab Informations ── */}
            {tab === 'info' && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">INFORMATIONS PERSONNELLES</div>
                    </div>
                    <form onSubmit={handleInfo}>
                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="form-group full">
                                    <label>Nom complet</label>
                                    <input
                                        value={info.name}
                                        onChange={e => setInfo({ ...info, name: e.target.value })}
                                        placeholder="Votre nom..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={info.email}
                                        onChange={e => setInfo({ ...info, email: e.target.value })}
                                        placeholder="votre@email.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Téléphone</label>
                                    <input
                                        value={info.phone}
                                        onChange={e => setInfo({ ...info, phone: e.target.value })}
                                        placeholder="0600000000"
                                    />
                                </div>
                            </div>

                            {/* ── Infos lecture seule ── */}
                            <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg3)', borderRadius: 8 }}>
                                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>INFOS COMPTE</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                    {[
                                        { l: 'ID',    v: user.id    ?? '—' },
                                        { l: 'Rôle',  v: auth.role  ?? '—' },
                                        { l: 'Créé',  v: user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—' },
                                    ].map(item => (
                                        <div key={item.l} style={{ fontSize: 12 }}>
                                            <span style={{ color: 'var(--text3)' }}>{item.l} : </span>
                                            <strong style={{ color: 'var(--text)' }}>{item.v}</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ padding: '12px 24px' }}>
                            <button type="submit" className="btn btn-primary" disabled={loadingInfo}>
                                {loadingInfo ? 'Sauvegarde...' : '💾 Sauvegarder'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── Tab Sécurité ── */}
            {tab === 'security' && (
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">CHANGER LE MOT DE PASSE</div>
                    </div>
                    <form onSubmit={handlePwd}>
                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="form-group full">
                                    <label>Mot de passe actuel *</label>
                                    <input
                                        type="password"
                                        required
                                        value={pwd.current}
                                        onChange={e => setPwd({ ...pwd, current: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Nouveau mot de passe *</label>
                                    <input
                                        type="password"
                                        required
                                        value={pwd.newPwd}
                                        onChange={e => setPwd({ ...pwd, newPwd: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Confirmer *</label>
                                    <input
                                        type="password"
                                        required
                                        value={pwd.confirm}
                                        onChange={e => setPwd({ ...pwd, confirm: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* ── Indicateur force mot de passe ── */}
                            {pwd.newPwd && (
                                <div style={{ marginTop: 12 }}>
                                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Force du mot de passe</div>
                                    <div style={{ height: 4, borderRadius: 2, background: 'var(--bg3)', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            borderRadius: 2,
                                            transition: 'width .3s, background .3s',
                                            width:  pwd.newPwd.length < 6  ? '25%'
                                                  : pwd.newPwd.length < 10 ? '60%'
                                                  : '100%',
                                            background: pwd.newPwd.length < 6  ? 'var(--danger)'
                                                      : pwd.newPwd.length < 10 ? 'var(--accent3)'
                                                      : 'var(--accent2)',
                                        }} />
                                    </div>
                                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>
                                        {pwd.newPwd.length < 6  ? 'Trop court'
                                       : pwd.newPwd.length < 10 ? 'Moyen'
                                       : 'Fort ✓'}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer" style={{ padding: '12px 24px' }}>
                            <button type="submit" className="btn btn-primary" disabled={loadingPwd}>
                                {loadingPwd ? 'Modification...' : '🔒 Changer le mot de passe'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default ProfilePage;