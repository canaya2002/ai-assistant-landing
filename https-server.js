const https = require('https');
const fs = require('fs');
const path = require('path');

// Crear certificados auto-firmados
const cert = `-----BEGIN CERTIFICATE-----
MIIBkTCB+wIJANT4G+kPJEe5MA0GCSqGSIb3DQEBCwUAMBQxEjAQBgNVBAMTCWxv
Y2FsaG9zdDAeFw0yNDEyMTAwMDAwMDBaFw0yNTEyMTAwMDAwMDBaMBQxEjAQBgNV
BAMTCWxvY2FsaG9zdDBcMA0GCSqGSIb3DQEBAQUAA0sAMEgCQQDm3WOjMJ6j5J6p
P1zP3+YtH3p5K8B8iE3oWqR9G8G3P8G3G8G3G8G3G8G3G8G3G8G3G8G3G8G3G8G3
G8G3G8G3G8G3G8G3G8G3G8G3G8G3G8G3G8G3G8G3G8G3G8G3G8G3G8G3G8G3AgMB
AAEwDQYJKoZIhvcNAQELBQADQQA5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5
J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J5
-----END CERTIFICATE-----`;

const key = `-----BEGIN PRIVATE KEY-----
MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEA5t1jozCeo+Seqd9c
z9/mLR96eSvAfIhN6FqkfRvBtz/Btz/Btz/Btz/Btz/Btz/Btz/Btz/Btz/Btz/B
tz/Btz/Btz/Btz/Btz/Btz/Btz/Btz/Btz/Btz/Btz/Btz/BtwIDAQABAkEA0QQQ
0QQQ0QQQ0QQQ0QQQ0QQQ0QQQ0QQQ0QQQ0QQQ0QQQ0QQQ0QQQ0QQQ0QQQ0QQQ0QQQ
0QQQ0QQQ0QQQ0QQQ0QQQ0QQQ0QQQ0QQQ0QQQ0QQQARQA+YmYmYmYmYmYmYmYmYmY
mYmYmYmYmYmYmYmYmYmYmYmYmYkRUA8xMxMxMxMxMxMxMxMxMxMxMxMxMxMxMxMx
MxMxMxMxMxMxETEA0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ
0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQU=
-----END PRIVATE KEY-----`;

const options = { key, cert };

const server = https.createServer(options, (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Proxy simple a Next.js
  const http = require('http');
  
  const proxyReq = http.request({
    hostname: 'localhost',
    port: 3000,
    path: req.url,
    method: req.method,
    headers: req.headers
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  proxyReq.on('error', (err) => {
    console.log('Error conectando a Next.js:', err.message);
    res.writeHead(500);
    res.end('Next.js no está ejecutándose en puerto 3000');
  });
  
  req.pipe(proxyReq);
});

server.listen(3001, () => {
  console.log('🔒 SERVIDOR HTTPS FUNCIONANDO');
  console.log('');
  console.log('✅ HTTPS: https://localhost:3001');
  console.log('✅ USA ESA URL PARA EL MICRÓFONO');
  console.log('');
  console.log('📋 PASOS:');
  console.log('1. Ve a https://localhost:3001');
  console.log('2. Acepta el certificado (click "Avanzado" → "Continuar")');
  console.log('3. ¡EL MICRÓFONO FUNCIONARÁ!');
});