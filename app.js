var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var indexRouter = require("./app/routes/index");
var usersRouter = require("./app/routes/users");
require("dotenv").config();
var connectMongo = require("./app/database/init");

var app = express();
// we need initial db connection RIGHT BEFORE before mounting your routes
// i remember one time, i run into a problem that the connection was call multiple times
connectMongo();

// view engine setup
app.set("views", path.join(__dirname, "app/views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/users", usersRouter);

app.use("/", indexRouter);
app.use("/auth", require("./app/routes/auth"));

// catch 404 and forward to failure handler
app.use(function (req, res, next) {
  next(createError(404));
});

// failure handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
