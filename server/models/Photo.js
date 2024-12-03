const db = require('../config/database');

class PhotoModel {
  // Save a new photo
  static async savePhoto(imagePath, wishes, filter) {
    const query = `
      INSERT INTO photos (
        image_path,
        wishes, 
        filter, 
        timestamp
      ) VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [
      imagePath, 
      wishes || '', 
      filter || null, 
      new Date()
    ];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error saving photo:', error);
      throw error;
    }
  }

  // Fetch a specific photo by ID
  static async getPhotoById(photoId) {
    const query = `
      SELECT 
        id, 
        image_path, 
        wishes, 
        filter, 
        timestamp
      FROM photos 
      WHERE id = $1;
    `;
    
    try {
      const result = await db.query(query, [photoId]);
      return result.rows[0] || null; // Return photo or null if not found
    } catch (error) {
      console.error('Error fetching photo by ID:', error);
      throw error;
    }
  }

  // Fetch all photos for a specific bride
  static async getPhotosByBride(brideId) {
    const query = `
      SELECT 
        id, 
        image_path,  
        wishes, 
        filter, 
        timestamp
      FROM photos 
      WHERE bride_id = $1 
      ORDER BY timestamp DESC;
    `;
    
    try {
      const result = await db.query(query, [brideId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching photos:', error);
      throw error;
    }
  }
  // Fetch a specific photo by ID
  static async getPhotoById(photoId) {
    const query = `
      SELECT 
        id, 
        image_path, 
        wishes, 
        filter, 
        timestamp
      FROM photos 
      WHERE id = $1;
    `;
    
    try {
      const result = await db.query(query, [photoId]);
      return result.rows[0] || null; // Return photo or null if not found
    } catch (error) {
      console.error('Error fetching photo by ID:', error);
      throw error;
    }
  }
  // Fetch all photos
  static async getAllPhotos() {
    const query = `
      SELECT 
        id, 
        image_path, 
        wishes, 
        filter, 
        timestamp
      FROM photos 
      ORDER BY timestamp DESC;
    `;

    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching all photos:', error);
      throw error;
    }
  }

   // Delete a specific photo
   static async deletePhoto(photoId) {
    const query = `
      DELETE FROM photos 
      WHERE id = $1 
      RETURNING *;
    `;
    
    try {
      const result = await db.query(query, [photoId]);
      return result.rows[0]; // Return deleted photo details or null if not found
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }
}

module.exports = PhotoModel;
