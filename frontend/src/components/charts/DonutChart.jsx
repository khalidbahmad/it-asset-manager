import { useMemo } from "react";
import { useStore } from "../../store/StoreContext";
function DonutChart(){
  const {state:{assets}} = useStore();
  const counts = useMemo(()=>{
    const c={available:0,assigned:0,maintenance:0,retired:0};
    assets.forEach(a=>{ if(c[a.status]!==undefined) c[a.status]++; });
    return c;
  },[assets]);
  const total = assets.length || 1;
  const data=[
    {val:counts.available, color:'#4f8ef7',label:'Disponible'},
    {val:counts.assigned,  color:'#38d9a9',label:'Affecté'},
    {val:counts.maintenance,color:'#f6a623',label:'Maintenance'},
    {val:counts.retired,   color:'#ff5c5c',label:'Retraité'},
  ];
  const R=42; const C=2*Math.PI*R; let off=0;
  const slices=data.map(d=>{const len=(d.val/total)*C;const s={...d,off,len};off+=len;return s;});
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 100 100" width="110" height="110">
        <circle cx="50" cy="50" r={R} fill="none" stroke="var(--border)" strokeWidth="13"/>
        {slices.map((s,i)=><circle key={i} cx="50" cy="50" r={R} fill="none" stroke={s.color} strokeWidth="13" strokeDasharray={`${s.len} ${C-s.len}`} strokeDashoffset={-s.off+C/4}/>)}
        <text x="50" y="47" textAnchor="middle" fill="var(--text)" fontSize="14" fontWeight="700" fontFamily="Space Mono">{total}</text>
        <text x="50" y="59" textAnchor="middle" fill="var(--text3)" fontSize="8">assets</text>
      </svg>
      <div className="donut-legend">
        {data.map((d,i)=>(
          <div key={i} className="legend-item">
            <div className="legend-dot" style={{background:d.color}}/>
            <span>{d.label}</span>
            <span style={{marginLeft:8,fontFamily:'Space Mono',color:'var(--text)',fontSize:11}}>{d.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export default DonutChart;