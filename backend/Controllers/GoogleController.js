const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const client = require('../utils.js/config');
const User = require('../Models/User');

// Function to verify Google Token
const verifyGoogleToken = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: '985359243899-vgjcmnu5921lk7ginjn9lvkoqib7t5po.apps.googleusercontent.com',  // Ensure the correct Client ID
  });

  const payload = ticket.getPayload();
  return payload;
};

module.exports = {
  googleAuth: async (req, res) => {
    const { token } = req.body;
    
    try {
      const googleUser = await verifyGoogleToken(token);

      // Check if user already exists
      let user = await User.findOne({ email: googleUser.email });

      if (!user) {
        // If user does not exist, create new
        user = new User({
          name: googleUser.name,
          email: googleUser.email,
          password: 'googlelogin',  // Google login doesn't require password
        });

        await user.save();
      }

      // Generate JWT Token
      const jwtToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        'secretkey',  // Your JWT secret key
        { expiresIn: '1h' }
      );

      res.json({ jwtToken, role: user.role, name: user.name });
    } catch (err) {
      console.log(err);
      res.status(500).send('Server Error');
    }
  }
};
