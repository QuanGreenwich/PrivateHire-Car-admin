import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

interface DriverLocation {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: string;
}

export default function LiveMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [drivers, setDrivers] = useState<DriverLocation[]>([]);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [-0.1276, 51.5074], // London
      zoom: 12
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Listen to drivers location
    const unsubscribe = onSnapshot(collection(db, 'drivers'), (snapshot) => {
      const driversData: DriverLocation[] = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.location && data.location.latitude && data.location.longitude) {
          driversData.push({
            id: doc.id,
            name: data.name || 'Unknown',
            location: data.location,
            status: data.status || 'offline'
          });
        }
      });
      setDrivers(driversData);
    });

    return () => {
      unsubscribe();
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Remove old markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add new markers
    drivers.forEach(driver => {
      const el = document.createElement('div');
      el.className = 'driver-marker';
      el.style.cssText = `
        width: 32px;
        height: 32px;
        background: ${driver.status === 'online' ? '#10b981' : '#6b7280'};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
      `;
      el.textContent = driver.name.charAt(0).toUpperCase();

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([driver.location.longitude, driver.location.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 8px;">
                <strong>${driver.name}</strong><br/>
                <span style="color: ${driver.status === 'online' ? '#10b981' : '#6b7280'}">
                  ${driver.status}
                </span>
              </div>
            `)
        )
        .addTo(map.current!);

      markersRef.current[driver.id] = marker;
    });
  }, [drivers]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      {drivers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-500">No drivers with location data</p>
        </div>
      )}
    </div>
  );
}
