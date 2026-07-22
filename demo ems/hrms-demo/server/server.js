import 'dotenv/config';
import app from './app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀  Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📡  API base: http://localhost:${PORT}/api`);
  });
};

start();
