const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// Serve static files from 'public'
app.use(express.static('public'));

// Serve images from the 'images' directory
app.use('/images', express.static('images'));

// Serve robots.txt
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

// Serve sitemap.xml (if you have one)
app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml')); // Ensure you have a sitemap.xml file in your public folder
});

// API endpoint to list images
app.get('/api/images', (req, res) => {
  console.log("Received request for image list at /api/images");
  
  const imagesDir = path.join(__dirname, 'images');
  fs.readdir(imagesDir, (err, files) => {
    if (err) {
      console.error('Error reading images directory:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Filter for image files only
    const imageFiles = files.filter(file => ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(path.extname(file).toLowerCase()));
    console.log(`Found ${imageFiles.length} image files in /images directory:`, imageFiles);

    res.json(imageFiles);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
