const express = require('express');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');

const app = express();

// Enable compression
app.use(compression());

// Apply security headers with custom CSP to allow Google Maps iframe
// Detect Facebook crawler
app.use((req, res, next) => {
  const userAgent = req.get('user-agent') || '';
  const isFacebookBot = userAgent.includes('facebookexternalhit') || userAgent.includes('Facebot');
  
  if (isFacebookBot) {
    // Special handling for Facebook crawler
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length');
    
    // If requesting an image, ensure proper content type
    if (req.path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      res.setHeader('Content-Type', `image/${RegExp.$1}`);
    }
  }
  next();
});

// Configure security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        frameSrc: ["'self'", "https://maps.google.com", "https://*.google.com"],
        imgSrc: [
          "'self'",
          "data:",
          "https://maps.gstatic.com",
          "https://*.fbcdn.net",
          "https://*.facebook.com"
        ],
        connectSrc: [
          "'self'",
          "https://maps.googleapis.com",
          "https://*.facebook.com"
        ],
        fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
  })
);

// Configure static file serving
const staticOptions = {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Special handling for images
    if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate');
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
};

// Handle www to non-www redirect
app.use((req, res, next) => {
  if (req.hostname.startsWith('www.')) {
    const newUrl = `https://${req.hostname.slice(4)}${req.originalUrl}`;
    return res.redirect(301, newUrl);
  }
  next();
});

// Serve static files from 'public' with enhanced caching
app.use(express.static('public', staticOptions));

// Serve images from 'images' directory with enhanced caching
app.use('/images', express.static('images', {
  ...staticOptions,
  index: false, // Disable directory listing
  fallthrough: false // Return 404 for missing files
}));

// Serve robots.txt
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

// Serve sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// API endpoint to list images
app.get('/api/images', (req, res) => {
  console.log('Received request for image list at /api/images');

  const imagesDir = path.join(__dirname, 'images');
  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      console.error('Error reading images directory:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Filter for image files only
    const imageFiles = files.filter((file) =>
      ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(
        path.extname(file).toLowerCase()
      )
    );
    console.log(
      `Found ${imageFiles.length} image files in /images directory:`,
      imageFiles
    );

    res.json(imageFiles);
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
