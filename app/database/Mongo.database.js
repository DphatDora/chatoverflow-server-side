// Note: In production, the timing is strick so if we try to access mongoose.connection.db.databaseName before it's connected,
// it will cause the app to crash

const mongoose = require('mongoose');

const dbConf = require('../config/db.conf');

async function connectMongo() {
   try {
      const connection = await mongoose.connect(dbConf.uri, dbConf.options);
      console.log('MongoDB successfully connected');
      // console.log('Databse name: ', mongoose.connection.db.databaseName);

      // instead of call the database name by mongoose which potentially failure if connect haven't established
      // we can call it by an established connection
      // console.log('Databse name: ', connection.connection.db.databaseName);
   } catch (err) {
      console.error('MongoDB connection failure:', err.message);
      process.exit(1);
   }
}

module.exports = connectMongo;

// But who the hell write the previous dirty code ?
// Aha, it's me...
