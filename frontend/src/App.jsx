import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const POLLING_INTERVAL = import.meta.env.VITE_POLLING_INTERVAL || 5000; // 5 segundos por defecto

  const fetchLatestLocation = async () => {
    try {
      const response = await fetch(`${API_URL}/api/location/latest`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('No hay datos de ubicación disponibles');
          setLocationData(null);
          return;
        }
        throw new Error('Error al obtener datos');
      }

      const data = await response.json();
      setLocationData(data);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error('Error fetching location:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch inicial
    fetchLatestLocation();

    // Configurar polling
    const interval = setInterval(fetchLatestLocation, POLLING_INTERVAL);

    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp) => {
    // Convertir timestamp Unix a fecha legible
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  const formatCoordinate = (coord, type) => {
    const absolute = Math.abs(parseFloat(coord));
    const degrees = Math.floor(absolute);
    const minutes = (absolute - degrees) * 60;
    const direction = type === 'latitude' 
      ? (coord >= 0 ? 'N' : 'S')
      : (coord >= 0 ? 'E' : 'O');
    
    return `${degrees}° ${minutes.toFixed(4)}' ${direction}`;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card loading">
          <div className="spinner"></div>
          <p>Cargando datos de ubicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>Juls Tracker</h1>
        <p className="subtitle">Just UDP Location Service</p>
      </header>

      {error ? (
        <div className="card error">
          <p>⚠️ {error}</p>
        </div>
      ) : (
        locationData && (
          <div className="card">
            <h2>📍 Última Ubicación Recibida</h2>
            
            <div className="data-grid">
              <div className="data-item">
                <label>Latitud</label>
                <div className="value">
                  <span className="main">{parseFloat(locationData.latitude).toFixed(8)}°</span>
                  <span className="secondary">{formatCoordinate(locationData.latitude, 'latitude')}</span>
                </div>
              </div>

              <div className="data-item">
                <label>Longitud</label>
                <div className="value">
                  <span className="main">{parseFloat(locationData.longitude).toFixed(8)}°</span>
                  <span className="secondary">{formatCoordinate(locationData.longitude, 'longitude')}</span>
                </div>
              </div>

              <div className="data-item full-width">
                <label>Timestamp</label>
                <div className="value">
                  <span className="main">{formatTimestamp(locationData.timestamp_value)}</span>
                  <span className="secondary">Unix: {locationData.timestamp_value}</span>
                </div>
              </div>
            </div>

            <div className="map-link">
              <a 
                href={`https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="button"
              >
                Ver en Google Maps 🗺️
              </a>
            </div>
          </div>
        )
      )}

      {lastUpdate && (
        <div className="status">
          <p>
            Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
            <span className="pulse"></span>
          </p>
        </div>
      )}
    </div>
  );
}

export default App;