const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();
app.use(cors({ origin: ['http://localhost:3000', "https://frms-frontend-mu.vercel.app" ],credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/fishermen', require('./routes/fishermanRoutes'));
app.use('/api/vessels',   require('./routes/vesselRoutes'));
app.use('/api/licenses',  require('./routes/licenseRoutes'));
app.use('/api/catches',   require('./routes/catchRoutes'));
app.use('/api/stocks', require('./routes/stockRoutes'));
app.use('/api/reports',   require('./routes/reportRoutes'));

app.get('/', (req, res) => res.send('FRMS API Running ✅'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));