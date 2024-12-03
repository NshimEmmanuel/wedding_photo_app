const fs = require('fs');
const path = require('path');
const PhotoModel = require('../models/Photo'); // Photo database model

// Upload a photo
exports.uploadPhoto = async (req, res) => {
  try {
    const { wishes, filter } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const photo = await PhotoModel.savePhoto(req.file.path, wishes, filter);

    res.status(201).json(photo);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to save photo', details: error.message });
  }
};

// Fetch photos for a specific bride
exports.getPhotosByBride = async (req, res) => {
  try {
    const { brideId } = req.params;
    const photos = await PhotoModel.getPhotosByBride(brideId);

    if (!photos || photos.length === 0) {
      return res.status(404).json({ error: 'No photos found for this bride' });
    }

    res.json(photos);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch photos', details: error.message });
  }
};

// Fetch all photos (admin only)
exports.getAllPhotos = async (req, res) => {
  try {
    const photos = await PhotoModel.getAllPhotos();

    if (!photos || photos.length === 0) {
      return res.status(404).json({ error: 'No photos found' });
    }

    res.json(photos);
  } catch (error) {
    console.error('Error fetching all photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos', details: error.message });
  }
};

// Delete a specific photo
exports.deletePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const photo = await PhotoModel.getPhotoById(photoId);

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    console.log('Photo to delete:', photo);

    // Ensure the image path is available
    if (!photo.image_path) {
      return res.status(500).json({ error: 'Photo file path is undefined' });
    }

    // Remove the file from the filesystem
    fs.unlinkSync(photo.image_path);

    const deletedPhoto = await PhotoModel.deletePhoto(photoId);
    if (deletedPhoto) {
      res.json({ message: 'Photo deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete photo' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete photo', details: error.message });
  }
};
