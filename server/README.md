# AlgoLearn Server

Backend server for the AlgoLearn sorting algorithm visualization platform with JWT authentication and sort history tracking.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)

### Installation
```bash
cd server
npm install
```

### Start the Server
```bash
npm start
```

The server will run on `http://localhost:5001`

## 📋 Available Scripts

- `npm start` - Start the production server (test-server.js)
- `npm run dev` - Start with nodemon for development
- `npm run server` - Start the original server.js
- `npm run test-server` - Explicitly start test-server.js
- `npm run prod` - Start in production mode
- `npm run setup` - Install dependencies with success message
- `npm run clean` - Clean install (remove node_modules and reinstall)

## 📚 API Endpoints

### Base URL
```
http://localhost:5001
```

### 🔐 Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout user

### 📊 Sort History Endpoints
- `POST /api/history` - Save sort execution to history
- `GET /api/history` - Get user's sort history (paginated)
- `GET /api/history/stats` - Get user's sorting statistics
- `GET /api/history/:id` - Get specific history entry
- `PUT /api/history/:id` - Update history entry
- `DELETE /api/history/:id` - Delete history entry

### 🧮 Algorithm Endpoints
- `GET /api/algorithms` - Get list of available algorithms
- `POST /api/algorithms/execute` - Execute sorting algorithm (with optional auth)

### 📈 Visualization Endpoints
- `GET /api/visualizations` - Get visualization history
- `POST /api/visualizations` - Save visualization data

## 🔧 Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/algolearn

# JWT Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# CORS
CORS_ORIGIN=http://localhost:5173
```

## 🗄️ Database Models

### User Model
- Profile information (username, email, name)
- Preferences (theme, animation speed, default view)
- Statistics (total visualizations, favorite algorithm, time spent)

### SortHistory Model
- Algorithm used and input array
- Performance metrics (execution time, steps, comparisons, swaps)
- Complexity analysis and metadata
- User settings and completion status

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: 7-day expiration, Bearer token format
- **Input Validation**: Comprehensive data validation
- **CORS Configuration**: Secure cross-origin setup
- **Optional Authentication**: Works with or without login

### Health Check
```http
GET /health
```

### Algorithms

#### Get Available Algorithms
```http
GET /api/algorithms
```

#### Get Algorithm Info
```http
GET /api/algorithms/:algorithmId
```

#### Execute Algorithm
```http
POST /api/algorithms/execute
Content-Type: application/json

{
  "algorithm": "mergeSort",
  "array": [5, 3, 8, 1, 2],
  "userId": "optional_user_id",
  "settings": {
    "viewMode": "tree",
    "speed": 1000
  }
}
```

#### Validate Array
```http
POST /api/algorithms/validate
Content-Type: application/json

{
  "array": [5, 3, 8, 1, 2]
}
```

### Visualizations

#### Get All Visualizations
```http
GET /api/visualizations?page=1&limit=10&algorithm=mergeSort&public=true
```

#### Get Specific Visualization
```http
GET /api/visualizations/:id
```

#### Update Visualization
```http
PUT /api/visualizations/:id
Content-Type: application/json

{
  "isPublic": true,
  "tags": ["example", "demo"],
  "settings": {
    "viewMode": "tree"
  }
}
```

#### Delete Visualization
```http
DELETE /api/visualizations/:id
```

#### Like Visualization
```http
POST /api/visualizations/:id/like
```

#### Get Statistics
```http
GET /api/visualizations/stats/summary
```

#### Get User Visualizations
```http
GET /api/visualizations/user/:userId
```

## 📊 Data Models

### Visualization
```javascript
{
  userId: ObjectId,
  algorithm: String,
  inputArray: [Number],
  steps: [{
    phase: String,
    action: String,
    arrayState: [Number],
    highlights: [Number],
    description: String,
    // ... other step properties
  }],
  metadata: {
    totalSteps: Number,
    splitSteps: Number,
    mergeSteps: Number,
    maxDepth: Number,
    executionTime: Number,
    complexity: {
      time: String,
      space: String
    }
  },
  settings: {
    viewMode: String,
    speed: Number,
    showComparisons: Boolean
  },
  isPublic: Boolean,
  tags: [String],
  likes: Number,
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Environment (development/production)
- `FRONTEND_URL`: Frontend URL for CORS

### Database
The application uses MongoDB with Mongoose ODM. Make sure MongoDB is running locally or provide a cloud connection string.

## 🛠 Development

### Project Structure
```
server/
├── models/           # Database models
├── routes/           # API routes
├── services/         # Business logic
├── middleware/       # Custom middleware
├── config/           # Configuration files
└── server.js         # Main server file
```

### Adding New Algorithms
1. Add algorithm logic to `services/algorithmService.js`
2. Update algorithm info in `getAlgorithmInfo()` method
3. Add new case in `/execute` endpoint

## 🚦 Testing

### Manual Testing
Use tools like Postman or curl to test endpoints:

```bash
# Test algorithm execution
curl -X POST http://localhost:5000/api/algorithms/execute \
  -H "Content-Type: application/json" \
  -d '{"algorithm":"mergeSort","array":[5,3,8,1,2]}'
```

## 🔒 Security Considerations

- Input validation on all endpoints
- Array size limits (max 20 elements)
- CORS configuration
- Rate limiting (future enhancement)
- Authentication (future enhancement)

## 📈 Performance

- Database indexing on frequently queried fields
- Pagination for large result sets
- Efficient step storage and retrieval
- Memory management for large visualizations

## 🐛 Error Handling

The API returns consistent error responses:

```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## 🚀 Deployment

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Configure production MongoDB
- [ ] Set up proper logging
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL certificates
- [ ] Configure monitoring

## 📝 License

MIT License - see LICENSE file for details
