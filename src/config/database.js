const mongoose = require('mongoose');

let connection = null;

async function connect() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/organization_master';
    
    connection = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ MongoDB Master Database connected successfully');
    return connection;
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

async function disconnect() {
  try {
    await mongoose.disconnect();
    console.log(' MongoDB disconnected successfully');
  } catch (error) {
    console.error(' MongoDB disconnection error:', error.message);
  }
}

function getConnection() {
  return connection;
}

module.exports = {
  connect,
  disconnect,
  getConnection
};
