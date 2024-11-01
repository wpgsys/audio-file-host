---

# Audio Hosting Website

A simple Node.js application that allows users to upload, host, and play audio files. The application supports large files up to 500 MB, accommodating uploads equivalent to two common music albums.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [File Structure](#file-structure)
- [Technologies Used](#technologies-used)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

- Upload audio files up to **500 MB** in size.
- Supports common audio formats: **MP3**, **WAV**, **OGG**, **M4A**, and **FLAC**.
- Displays a list of uploaded audio files with playback controls.
- Simple and intuitive user interface.
- Server-side validation of file types and sizes.

*Note: Replace the image URL with a screenshot of your application.*

## Prerequisites

- **Node.js** (version 12 or higher)
- **npm** (Node Package Manager)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/wpgsys/audio-file-host.git
   cd audio-hosting-site
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create necessary directories:**

   Ensure that the `uploads` directory exists:

   ```bash
   mkdir uploads
   ```

## Usage

1. **Start the server:**

   ```bash
   node index.js
   ```

   Or, if you have defined a start script in `package.json`:

   ```bash
   npm start
   ```

2. **Access the application:**

   Open your web browser and navigate to:

   ```
   http://localhost:3000
   ```

3. **Upload an audio file:**

   - Click on **Choose File** and select an audio file up to 500 MB.
   - Supported formats: `.mp3`, `.wav`, `.ogg`, `.m4a`, `.flac`.
   - Click **Upload** to upload the file.

4. **Play uploaded audio files:**

   - Uploaded files will appear in the **Available Audio Files** section.
   - Use the audio playback controls to listen to the files directly in the browser.

## Configuration

### Adjusting Maximum File Size

- The maximum file size is set to **500 MB** by default.
- To change this limit, modify the `fileSize` parameter in `index.js`:

  ```javascript
  // index.js
  limits: { fileSize: YOUR_LIMIT_IN_BYTES }, // e.g., 200 * 1024 * 1024 for 200 MB
  ```

### Server and Proxy Configurations

- If using a reverse proxy (e.g., Nginx or Apache), adjust their configurations to allow larger file uploads.
- **Nginx example:**

  ```nginx
  http {
      client_max_body_size 500M;
  }
  ```

- **Apache example:**

  ```apache
  LimitRequestBody 524288000
  ```

### Increasing Server Timeout

- To prevent the server from timing out during large file uploads, increase the timeout setting in `index.js`:

  ```javascript
  // index.js
  const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  server.timeout = 600000; // Set timeout to 10 minutes
  ```

## File Structure

```
audio-hosting-site/
├── index.js
├── package.json
├── public/
│   └── index.html
├── uploads/
```

- **index.js**: The main server file.
- **package.json**: Contains project metadata and dependencies.
- **public/**: Directory for static frontend files.
- **uploads/**: Directory where uploaded audio files are stored.

## Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for Node.js.
- **Multer**: Middleware for handling `multipart/form-data` (file uploads).
- **HTML5 & CSS3**: Frontend structure and styling.

## Security Considerations

- **File Validation**: Only allows specific audio file types to be uploaded.
- **File Size Limitation**: Restricts the maximum upload size to prevent abuse.
- **Directory Permissions**: Ensure `uploads/` directory has appropriate permissions.
- **User Input Sanitization**: Basic sanitization implemented; consider enhancing for production.
- **HTTPS**: Use HTTPS in a production environment to secure data transmission.

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository.**
2. **Create a new branch** for your feature or bug fix:

   ```bash
   git checkout -b feature/YourFeatureName
   ```

3. **Commit your changes:**

   ```bash
   git commit -m 'Add some feature'
   ```

4. **Push to the branch:**

   ```bash
   git push origin feature/YourFeatureName
   ```

5. **Open a Pull Request**.

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Express.js Documentation](https://expressjs.com/)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Node.js File System Module](https://nodejs.org/api/fs.html)
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

---
