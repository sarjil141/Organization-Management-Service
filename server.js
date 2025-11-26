require('dotenv').config();
const express = require('express');
const cors = require('cors');
const database = require('./src/config/database');
const organizationRoutes = require('./src/routes/organizationRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const errorHandler = require('./src/utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Organization Management Service API',
    version: '1.0.0',
    endpoints: {
      organization: {
        create: 'POST /org/create',
        get: 'GET /org/get?organization_name=<name>',
        update: 'PUT /org/update',
        delete: 'DELETE /org/delete'
      },
      admin: {
        login: 'POST /admin/login'
      }
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.use('/org', organizationRoutes);
app.use('/admin', adminRoutes);

app.use(errorHandler.notFound);
app.use(errorHandler.handleError);

async function startServer() {
  try {
    await database.connect();
    
    app.listen(PORT, '0.0.0.0', () => {

    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await database.disconnect();
  process.exit(0);
});

startServer();
