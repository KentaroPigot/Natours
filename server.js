
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION ! Shutting down...');
  console.log(err.name, err.message);

  process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((connectionObject) => {
    console.log('DB CONNECTION SUCCESS');
  });


const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLER REJECTION ! Shutting down...');
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
