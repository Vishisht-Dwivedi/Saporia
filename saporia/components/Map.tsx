"use client";

import React, { useEffect, useRef } from "react";

type Restaurant = { id: string; name: string; lat: number; lng: number };

function Map({
  restaurants = [],
  user,
  onRestaurantClick,
}: {
  restaurants?: Restaurant[];
  user?: { lat?: number; lng?: number };
  onRestaurantClick?: (r: Restaurant) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any>(null);

  useEffect(() => {
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const ensureLeaflet = () =>
      new Promise<void>((resolve, reject) => {
        if ((window as any).L) return resolve();
        const s = document.createElement("script");
        s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load Leaflet"));
        document.body.appendChild(s);
      });

    let cancelled = false;

    ensureLeaflet()
      .then(() => {
        if (cancelled) return;
        const L = (window as any).L;
        if (!containerRef.current) return;
        if ((containerRef.current as any)._leaflet_id && !mapRef.current) {
          try {
            delete (containerRef.current as any)._leaflet_id;
          } catch (e) {}
          containerRef.current.innerHTML = "";
        }
        let center: [number, number] = [23.25, 77.41];
        if (user?.lat && user?.lng) {
          center = [user.lat, user.lng];
        } else if (restaurants && restaurants.length) {
          const avgLat =
            restaurants.reduce((s, r) => s + (r.lat || 0), 0) /
            restaurants.length;
          const avgLng =
            restaurants.reduce((s, r) => s + (r.lng || 0), 0) /
            restaurants.length;
          center = [avgLat, avgLng];
        }
        if (!mapRef.current) {
          const map = L.map(containerRef.current).setView(center, 13);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
          }).addTo(map);
          mapRef.current = map;
          markersRef.current = L.layerGroup().addTo(map);
        } else {
          try {
            mapRef.current.setView(center, 13);
          } catch (e) {}

          if (!markersRef.current) {
            markersRef.current = L.layerGroup().addTo(mapRef.current);
          }
          if (markersRef.current?.clearLayers) {
            markersRef.current.clearLayers();
          }
        }
        const redIcon = L.icon({
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
        const blueIcon = L.icon({
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
        restaurants.forEach((r) => {
          if (typeof r.lat !== "number" || typeof r.lng !== "number") return;
          const m = L.marker([r.lat, r.lng], { icon: redIcon });
          m.bindPopup(`<strong>${r.name}</strong>`);
          m.on("click", () => onRestaurantClick && onRestaurantClick(r));
          markersRef.current.addLayer(m);
        });
        if (user?.lat && user?.lng) {
          const um = L.marker([user.lat, user.lng], { icon: blueIcon });
          um.bindPopup("<strong>Your location</strong>");
          markersRef.current.addLayer(um);
        }
      })
      .catch((err) => console.error("Leaflet load error", err));

    return () => {
      cancelled = true;
      if (mapRef.current) {
        try {
          mapRef.current.remove();
          mapRef.current = null;
        } catch (e) {}
      }
    };
  }, [restaurants, user, onRestaurantClick]);

  return (
    <div className="w-full">
      <div className="relative rounded-sm border border-gray-200/60 bg-white/70 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden">
        <div
          ref={containerRef}
          className="w-full h-[70vh]"
          style={{ position: "relative", zIndex: 0 }}
        />
      </div>
    </div>
  );
}

export default React.memo(Map);