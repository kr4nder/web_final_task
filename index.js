const express = require('express');
const multer = require('multer');
const zlib = require('zlib');

const app = express();
const upload = multer();

function getFileBuffer(req) {
  if (req.file?.buffer) {
    return req.file.buffer;
  }

  if (req.files?.length) {
    return req.files[0].buffer;
  }

  if (Buffer.isBuffer(req.body) && req.body.length > 0) {
    return req.body;
  }

  return null;
}

app.get('/login', (req, res) => {
  res.type('text/plain');
  res.send('krander');
});

app.post('/zipper', (req, res, next) => {
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('multipart/form-data')) {
    upload.any()(req, res, next);
    return;
  }

  express.raw({ type: () => true, limit: '10mb' })(req, res, next);
}, (req, res) => {
  const buffer = getFileBuffer(req);

  if (!buffer) {
    return res.status(400).type('text/plain').send('No file uploaded');
  }

  try {
    const gz = zlib.gzipSync(buffer);

    res.set({
      'Content-Type': 'application/gzip',
      'Content-Disposition': 'attachment; filename=result.gz',
    });
    res.send(gz);
  } catch (error) {
    console.error(error);
    res.status(500).type('text/plain').send('error');
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
