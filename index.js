// index.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

// Define the port
const PORT = process.env.PORT || 3000;

// Directory to store uploaded files
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

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
    maxFileSize: 500 * 1024 * 1024, // 500 MB
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`
        <p>Error: ${err.message}</p>
        <a href="/">Go back</a>
      `);
      return;
    }

    const file = files.audioFile;
    if (!file) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`
        <p>Error: No file uploaded.</p>
        <a href="/">Go back</a>
      `);
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
          <p>Error: ${renameErr.message}</p>
          <a href="/">Go back</a>
        `);
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <p>File Uploaded Successfully!</p>
        <p>File Name: ${newFileName}</p>
        <a href="/">Upload another file</a>
        <br>
        <a href="/uploads/${newFileName}">Access the uploaded file</a>
      `);
    });
  });
}

// Function to list uploaded files
function listFiles(res) {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 - Internal Error');
      return;
    }

    let fileList = '';
    files.forEach((file) => {
      const filePath = `/uploads/${file}`;
      fileList += `
        <li>
          <strong>${file}</strong><br>
          <audio controls src="${filePath}"></audio>
        </li>
      `;
    });

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Audio Hosting Site</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1, h2 { color: #333; }
          form { margin-bottom: 30px; }
          ul { list-style-type: none; padding: 0; }
          li { margin-bottom: 20px; }
          audio { display: block; margin-top: 10px; }
        </style>
      </head>
      <body>
        <h1>Upload an Audio File</h1>
        <form action="/upload" method="POST" enctype="multipart/form-data">
          <input type="file" name="audioFile" accept="audio/*" required>
          <button type="submit">Upload</button>
        </form>

        <h2>Available Audio Files</h2>
        <ul>
          ${fileList || '<li>No files uploaded yet.</li>'}
        </ul>
      </body>
      </html>
    `;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });
}

// Create the HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Routing
  if (req.method === 'GET') {
    if (pathname === '/' || pathname === '/index.html') {
      listFiles(res);
    } else if (pathname.startsWith('/uploads/')) {
      // Serve uploaded files
      const filePath = path.join(UPLOAD_DIR, pathname.replace('/uploads/', ''));
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.m4a': 'audio/mp4',
        '.flac': 'audio/flac',
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 - File Not Found');
        } else {
          serveStaticFile(res, filePath, contentType);
        }
      });
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
