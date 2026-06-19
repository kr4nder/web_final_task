const express = require('express');
const Busboy = require('busboy');
const zlib = require('zlib');

const app = express();

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function readMultipart(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    let buffer = null;

    busboy.on('file', (fieldname, file) => {
      const chunks = [];

      file.on('data', (chunk) => chunks.push(chunk));
      file.on('end', () => {
        buffer = Buffer.concat(chunks);
      });
    });

    busboy.on('field', (fieldname, value) => {
      if (fieldname === 'file' && !buffer) {
        buffer = Buffer.from(value, 'latin1');
      }
    });

    busboy.on('finish', () => resolve(buffer));
    busboy.on('error', reject);
    req.pipe(busboy);
  });
}

function sendGzip(res, buffer) {
  const gz = zlib.gzipSync(buffer);

  res.set({
    'Content-Type': 'application/gzip',
    'Content-Disposition': 'attachment; filename=result.gz',
  });
  res.send(gz);
}

app.get('/login', (req, res) => {
  res.type('text/plain');
  res.send('krander');
});

app.post('/zipper', async (req, res) => {
  try {
    const contentType = req.headers['content-type'] || '';
    let buffer = null;

    if (contentType.includes('multipart/form-data')) {
      buffer = await readMultipart(req);
    } else {
      buffer = await readRawBody(req);
    }

    if (!buffer || buffer.length === 0) {
      return res.status(400).type('text/plain').send('No file uploaded');
    }

    sendGzip(res, buffer);
  } catch (error) {
    console.error(error);
    res.status(500).type('text/plain').send('error');
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
