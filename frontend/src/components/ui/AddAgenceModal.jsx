import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "../../store/StoreContext";
import { Modal } from "./Modal";
import { toast } from "./Toast";
import client from "../../api/axiosClient";

export function MapPicker({ lat, lng, onChange }) {
    const mapRef    = useRef(null);
    const mapObj    = useRef(null);
    const markerRef = useRef(null);
    const [search,  setSearch]  = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (mapObj.current) return;

        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id   = 'leaflet-css';
            link.rel  = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        const script = document.createElement('script');
        script.src   = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => initMap();
        document.head.appendChild(script);

        return () => { if (mapObj.current) mapObj.current.remove(); };
    }, []);

    // ── Reverse geocoding ─────────────────────────────────────────
    async function reverseGeocode(clat, clng) {
        try {
            const res  = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${clat}&lon=${clng}&format=json&accept-language=fr`
            );
            const data = await res.json();

            const address  = data.display_name ?? '';
            const city     = data.address?.city
                          ?? data.address?.town
                          ?? data.address?.village
                          ?? data.address?.county
                          ?? '';
            const road     = data.address?.road ?? '';
            const postcode = data.address?.postcode ?? '';
            const country  = data.address?.country ?? '';

            // Construire une adresse propre
            const cleanAddress = [road, postcode, city, country]
                .filter(Boolean)
                .join(', ');

            onChange(clat, clng, {
                nom_ville: city,
                Adresse:   cleanAddress || address,
            });
        } catch (err) {
            // Si le reverse geocoding échoue, retourner juste les coords
            console.error("Erreur validation:", err?.response?.data?.errors);  // ← détail par champ
            toast('error', '❌', err?.response?.data?.message ?? 'Erreur création agence');
            onChange(clat, clng, null);
        }
    }

    function initMap() {
        if (!mapRef.current || mapObj.current) return;
        const L   = window.L;
        const map = L.map(mapRef.current).setView(
            [lat || 33.5731, lng || -7.5898],
            lat ? 13 : 6
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
        }).addTo(map);

        if (lat && lng) {
            markerRef.current = L.marker([lat, lng]).addTo(map);
        }

        map.on('click', async (e) => {
            const { lat: clat, lng: clng } = e.latlng;

            if (markerRef.current) {
                markerRef.current.setLatLng([clat, clng]);
            } else {
                markerRef.current = L.marker([clat, clng]).addTo(map);
            }

            // ← Reverse geocoding au clic
            await reverseGeocode(clat, clng);
        });

        mapObj.current = map;
    }

    async function searchAddress() {
        if (!search.trim()) return;
        setLoading(true);
        try {
            const res  = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=1&accept-language=fr`
            );
            const data = await res.json();
            if (data.length > 0) {
                const { lat: rlat, lon: rlon } = data[0];
                const L = window.L;
                mapObj.current?.setView([rlat, rlon], 14);
                if (markerRef.current) {
                    markerRef.current.setLatLng([rlat, rlon]);
                } else {
                    markerRef.current = L.marker([rlat, rlon]).addTo(mapObj.current);
                }
                await reverseGeocode(parseFloat(rlat), parseFloat(rlon));
            }
        } catch { } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchAddress())}
                    placeholder="Rechercher une adresse..."
                    style={{ flex: 1 }}
                />
                <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0 12px', whiteSpace: 'nowrap' }}
                    onClick={searchAddress}
                    disabled={loading}
                >
                    {loading ? '...' : '🔍'}
                </button>
            </div>

            <div
                ref={mapRef}
                style={{ height: 280, borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' }}
            />

            {lat && lng && (
                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--accent2)', fontFamily: 'Space Mono,monospace', display: 'flex', alignItems: 'center', gap: 8 }}>
                    📌 {lat.toFixed(6)}, {lng.toFixed(6)}
                    <button
                        type="button"
                        style={{ fontSize: 10, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={() => {
                            onChange(null, null, null);
                            if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
                        }}
                    >✕ effacer</button>
                </div>
            )}
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
                Cliquez sur la carte pour placer le marqueur et récupérer l'adresse automatiquement
            </div>
        </div>
    );
}
