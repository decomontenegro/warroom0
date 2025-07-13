import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Test server is working!\n');
});

server.listen(7777, '127.0.0.1', () => {
  console.log('Server running at http://127.0.0.1:7777/');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});