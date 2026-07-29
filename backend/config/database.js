const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

    // Log which URI is being used (mask password for security)
    if (uri) {
      const masked = uri.replace(/:([^@]+)@/, ':****@');
      console.log(`🔗 Connecting to MongoDB: ${masked}`);
    } else {
      console.error('❌ No MongoDB URI found in environment variables!');
      console.error('   Set MONGODB_URI on your Render dashboard.');
    }

    if (!uri) {
      throw new Error('MONGODB_URI (or MONGO_URI) is not defined in environment variables');
    }

    await mongoose.connect(uri);

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
