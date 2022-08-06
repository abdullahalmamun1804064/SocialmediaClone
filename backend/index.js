const express = require("express");
const app = express();

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const session = require("express-session");
const passport = require('passport');
const cookieParser=require('cookie-parser')

const userRouter = require('./routes/users');
const userAuth = require('./routes/auth');
const usePosts = require('./routes/posts');
const errorMiddleware = require("./middleware/errors");


dotenv.config({ path: "backend/.env" });


//handel uncaught excptions
process.on('uncaughtException', err => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down due to uncaught expection');
  process.exit(1);
})
 


mongoose.connect(process.env.DB_LOCAL_URI, { useNewUrlParser: true }, () => {
    console.log(
      `Server started on PORT : ${process.env.PORT} on ${process.env.NODE_ENV} mode`,
    );

});

//middleware
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(morgan("comma"));

// Authentication configuration
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'bla bla bla' 
}));


app.use(passport.initialize());
app.use(passport.session());


// all router
app.use("/api/user", userRouter);
app.use("/api/auth", userAuth);
app.use("/api/posts", usePosts);

//Middleware to handel error
app.use(errorMiddleware);



app.listen(8800, () => {
  console.log("Backend server is Running !!!");
});
