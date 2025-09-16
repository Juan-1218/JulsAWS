import { useState, useEffect } from 'react'

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

    <>
      <div className="min-h-screen transition-all duration-500 dark">
        <div className="fixed inset-0 -z-10 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-violet-800"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 md:w-96 md:h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-40 animate-float"></div>
            <div className="absolute bottom-20 right-10 w-64 h-64 md:w-80 md:h-80 bg-gray-400 rounded-full filter blur-3xl opacity-30 animate-float"></div>
            <div className="absolute top-1/2 left-1/2 w-48 h-48 md:w-64 md:h-64 bg-zinc-500 rounded-full filter blur-3xl opacity-20 animate-float"></div>
          </div>
        </div>

        <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glassmorphism-strong min-w-[80%] md:min-w-[90%] py-3 px-4 rounded-4xl">
          <div className="flex flex-col items-center gap-2">
            <h1 className="py-1 px-3 text-center font-bold text-white/80 text-3xl">
              {config.APP_NAME}
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <ConnectionStatus connectionStatus={connectionStatus} isConnected={isConnected} />
              <span className="text-white/60">v{config.APP_VERSION} - SSE</span>
            </div>
          </div>
        </header>
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
      </div>
    </>


  );
}

export default App;