import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { ThreeDot } from 'react-loading-indicators';

// --- Configuración Básica ---
const config = {
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  APP_NAME: 'Juls Tracker',
  APP_SUBTITLE: 'Just UDP Location Service',
  APP_VERSION: '2.0.0',
  POLLING_INTERVAL: import.meta.env.VITE_POLLING_INTERVAL || 5000
};

function App() {
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchLatestLocation = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/location/latest`);
      
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
    const interval = setInterval(fetchLatestLocation, config.POLLING_INTERVAL);

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

  // --- Componentes de UI ---
  const LoadingSpinner = () => (
    <div className="flex items-center mx-auto justify-center p-8">
      <ThreeDot color="#FFFFFF" size="medium" text="" textColor="" />
    </div>
  );

  const ErrorMessage = ({ error, onRetry }) => (
    <div className="glassmorphism-strong mt-40 md:-mt-60 rounded-4xl min-w-[90%] mx-auto p-8 text-center">
      <div className="text-red-400 mb-4">
        <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <h3 className="text-xl font-bold">Error de Conexión</h3>
      </div>
      <p className="text-white/70 mb-4">{error}</p>
      <button onClick={onRetry} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors">
        Reintentar
      </button>
    </div>
  );

  const ConnectionStatus = () => {
    const isConnected = !error && !loading;
    
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
        <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
          {isConnected ? 'Conectado via Polling' : 'Desconectado'}
        </span>
      </div>
    );
  };

  const LocationInfo = ({ location }) => (
    <div className='glassmorphism-strong rounded-4xl max-w-[100%] p-8'>
      <h2 className='text-2xl font-bold text-white text-center rounded-4xl mb-8'>📍 Última Ubicación Recibida</h2>
      
      <div className='flex flex-row justify-between gap-4 glassmorphism group hover:scale-105 hover:shadow-[0px_3px_15px_0px_rgba(142,81,255,0.6)] rounded-xl mb-3 pl-2 pr-6 py-2'>
        <div className='flex flex-row gap-2 justify-left transition-all duration-300 group-hover:scale-105'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="text-white duration-300 group-hover:text-violet-500 size-6">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm4.28 10.28a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 1 0-1.06 1.06l1.72 1.72H8.25a.75.75 0 0 0 0 1.5h5.69l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3Z" clipRule="evenodd" />
          </svg>
          <h3 className='text-l text-white rounded-xl inline-block'>Latitud:</h3>
        </div>
        <div className="flex flex-col items-end">
          <span className='text-white/80 font-mono'>{parseFloat(location.latitude).toFixed(8)}°</span>
          <span className='text-white/50 text-sm'>{formatCoordinate(location.latitude, 'latitude')}</span>
        </div>
      </div>

      <div className='flex flex-row justify-between gap-4 glassmorphism group hover:scale-105 hover:shadow-[0px_3px_15px_0px_rgba(142,81,255,0.6)] rounded-xl mb-3 pl-2 pr-6 py-2'>
        <div className='flex flex-row gap-2 justify-left transition-all duration-300 group-hover:scale-105'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="text-white duration-300 group-hover:text-violet-500 size-6">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v5.69a.75.75 0 0 0 1.5 0v-5.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clipRule="evenodd" />
          </svg>
          <h3 className='text-l text-white rounded-xl inline-block'>Longitud:</h3>
        </div>
        <div className="flex flex-col items-end">
          <span className='text-white/80 font-mono'>{parseFloat(location.longitude).toFixed(8)}°</span>
          <span className='text-white/50 text-sm'>{formatCoordinate(location.longitude, 'longitude')}</span>
        </div>
      </div>

      <div className='flex flex-row justify-between gap-4 glassmorphism group hover:scale-105 hover:shadow-[0px_3px_15px_0px_rgba(142,81,255,0.6)] rounded-xl mb-3 pl-2 pr-6 py-2'>
        <div className='flex flex-row gap-2 group justify-left transition-all duration-300 group-hover:scale-105'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="text-white duration-300 group-hover:text-violet-500 size-6">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
          </svg>
          <h3 className='text-l text-white rounded-xl inline-block'>Timestamp:</h3>
        </div>
        <div className="flex flex-col items-end">
          <span className='text-white/80 font-mono'>{location.timestamp_value}</span>
          <span className='text-white/50 text-sm'>{formatTimestamp(location.timestamp_value)}</span>
        </div>
      </div>

      <div className="mt-6">
        <a 
          href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full glassmorphism group hover:scale-105 hover:shadow-[0px_3px_15px_0px_rgba(142,81,255,0.6)] rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-all duration-300"
        >
          <span className="text-white group-hover:text-violet-300">Ver en Google Maps</span>
          <span className="text-xl">🗺️</span>
        </a>
      </div>
    </div>
  );

  // --- Componente del Mapa ---
  function UpdateMarkerPosition({ position, timestamp }) {
    const map = useMap();
    
    useEffect(() => {
      // Solo actualizar el marcador si hay una nueva posición
      if (position) {
        // Centrar suavemente en la nueva posición solo si está muy lejos del centro actual
        const currentCenter = map.getCenter();
        const distance = map.distance(currentCenter, position);
        
        // Si la distancia es mayor a 100 metros, centrar suavemente
        if (distance > 100) {
          map.flyTo(position, map.getZoom(), {
            duration: 1.5,
            easeLinearity: 0.25
          });
        }
      }
    }, [position, map]);

    return null;
  }

  const LocationMap = ({ location }) => {
    const [mapCenter, setMapCenter] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);
    const JAWG_ACCESS_TOKEN = 'icNC49f9tQCM0CwkpIHYIXmvNjTgtAVrdIf3PdM94merPcn8Bcx806NlkILQrOPS';
    const JAWG_MAP_ID = 'jawg-dark';

    const customIcon = new Icon({
      iconUrl: "/icon.svg",
      iconSize: [70, 70]
    });

    const position = [parseFloat(location.latitude), parseFloat(location.longitude)];

    // Solo establecer el centro inicial del mapa una vez
    useEffect(() => {
      if (!mapCenter && position) {
        setMapCenter(position);
      }
    }, [position, mapCenter]);

    if (!mapCenter) {
      return (
        <div className='glassmorphism-strong rounded-4xl backdrop-blur-lg shadow-lg p-4 max-w-4xl w-full mx-4 flex items-center justify-center' style={{ height: '35rem' }}>
          <div className="text-white/70">Cargando mapa...</div>
        </div>
      );
    }

    return (
      <div className='glassmorphism-strong rounded-4xl backdrop-blur-lg shadow-lg p-4 max-w-4xl w-full mx-4'>
        <MapContainer 
          center={mapCenter} 
          zoom={18}
          style={{ height: '35rem', width: '100%', borderRadius: '1rem' }}
          whenCreated={setMapInstance}
        >
          <TileLayer
            url={`https://{s}.tile.jawg.io/${JAWG_MAP_ID}/{z}/{x}/{y}{r}.png?access-token=${JAWG_ACCESS_TOKEN}`}
          />
          <Marker 
            position={position} 
            icon={customIcon}
          >
            <Popup>
              <div className="text-center">
                <strong>Ubicación actual</strong><br/>
                <small>Recibida: {formatTimestamp(location.timestamp_value)}</small><br/>
                <small>Lat: {parseFloat(location.latitude).toFixed(6)}</small><br/>
                <small>Lng: {parseFloat(location.longitude).toFixed(6)}</small>
              </div>
            </Popup>
          </Marker>
          <UpdateMarkerPosition position={position} timestamp={location.timestamp_value} />
        </MapContainer>
      </div>
    );
  };

  return (
    <div className="min-h-screen transition-all duration-500 dark">
      {/* Fondo con gradientes */}
      <div className="fixed inset-0 -z-10 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-violet-800"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 md:w-96 md:h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-40 animate-float"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 md:w-80 md:h-80 bg-gray-400 rounded-full filter blur-3xl opacity-30 animate-float"></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 md:w-64 md:h-64 bg-zinc-500 rounded-full filter blur-3xl opacity-20 animate-float"></div>
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glassmorphism-strong min-w-[80%] md:min-w-[90%] py-3 px-4 rounded-4xl">
        <div className="flex flex-col items-center gap-2">
          <h1 className="py-1 px-3 text-center font-bold text-white/80 text-3xl">
            {config.APP_NAME}
          </h1>
          <p className="text-white/60 text-sm">{config.APP_SUBTITLE}</p>
          <div className="flex items-center gap-4 text-sm">
            <ConnectionStatus />
            <span className="text-white/60">v{config.APP_VERSION} - Polling</span>
            {lastUpdate && (
              <span className="text-white/60">
                Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='flex flex-col md:flex-row items-center mt-32 md:mt-12 justify-between gap-2 max-w-[90%] mx-auto min-h-screen'>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage error={error} onRetry={fetchLatestLocation} />
        ) : locationData ? (
          <>
            <LocationInfo location={locationData} />
            <LocationMap location={locationData} />
          </>
        ) : (
          <div className="glassmorphism-strong min-w-[90%] mx-auto rounded-4xl p-8 text-center">
            <p className="text-white/70 mb-4">Esperando datos de ubicación...</p>
            <p className="text-white/50 text-sm mb-4">Conectando via Polling...</p>
            <button 
              onClick={fetchLatestLocation} 
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
            >
              Refrescar
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;