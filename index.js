// index.js

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// Update file size limit to 500MB
const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // Limit files to 500MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('audioFile');

// Check file type
function checkFileType(file, cb) {
  const filetypes = /mp3|wav|ogg|m4a|flac/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Only audio files are allowed!');
  }
}

// Serve static files from the "public" directory
app.use(express.static('public'));

// Make 'uploads' folder accessible
app.use('/uploads', express.static('uploads'));

// Route to handle file uploads
app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.send(`
        <p>${err}</p>
        <a href="/">Go back</a>
      `);
    } else {
      if (req.file == undefined) {
        res.send(`
          <p>Error: No File Selected!</p>
          <a href="/">Go back</a>
        `);
      } else {
        res.send(`
          <p>File Uploaded Successfully!</p>
          <p>File Name: ${req.file.filename}</p>
          <a href="/">Upload another file</a>
          <br>
          <a href="/uploads/${req.file.filename}">Access the uploaded file</a>
        `);
      }
    }
  });
});

// Route to get list of uploaded files
app.get('/file-list', (req, res) => {
  fs.readdir('./uploads', (err, files) => {
    if (err) {
      res.json([]);
    } else {
      res.json(files);
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
