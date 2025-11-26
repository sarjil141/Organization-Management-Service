const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Organization = require('../models/Organization');

async function login(email, password) {
  try {
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const organization = await Organization.findById(admin.organizationId);

    if (!organization) {
      throw new Error('Organization not found');
    }

    const token = generateToken({
      adminId: admin._id,
      email: admin.email,
      organizationId: organization._id,
      organizationName: organization.organizationName
    });

    return {
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role
      },
      organization: {
        id: organization._id,
        name: organization.organizationName
      }
    };
  } catch (error) {
    throw error;
  }
}

function generateToken(payload) {
  const secret = process.env.JWT_SECRET || 'default_secret_key_change_in_production';
  const expiresIn = process.env.JWT_EXPIRE || '7d';

  return jwt.sign(payload, secret, { expiresIn });
}

function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET || 'default_secret_key_change_in_production';
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

module.exports = {
  login,
  generateToken,
  verifyToken
};
