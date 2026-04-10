import { useMemo } from "react";
import { useStore } from "../../store/StoreContext";

function BarChart() {
    const { state: { assets } } = useStore();

    const cats = useMemo(() => {
        const m = {};
        assets.forEach(a => {
            const catName = a.category?.name ?? 'Inconnu';
            m[catName] = (m[catName] || 0) + 1;
        });
        return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6);
    }, [assets]);

    const max = Math.max(...cats.map(c => c[1]), 1);
    const colors = ['#4f8ef7', '#38d9a9', '#f6a623', '#a78bfa', '#ff5c5c', '#4fd1c5'];

    return (
        <div className="mini-bar">
            {cats.map(([cat, val], i) => (
                <div key={cat} className="bar-row">
                    <div className="bar-label">{cat}</div>
                    <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${(val / max) * 100}%`, background: colors[i % colors.length] }} />
                    </div>
                    <div className="bar-value">{val}</div>
                </div>
            ))}
        </div>
    );
}

export default BarChart;