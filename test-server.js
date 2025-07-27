const express = require('express');
const app = express();

app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Backend está funcionando\!' });
});

app.listen(3006, () => {
  console.log('Test server running on http://localhost:3006');
});
