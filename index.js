// index.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

// Load environment variables from .env file (optional)
require('dotenv').config();

// Define the port
const PORT = process.env.PORT || 3000;

// Directories
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Define supported audio file extensions and their corresponding MIME types
const supportedAudioTypes = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.flac': 'audio/flac',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.aiff': 'audio/aiff',
  '.alac': 'audio/alac',
  '.wma': 'audio/x-ms-wma',
  '.amr': 'audio/amr',
  '.au': 'audio/basic',
  '.pcm': 'audio/L16',
  '.dsd': 'audio/dsd',
  '.opus': 'audio/opus',
  '.ac3': 'audio/ac3',
  '.dts': 'audio/vnd.dts',
  '.voc': 'audio/voc',
  '.tta': 'audio/tta',
  '.ra': 'audio/vnd.rn-realaudio',
  '.mka': 'audio/x-matroska',
  '.mid': 'audio/midi',
  '.midi': 'audio/midi',
  '.rmi': 'audio/midi',
  '.cda': 'application/x-cdf',
  '.mpa': 'audio/mpeg',
  '.mp2': 'audio/mpeg',
  '.mp1': 'audio/mpeg',
  '.m3u': 'audio/x-mpegurl',
  '.pls': 'audio/x-scpls',
  '.s3m': 'audio/s3m',
  '.it': 'audio/it',
  '.xm': 'audio/xm',
  // Add more formats as needed
};

// Function to serve static files
function serveStaticFile(res, filePath, contentType, responseCode = 200) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 - Internal Error');
    } else {
      res.writeHead(responseCode, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}

// Function to handle file uploads
function handleUpload(req, res) {
  const form = formidable({
    multiples: false,
    uploadDir: UPLOAD_DIR,
    keepExtensions: true,
    maxFileSize: process.env.MAX_FILE_SIZE || 500 * 1024 * 1024, // 500 MB
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`
        <div class="container mt-5">
          <div class="alert alert-danger" role="alert">
            <strong>Error:</strong> ${err.message}
          </div>
          <a href="/" class="btn btn-primary">Go Back</a>
        </div>
      `);
      return;
    }

    const file = files.audioFile;
    if (!file) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`
        <div class="container mt-5">
          <div class="alert alert-warning" role="alert">
            <strong>Error:</strong> No file uploaded.
          </div>
          <a href="/" class="btn btn-primary">Go Back</a>
        </div>
      `);
      return;
    }

    const fileExtension = path.extname(file.originalFilename).toLowerCase();
    if (!supportedAudioTypes[fileExtension]) {
      // Delete the unsupported file
      fs.unlink(file.filepath, () => {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`
          <div class="container mt-5">
            <div class="alert alert-danger" role="alert">
              <strong>Error:</strong> Unsupported audio format (${fileExtension}).
            </div>
            <a href="/" class="btn btn-primary">Go Back</a>
          </div>
        `);
      });
      return;
    }

    // Optionally, rename the file to include timestamp
    const timestamp = Date.now();
    const newFileName = `${timestamp}-${path.basename(file.originalFilename)}`;
    const newFilePath = path.join(UPLOAD_DIR, newFileName);

    fs.rename(file.filepath, newFilePath, (renameErr) => {
      if (renameErr) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`
          <div class="container mt-5">
            <div class="alert alert-danger" role="alert">
              <strong>Error:</strong> ${renameErr.message}
            </div>
            <a href="/" class="btn btn-primary">Go Back</a>
          </div>
        `);
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <div class="container mt-5">
          <div class="alert alert-success" role="alert">
            <strong>Success!</strong> File uploaded successfully.
          </div>
          <p><strong>File Name:</strong> ${newFileName}</p>
          <a href="/" class="btn btn-primary">Upload Another File</a>
          <a href="/uploads/${newFileName}" class="btn btn-secondary ms-2">Access File</a>
        </div>
      `);
    });
  });
}

// Function to list uploaded files
function listFiles(res) {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify([]));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(files));
  });
}

// Function to serve `index.html` and other static files from `public/`
function servePublicFile(res, pathname) {
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();

  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    // Add more MIME types as needed
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found, serve 404 page
      serveStaticFile(res, path.join(PUBLIC_DIR, '404.html'), 'text/html', 404);
    } else {
      serveStaticFile(res, filePath, contentType);
    }
  });
}

// Create the HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Routing
  if (req.method === 'GET') {
    if (pathname === '/' || pathname === '/index.html') {
      servePublicFile(res, '/index.html');
    } else if (pathname.startsWith('/uploads/')) {
      // Serve uploaded files
      const fileName = pathname.replace('/uploads/', '');
      const filePath = path.join(UPLOAD_DIR, fileName);
      const fileExtension = path.extname(filePath).toLowerCase();
      const contentType = supportedAudioTypes[fileExtension] || 'application/octet-stream';

      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 - File Not Found');
        } else {
          serveStaticFile(res, filePath, contentType);
        }
      });
    } else if (pathname.startsWith('/public/')) {
      // Serve other public assets
      servePublicFile(res, pathname.replace('/public/', '/'));
    } else if (pathname === '/file-list') {
      listFiles(res);
    } else {
      // 404 for other routes
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - Not Found');
    }
  } else if (req.method === 'POST' && pathname === '/upload') {
    handleUpload(req, res);
  } else {
    // 405 Method Not Allowed for unsupported methods
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('405 - Method Not Allowed');
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
