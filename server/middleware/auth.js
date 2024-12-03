const isAdmin = (req, res, next) => {
  try {
    const adminPassword = "donathi"; // Replace with your actual admin password

    // Check if the password is provided in headers or body
    const providedPassword = req.headers['x-admin-password'] || req.body.password;

    if (providedPassword === adminPassword) {
      return next(); // Password is correct; proceed to the next middleware or controller
    }

    res.status(403).json({ error: 'Access denied. Incorrect password.' }); // Forbidden
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while checking access.' });
  }
};

module.exports = { isAdmin };

