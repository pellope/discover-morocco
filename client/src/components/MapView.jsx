import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatMoney } from '../i18n.js';

// Carte du Maroc avec un point par ville ; un clic ouvre une bulle menant à la page de la ville.
export default function MapView({ t, lang, destinations }) {
  const container = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);

  useEffect(() => {
    map.current = L.map(container.current, { scrollWheelZoom: false, zoomSnap: 0.25 });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 12,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => map.current.remove();
  }, []);

  useEffect(() => {
    layer.current.clearLayers();
    if (destinations.length === 0) return;
    for (const d of destinations) {
      const marker = L.marker([d.lat, d.lng], {
        icon: L.divIcon({ className: `map-dot ${d.fits === false ? 'dimmed' : ''}`, iconSize: [18, 18] }),
        title: d.name[lang],
        riseOnHover: true,
      });
      // Un clic ouvre une bulle avec le nom, le prix et le lien vers la page de la ville.
      const popup = document.createElement('div');
      popup.className = 'map-popup';
      const name = document.createElement('strong');
      name.textContent = d.name[lang];
      const price = document.createElement('span');
      price.textContent = `${t.from} ${formatMoney(d.minDailyBudget, lang)} ${t.perDayShort}`;
      const link = document.createElement('a');
      link.href = `#/city/${d.id}`;
      link.textContent = t.planThisCity;
      popup.append(name, price, link);
      marker.bindPopup(popup, { closeButton: false, offset: [0, -4] });
      marker.addTo(layer.current);
    }
    map.current.fitBounds(destinations.map((d) => [d.lat, d.lng]), { padding: [30, 30], maxZoom: 8 });
  }, [destinations, lang, t]);

  return (
    <div>
      <div className="map" ref={container} />
      <p className="muted map-hint">{t.mapHint}</p>
    </div>
  );
}
