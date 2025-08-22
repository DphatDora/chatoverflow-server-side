const mongoose = require('mongoose');

const dbConf = require('../config/db.conf');

async function connectMongo() {
   try {
      await mongoose.connect(dbConf.uri, dbConf.options);
      console.log('MongoDB successfully connected');
      console.log(
         'Databse name: ',
         mongoose.connection.db.databaseName
      );
   } catch (err) {
      console.error('MongoDB connection failure:', err.message);
      process.exit(1);
   }
}

module.exports = connectMongo;
