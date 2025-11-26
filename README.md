# Organization-Management-Service

organization management backend built with Node.js, Express, and MongoDB.

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create .env file**
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/organization_master
   JWT_SECRET=your_secret_key
   ```

3. **Start server**
   ```bash
   npm start
   ```

Server runs at: `http://localhost:5000`

## API Endpoints

- `POST /org/create` - Create organization
- `GET /org/get?organization_name=name` - Get organization
- `PUT /org/update` - Update organization
- `DELETE /org/delete` - Delete organization
- `POST /admin/login` - Admin login

## Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT
- Bcrypt
