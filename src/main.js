const net = require('net');

const smtpHost = '185.151.28.67';
const smtpPort = 25;

const socket = net.createConnection(smtpPort, smtpHost);

socket.on('connect', () => {
  console.log('Connected to SMTP server');
  
  // Send an SMTP command after successful connection (e.g., HELO command)
  socket.write('HELO example.com\r\n');
});

socket.on('data', (data) => {
  console.log('Received from SMTP server:');
  console.log(data.toString()); // Log the response from the SMTP server
});

socket.on('end', () => {
  console.log('Connection closed by SMTP server');
});

socket.on('error', (err) => {
  console.error('Failed to connect to SMTP server:', err.message);
});

// Timeout handler in case the connection takes too long to establish
socket.setTimeout(5000, () => {
  console.error('Connection timed out');
  socket.destroy(); // Destroy the socket manually if it times out
});
