/* 
The "api" directory and this file is used for future deploy on Vercel...

Follow this link for moreeeeeeeeeeee infomationn:
https://vercel.com/guides/using-express-with-vercel

*/

const connectMongo = require('../app/database/init');
const app = require('../app');

module.exports = async (req, res) => {
   // The two following routes are useful for api server or database connection test
   // It does not affect the functionality of the application

   // API health check
   if (req.url === '/ping') {
      return res.status(200).send('pong from vercel');
   }

   // Mongo connection check
   if (req.url === '/dbtest') {
      try {
         await connectMongo();
         return res.status(200).send('Mongo connected');
      } catch (err) {
         return res
            .status(500)
            .send(`Mongo connection failure: ${err.message}`);
      }
   }

   // Main API
   try {
      await connectMongo();
      console.log('MongoDB successfully connected');
      return app(req, res);
   } catch (err) {
      console.error('Error in API handler:', err);
      res.status(500).json({ error: err.message });
   }
};
