const authService = require('../services/AuthService');

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token: result.token,
        admin: result.admin,
        organization: result.organization
      }
    });
  } catch (error) {
    const statusCode = error.message === 'Invalid credentials' ? 401 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  login
};
