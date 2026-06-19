const express = require('express');
const multer = require('multer');
const zlib = require('zlib');

const app = express();
const upload = multer();

app.get('/login', (req, res) => {
  res.type('text/plain');
  res.send('krander');
});

app.post('/zipper', upload.single('file'), (req, res) => {
  try {
    const gz = zlib.gzipSync(req.file.buffer);

    res.set({
      'Content-Type': 'application/gzip',
      'Content-Disposition': 'attachment; filename=result.gz',
    });
    res.send(gz);
  } catch (error) {
    console.error(error);
    res.status(500).send('error');
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
