const connectMongo = require('./Mongo.database');

async function initDatabase() {
   await connectMongo();
}

module.exports = initDatabase;
