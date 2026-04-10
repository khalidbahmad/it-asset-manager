import { useEffect, useState } from "react";
import { useStore } from "../store/StoreContext";
import { useNavigate } from "react-router-dom";
import { login } from '../api/auth.api';

function LoginPage({ dark, setDark }) {
  const { dispatch, toast } = useStore();
  const navigate = useNavigate();

  const [role, setRole] = useState('Admin');
  const [email, setEmail] = useState('admin@gmail.ma');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});   // ← état erreurs

  useEffect(() => {
    const m = {
      'Admin':      'admin@gmail.ma',
      'IT Manager': 'it@gmail.ma',
      'Technicien': 'tech@gmail.ma',
    };
    setEmail(m[role]);
    setErrors({});
  }, [role]);

  // ── Validation ──────────────────────────────
  function validate() {
    const e = {};

    if (!email.trim())
      e.email = "L'email est obligatoire";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Format email invalide";

    if (!password.trim())
      e.password = "Le mot de passe est obligatoire";
    else if (password.length < 4)
      e.password = "4 caractères minimum";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Soumission ──────────────────────────────
  async function handle(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
        // console.log("Données envoyées au login: " + JSON.stringify({ email, password }));
        const data = await login( email, password );
        // console.log("resultat du login: " + JSON.stringify(data));
        dispatch({ 
          type:  'LOGIN', 
          role:  data.user?.role ?? role,
          user:  data.user,        // ← objet user complet depuis l'API
          token: data.token,
      });
        toast('success', '✅', 'Connexion réussie !');
        navigate('/');
    } catch (err) {
        toast('error', '❌', err.response?.data?.message || 'Erreur serveur');
    }
}

  return (
    <div className="login-page">
      <div className="login-bg" />

      {/* Toggle thème */}
      <div style={{ position: 'absolute', top: 18, right: 18 }}>
        <button className={`theme-toggle ${dark ? 'dark' : ''}`} onClick={() => setDark(d => !d)}>
          <div className="toggle-track"><div className="toggle-knob" /></div>
          <span className="toggle-text">{dark ? '🌙' : '☀️'}</span>
        </button>
      </div>

      <div className="login-card">
        <div className="login-icon">IT</div>
        <div className="login-title">IT Inventory</div>
        <div className="login-sub">Système de Gestion des Équipements</div>

        {/* Role tabs */}
        <div className="role-tabs">
          {['Admin', 'IT Manager', 'Technicien'].map(r => (
            <button
              key={r}
              className={`role-tab ${role === r ? 'active' : ''}`}
              onClick={() => setRole(r)}
            >
              {r}
            </button>
          ))}
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onSubmit={handle}>

          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
              }}
              style={{ borderColor: errors.email ? 'var(--danger)' : '' }}
            />
            {errors.email && (
              <span style={errStyle}>{errors.email}</span>
            )}
          </div>

          {/* Mot de passe */}
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={e => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
              }}
              style={{ borderColor: errors.password ? 'var(--danger)' : '' }}
            />
            {errors.password && (
              <span style={errStyle}>{errors.password }</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: 4 }}>
            Connexion →
          </button>

          {/* Lien SignUp */}
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: 'var(--text3)' }}>
            Pas encore de compte ?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Créer un compte
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

const errStyle = {
  fontSize: 11,
  color: 'var(--danger)',
  marginTop: 4,
  display: 'block',
};

export default LoginPage;