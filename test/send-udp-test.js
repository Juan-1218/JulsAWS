const dgram = require('dgram');
const client = dgram.createSocket('udp4');

// Configuración
const SERVER_HOST = process.argv[2] || 'localhost';
const SERVER_PORT = 6001;

// Datos de prueba
const testData = {
  latitude: -12.0463731 + (Math.random() * 0.01), // Lima, Perú con variación
  longitude: -77.042754 + (Math.random() * 0.01),
  timestamp_value: Date.now(),
  accuracy: 10.5,
  altitude: 154.3,
  speed: 5.2,
  provider: 'gps'
};

const message = Buffer.from(JSON.stringify(testData));

client.send(message, SERVER_PORT, SERVER_HOST, (err) => {
  if (err) {
    console.error('Error enviando mensaje:', err);
  } else {
    console.log(`✅ Datos enviados a ${SERVER_HOST}:${SERVER_PORT}`);
    console.log('📍 Datos enviados:', testData);
  }
  client.close();
});

// Manejo de errores
client.on('error', (err) => {
  console.error('Error del cliente UDP:', err);
  client.close();
});