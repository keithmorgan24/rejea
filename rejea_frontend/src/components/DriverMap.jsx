import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet default icon markers in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to center map as you move
const RecenterMap = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) map.setView(coords, 16);
    }, [coords, map]);
    return null;
};

const DriverMap = ({ onMapLoad }) => {
    const [position, setPosition] = useState(null);

    useEffect(() => {
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const newPos = [pos.coords.latitude, pos.coords.longitude];
                setPosition(newPos);
            },
            (err) => console.error("GPS Error:", err),
            { enableHighAccuracy: true }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // 🎯 Trigger the parent's status update as soon as the position is acquired
    useEffect(() => {
        if (position && onMapLoad) {
            onMapLoad();
        }
    }, [position, onMapLoad]);

    return (
        <div className="w-full h-112.5 rounded-4xl overflow-hidden border border-zinc-800 shadow-2xl relative bg-zinc-900">
            {!position ? (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
                    <div className="text-center">
                        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-zinc-500 font-black text-xs uppercase tracking-widest">Awaiting GPS Signal...</p>
                    </div>
                </div>
            ) : (
                <MapContainer 
                    center={position} 
                    zoom={15} 
                    scrollWheelZoom={true} 
                    className="h-full w-full"
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                    />
                    <Marker position={position} />
                    {/* Ensure RecenterMap is imported/available */}
                    <RecenterMap coords={position} />
                </MapContainer>
            )}
        </div>
    );
};

export default DriverMap;
