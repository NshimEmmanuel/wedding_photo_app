const express = require('express');
const multer = require('multer');
const { isAdmin } = require('../middleware/auth');
const photoController = require('../controller/PhotoController');
const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
});

// Routes
router.post('/upload', upload.single('image'), photoController.uploadPhoto);
router.get('/photos/all', isAdmin, photoController.getAllPhotos);
router.get('/bride/:brideId', photoController.getPhotosByBride);
router.delete('/photo/:photoId', photoController.deletePhoto);

module.exports = router;
