# Expense Tracker Application 💰

A secure, full-stack expense tracking application built with React, Node.js, Express, and MongoDB.

## Features

✅ **User Authentication**
- Secure registration and login with bcrypt password hashing
- JWT token-based authentication
- Session management

✅ **Expense Management**
- Add, edit, and delete expenses
- Track expenses with amount, category, date, and notes
- Filter expenses by date range and category
- View expense list with sorting options

✅ **Category Management**
- Pre-defined categories (Food, Transportation, Entertainment, Healthcare, Shopping, Bills, Other)
- Add custom categories
- Delete categories
- Category-based expense filtering

✅ **Reports & Analytics**
- Daily expense reports with line charts
- Monthly expense reports with bar charts
- Yearly expense reports with visualizations
- Category breakdown with pie charts
- Total spending analysis

✅ **Security**
- AES encryption for sensitive data (expense notes)
- Secure password hashing with bcrypt (10 salt rounds)
- JWT token authentication
- HTTPS ready for production deployment
- MongoDB user isolation (each user can only see their own expenses)

## Tech Stack

### Frontend
- **React 19** - UI library
- **React Router v6** - Client-side routing
- **Bootstrap 5** - UI framework
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **React-ChartJS-2** - React wrapper for Chart.js
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Bcrypt** - Password hashing
- **JWT** - Authentication tokens
- **CryptoJS** - AES encryption/decryption
- **CORS** - Cross-origin support
- **dotenv** - Environment configuration

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (`.env` file):
```
MONGO_URI=mongodb://localhost:27017
DBNAME=expense_tracker
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
ENCRYPTION_KEY=your_encryption_key_change_this_in_production
PORT=8081
```

4. Start the server:
```bash
npm run dev
```
The API will be running on `http://localhost:8081`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```
The app will be running on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /signup` - Register new user
- `POST /login` - Login user
- `GET /user` - Get current user info (requires auth)

### Categories
- `GET /categories` - Get all user categories (requires auth)
- `POST /categories` - Add new category (requires auth)
- `DELETE /categories/:categoryName` - Delete category (requires auth)

### Expenses
- `GET /expenses` - Get all expenses with optional filters (requires auth)
- `GET /expenses/:id` - Get single expense (requires auth)
- `POST /expenses` - Create new expense (requires auth)
- `PUT /expenses/:id` - Update expense (requires auth)
- `DELETE /expenses/:id` - Delete expense (requires auth)

### Reports
- `GET /reports/summary` - Get expense summary by category (requires auth)
- `GET /reports/daily` - Get daily expenses (requires auth)
- `GET /reports/monthly?year=YYYY` - Get monthly expenses (requires auth)
- `GET /reports/yearly` - Get yearly expenses (requires auth)

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  createdAt: Date,
  categories: [String]
}
```

### Expenses Collection
```javascript
{
  _id: ObjectId,
  userId: String (references user._id),
  amount: Number,
  category: String,
  date: Date,
  notes: String (encrypted),
  createdAt: Date
}
```

## Security Features

1. **Password Security**
   - Passwords are hashed using bcrypt with 10 salt rounds
   - Never stored in plain text
   - Compared securely during login

2. **Data Encryption**
   - Expense notes are encrypted using AES encryption
   - Encryption key stored in environment variables
   - Decryption on retrieval from database

3. **Authentication**
   - JWT tokens used for session management
   - Tokens expire after 480 minutes (8 hours)
   - Bearer token format: `Authorization: Bearer <token>`

4. **Data Privacy**
   - Each user can only access their own data
   - User ID is verified from JWT token on all protected routes
   - MongoDB queries filtered by userId

5. **CORS Security**
   - CORS enabled for client-server communication
   - Ready for HTTPS deployment

## Usage

1. **Register**: Create a new account with email and password
2. **Login**: Access your account with credentials
3. **Add Expenses**: Navigate to "Expenses" tab, click "Add New Expense"
4. **Manage Categories**: Add custom expense categories
5. **View Reports**: Check "Reports" for various spending analytics
6. **Edit/Delete**: Modify or remove expenses as needed

## Environment Variables

```
MONGO_URI          - MongoDB connection string
DBNAME             - Database name
JWT_SECRET         - Secret key for JWT signing (change in production!)
ENCRYPTION_KEY     - Key for AES encryption (change in production!)
PORT               - Server port (default: 8081)
```

## Production Deployment

1. **Update Environment Variables**: Change all secret keys in production
2. **Enable HTTPS**: Use SSL/TLS certificates
3. **Database**: Use MongoDB Atlas or managed MongoDB service
4. **Frontend**: Build and deploy to hosting service
5. **Backend**: Deploy to Node.js hosting (Heroku, AWS, DigitalOcean, etc.)

## Common Issues & Solutions

### MongoDB Connection Error
- Ensure MongoDB is running locally or connection string is correct
- Check MONGO_URI in .env file

### CORS Errors
- Frontend and backend must be accessible from each other
- Check CORS configuration in backend/index.js

### Token Expired
- Tokens expire after 480 minutes
- User needs to login again to get new token

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Budget alerts and notifications
- [ ] Recurring expense templates
- [ ] Receipt image uploads
- [ ] Export reports to PDF
- [ ] Mobile app version
- [ ] Multi-currency support
- [ ] Expense sharing with others

## License

This project is provided as-is for educational purposes.

## Support

For issues or questions, please refer to the documentation or contact support.

---

**Stay financially secure! 🔒💰**
