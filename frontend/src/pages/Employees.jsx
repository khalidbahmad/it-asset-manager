import { useCallback, useState } from "react";
import { useStore } from "../store/StoreContext";
import { StorePanel } from "../store/storeIntspectorPanel";
import AddEmployeeModal from "../components/forms/EmployeeForm";


function EmployeesPage(){
  const {state:{employees,assets},dispatch,toast} = useStore();
  const [search,setSearch]=useState('');
  const [showAdd,setShowAdd]=useState(false);
  const filtered=employees.filter(e=>!search||(e.name+e.dept+e.email).toLowerCase().includes(search.toLowerCase()));
  const count=useCallback((name)=>assets.filter(a=>a.assignedTo===name).length,[assets]);
  function handleDelete(e){
    if(count(e.name)>0){ toast('error','❌',`${e.name} a encore ${count(e.name)} asset(s)`); return; }
    dispatch({type:'DELETE_EMPLOYEE',id:e.id}); toast('info','🗑️',`${e.name} retiré du store`);
  }
  return (
    <div className="content">
      {showAdd&&<AddEmployeeModal onClose={()=>setShowAdd(false)}/>}
      <StorePanel/>
      <div className="card">
        <div className="card-header">
          <div className="card-title">EMPLOYÉS ({filtered.length})</div>
          <div className="card-actions">
            <div className="search-box" style={{minWidth:150}}><span style={{color:'var(--text3)'}}>🔍</span><input placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
            <button className="topbar-btn primary" onClick={()=>setShowAdd(true)}>+ Ajouter</button>
          </div>
        </div>
        <div className="emp-grid">
          {filtered.map(e=>(
            <div key={e.id} className="emp-card">
              <div className="emp-avatar">{e.initials}</div>
              <div className="emp-name">{e.name}</div>
              <div className="emp-dept">{e.dept}</div>
              <div style={{fontSize:10,color:'var(--text3)',marginBottom:10}}>{e.email}</div>
              <div style={{fontSize:12,color:'var(--text2)',marginBottom:12}}>
                Assets: <span className="emp-stat-val">{count(e.name)}</span>
              </div>
              <button className="action-btn danger" style={{width:'100%'}} onClick={()=>handleDelete(e)}>Supprimer</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmployeesPage;