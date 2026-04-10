# 📦 IT Inventory — Application de Gestion du Parc Informatique

> Application web interne permettant de gérer le cycle de vie complet des équipements informatiques : création, affectation, transfert entre sites, retour et audit.

---

## 🚀 Stack Technique

| Couche | Technologie |
|---|---|
| Frontend | React 18 + Context API + useReducer |
| Backend | Laravel 11 (API REST) |
| Base de données | MySQL |
| Authentification | Laravel Sanctum (Bearer Token) |
| Styles | CSS Variables (dark/light mode) |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Notifications | React Toastify |

---

## 📁 Structure du Projet

```
it-inventory-app/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── UserController.php
│   │   │   │   ├── AssetController.php
│   │   │   │   ├── AssignmentController.php
│   │   │   │   ├── MovementController.php
│   │   │   │   └── AuditLogController.php
│   │   │   └── Middleware/
│   │   │       ├── AuthToken.php
│   │   │       └── RoleMiddleware.php
│   │   └── Models/
│   │       ├── User.php
│   │       ├── Asset.php
│   │       ├── Assignment.php
│   │       ├── Movement.php
│   │       └── AuditLog.php
│   ├── database/migrations/
│   └── routes/api.php
│
└── frontend/                   # React App
    └── src/
        ├── store/
        │   ├── StoreContext.jsx    # Context + Provider
        │   ├── reducer.js          # Reducer global
        │   ├── initialState.js     # État initial
        │   └── actions.js          # Constantes actions
        ├── api/
        │   ├── axiosClient.js      # Instance Axios
        │   ├── auth.api.js         # login / signUp / logout
        │   ├── assets.api.js       # CRUD assets
        │   ├── employees.api.js    # CRUD employés
        │   ├── assignments.api.js  # Affectations
        │   └── movements.api.js    # Mouvements
        ├── pages/
        │   ├── Login.jsx
        │   ├── SignUp.jsx
        │   ├── Dashboard.jsx
        │   ├── Assets.jsx
        │   ├── Employees.jsx
        │   ├── Movements.jsx
        │   ├── AuditLogs.jsx
        │   └── AdminPanel.jsx
        ├── components/
        │   ├── layout/
        │   │   ├── Layout.jsx
        │   │   ├── Sidebar.jsx
        │   │   ├── Topbar.jsx
        │   │   └── BottomNav.jsx
        │   ├── ui/
        │   │   ├── Modal.jsx
        │   │   ├── Toast.jsx
        │   │   ├── Badge.jsx
        │   │   └── Table.jsx
        │   ├── charts/
        │   │   ├── DonutChart.jsx
        │   │   └── BarChart.jsx
        │   └── forms/
        │       ├── AssetForm.jsx
        │       └── EmployeeForm.jsx
        ├── hooks/
        │   ├── useStore.js
        │   ├── useAssets.js
        │   ├── useAuth.js
        │   ├── useToast.js
        │   └── useDebounce.js
        ├── utils/
        │   ├── formatDate.js
        │   ├── statusColors.js
        │   ├── permissions.js
        │   └── constants.js
        ├── App.jsx
        ├── main.jsx
        └── index.css
```

---

## ⚙️ Installation & Lancement

### Prérequis

- Node.js >= 18
- PHP >= 8.2
- Composer
- MySQL

---

## 🔌 API Endpoints

### Authentification (public)
| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/SignIn` | Connexion utilisateur |
| POST | `/api/SignUp` | Inscription utilisateur |

### Assets (auth requise)
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/assets` | Liste tous les équipements |
| POST | `/api/assets` | Créer un équipement |
| PUT | `/api/assets/{id}` | Modifier un équipement |
| DELETE | `/api/assets/{id}` | Supprimer un équipement |

### Affectations
| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/assignments` | Affecter un équipement |
| POST | `/api/assignments/{id}/return` | Retourner un équipement |

### Mouvements
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/movements` | Historique des mouvements |
| POST | `/api/movements` | Enregistrer un transfert |

### Audit Logs
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/audit-logs` | Journal complet |
| GET | `/api/audit-logs/{table}` | Logs par entité |

---

## 🏗️ Architecture du Store (Frontend)

Le frontend utilise une architecture **Context API + useReducer** pour centraliser l'état global de l'application.

```
StoreProvider (main.jsx)
    │
    ├── state.auth          → { loggedIn, role }
    ├── state.assets        → [ ...Asset ]
    ├── state.employees     → [ ...Employee ]
    ├── state.movements     → [ ...Movement ]
    ├── state.auditLogs     → [ ...AuditLog ]
    ├── state.categories    → [ ...string ]
    ├── state.brands        → [ ...string ]
    ├── state.sites         → [ ...string ]
    └── state.toasts        → [ ...Toast ]
```

### Actions disponibles

| Action | Description |
|---|---|
| `LOGIN` | Authentifier un utilisateur |
| `LOGOUT` | Déconnecter l'utilisateur |
| `ADD_ASSET` | Ajouter un équipement |
| `DELETE_ASSET` | Supprimer un équipement |
| `ASSIGN_ASSET` | Affecter à un employé |
| `RETURN_ASSET` | Retourner au stock |
| `ADD_EMPLOYEE` | Ajouter un employé |
| `DELETE_EMPLOYEE` | Supprimer un employé |
| `ADD_ADMIN_ITEM` | Ajouter catégorie/marque/site |
| `DELETE_ADMIN_ITEM` | Supprimer catégorie/marque/site |
| `ADD_TOAST` | Afficher une notification |
| `REMOVE_TOAST` | Masquer une notification |

---

## 👥 Rôles et Permissions

| Fonctionnalité | Admin | IT Manager | Technicien |
|---|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ |
| Voir les matériels | ✅ | ✅ | ✅ |
| Ajouter un matériel | ✅ | ✅ | ❌ |
| Supprimer un matériel | ✅ | ❌ | ❌ |
| Affecter un matériel | ✅ | ✅ | ✅ |
| Gérer les employés | ✅ | ✅ | ❌ |
| Voir les mouvements | ✅ | ✅ | ✅ |
| Audit Logs | ✅ | ✅ | ❌ |
| Admin Panel | ✅ | ❌ | ❌ |
| Gérer les utilisateurs | ✅ | ❌ | ❌ |

---

## 🎨 Fonctionnalités UI

- ☀️ **Mode clair / sombre** — toggle disponible sur toutes les pages
- 📱 **Responsive design** — adapté mobile, tablette et desktop
- 🔍 **Recherche en temps réel** — filtrage instantané des listes
- 🔔 **Notifications toast** — retour visuel sur chaque action
- 📊 **Graphiques live** — donut chart et bar chart mis à jour depuis le store
- 🔐 **Guards de navigation** — redirection automatique selon l'état d'authentification

---

## 🧪 Comptes de Test

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | admin@company.ma | 1234 |
| IT Manager | it@company.ma | 1234 |
| Technicien | tech@company.ma | 1234 |

---

## 📄 Licence

Projet réalisé dans le cadre d'un stage de fin d'études — 2025.
