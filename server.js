const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files from the uploads folder

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'gskumar1984',
  database: 'clgslove',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Database query failed:', err);
      return res.status(500).json({ success: false, message: 'Database query failed!' });
    }
    if (results.length > 0) {
      res.json({ success: true, username: results[0].username, fullName: results[0].full_name, universityName: results[0].university_name });
    } else {
      res.json({ success: false, message: 'Invalid credentials!' });
    }
  });
});

// Register endpoint
app.post('/register', (req, res) => {
  const { username, fullName, universityName, password } = req.body;
  const query = 'INSERT INTO users (username, full_name, university_name, password) VALUES (?, ?, ?, ?)';
  db.query(query, [username, fullName, universityName, password], (err, results) => {
    if (err) {
      console.error('Database query failed:', err);
      return res.status(500).json({ success: false, message: 'Database query failed!' });
    }
    res.json({ success: true, message: 'Registration successful!' });
  });
});

// Profile endpoint
app.get('/profile', (req, res) => {
  const username = 'exampleUser'; // Replace with actual user retrieval logic
  const query = 'SELECT username, full_name, university_name FROM users WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Database query failed:', err);
      return res.status(500).json({ success: false, message: 'Database query failed!' });
    }
    if (results.length > 0) {
      res.json({ success: true, username: results[0].username, fullName: results[0].full_name, universityName: results[0].university_name });
    } else {
      res.status(404).json({ success: false, message: 'User not found!' });
    }
  });
});

// Image upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
  const { username, caption, schoolName, imageId } = req.body;
  const imagePath = req.file.path;

  // Check if imageId is unique
  const checkQuery = 'SELECT * FROM images WHERE imageId = ?';
  db.query(checkQuery, [imageId], (err, results) => {
    if (err) {
      console.error('Error checking imageId uniqueness:', err);
      return res.status(500).send('Internal server error');
    }
    if (results.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Keep the unique image id.',
      });
    }

    // Insert image into database
    const query = 'INSERT INTO images (username, caption, schoolName, imagePath, imageId) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [username, caption, schoolName, imagePath, imageId], (err) => {
      if (err) {
        console.error('Error inserting image into database:', err);
        return res.status(500).send('Internal server error');
      }
      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully. Take a screenshot of the image ID to delete the image.',
      });
    });
  });
});

// Image delete endpoint
app.delete('/delete/:id', (req, res) => {
  const imageId = req.params.id;
  const query = 'DELETE FROM images WHERE id = ?';
  db.query(query, [imageId], (err) => {
    if (err) {
      console.error('Error deleting image from database:', err);
      return res.status(500).send('Internal server error');
    }
    res.status(200).send('Image deleted successfully');
  });
});

// Get all images endpoint
app.get('/images', (req, res) => {
  const query = 'SELECT * FROM images';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching images from database:', err);
      return res.status(500).send('Internal server error');
    }
    res.status(200).json(results);
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
