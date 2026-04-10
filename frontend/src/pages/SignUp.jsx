import { useEffect, useState } from "react";
import { useStore } from "../store/StoreContext";
import { useNavigate } from "react-router-dom";
import { signUp } from '../api/auth.api';


function SignUp({ dark, setDark }) {
  const { dispatch, toast } = useStore();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const errStyle = {
  fontSize: 11,
  color: 'var(--danger)',
  marginTop: 4,
  display: 'block',
};

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "admin@company.ma",
    password: "",
    role: "admin",
    phone: "",
    department: "Informatique"
  });

  useEffect(() => {
    const m = {
      admin: "admin@company.ma",
      it: "it@company.ma",
      technician: "tech@company.ma"
    };
    setForm(prev => ({ ...prev, email: m[prev.role] }));
  }, [form.role]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }



function validate() {
  const e = {};

  if (!(form.first_name || '').trim())
    e.first_name = 'Le prénom est obligatoire';

  if (!(form.last_name || '').trim())
    e.last_name = 'Le nom est obligatoire';

  if (!(form.email || '').trim())
    e.email = "L'email est obligatoire";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((form.email || '').trim()))
    e.email = "Format email invalide";

  if (!(form.password || '').trim())
    e.password = 'Le mot de passe est obligatoire';
  else if ((form.password || '').length < 6)
    e.password = '6 caractères minimum';

  if (!(form.phone || '').trim())
    e.phone = 'Le téléphone est obligatoire';

  if (!(form.department || '').trim())
    e.department = 'Le département est obligatoire';

  setErrors(e);
  return Object.keys(e).length === 0;
}

async function handle(e) {
  e.preventDefault();

  if (!validate()) return; 

  try {
    // console.log("Données envoyées au signup: " + JSON.stringify(form));
    const data = await signUp(form);
    // console.log("resultat du signup: " + JSON.stringify(data));
    dispatch({ 
          type:  'LOGIN', 
          role:  data.user?.role ?? form.role,
          user:  data.user,        // ← objet user complet depuis l'API
          token: data.token,
      });
    
    toast('success', '✅', 'Compte créé avec succès !');
    navigate('/');
  } catch (err) {
    toast('error', '❌', err.response?.data?.message || 'Erreur serveur');
  }
}

  return (
    <div className="login-page">       
      <div className="login-bg" />

      <div style={{ position: "absolute", top: 18, right: 18 }}>
        <button className={`theme-toggle ${dark ? "dark" : ""}`} onClick={() => setDark(d => !d)}>
          <div className="toggle-track"><div className="toggle-knob" /></div>
          <span className="toggle-text">{dark ? "🌙" : "☀️"}</span>
        </button>
      </div>

      <div className="login-card">
        <div className="login-icon">IT</div>
        <div className="login-title">Créer un compte</div>
        <div className="login-sub">IT Inventory — Inscription</div>

        <div className="role-tabs">
          {["admin", "it", "technician"].map(r => (
            <button
              key={r}
              className={`role-tab ${form.role === r ? "active" : ""}`}
              onClick={() => setForm({ ...form, role: r })}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>

          {/* Prénom + Nom */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <input
                name="first_name"
                placeholder="Prénom *"
                value={form.first_name}
                onChange={handleChange}
                style={{ borderColor: errors.first_name ? 'var(--danger)' : '' }}
              />
              {errors.first_name && <span style={errStyle}>{errors.first_name}</span>}
            </div>
            <div>
              <input
                name="last_name"
                placeholder="Nom *"
                value={form.last_name}
                onChange={handleChange}
                style={{ borderColor: errors.last_name ? 'var(--danger)' : '' }}
              />
              {errors.last_name && <span style={errStyle}>{errors.last_name}</span>}
            </div>
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              style={{ borderColor: errors.email ? 'var(--danger)' : '' }}
            />
            {errors.email && <span style={errStyle}>{errors.email}</span>}
          </div>

          {/* Mot de passe */}
          <div>
            <input
              type="password"
              name="password"
              placeholder="Mot de passe *"
              value={form.password}
              onChange={handleChange}
              style={{ borderColor: errors.password ? 'var(--danger)' : '' }}
            />
            {errors.password && <span style={errStyle}>{errors.password}</span>}
          </div>

          {/* Téléphone */}
          <div>
            <input
              name="phone"
              placeholder="Téléphone *"
              value={form.phone}
              onChange={handleChange}
              style={{ borderColor: errors.phone ? 'var(--danger)' : '' }}
            />
            {errors.phone && <span style={errStyle}>{errors.phone}</span>}
          </div>

          {/* Département */}
          <div>
            <input
              name="department"
              placeholder="Département *"
              value={form.department}
              onChange={handleChange}
              style={{ borderColor: errors.department ? 'var(--danger)' : '' }}
            />
            {errors.department && <span style={errStyle}>{errors.department}</span>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: 4 }}>
            S'inscrire →
          </button>

        </form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text3)' }}>
          Déjà un compte ?{' '}
          <button
            onClick={() => navigate('/login')}
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
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
