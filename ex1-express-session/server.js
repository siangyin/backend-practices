require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const app = express();

// Connect to Mongo
mongoose.connect(process.env.MONGO_URI, (err) => {
	if (err) throw err;
	console.log("connected to MongoDB");
});

// Session collection data storing
const store = new MongoDBSession({
	uri: process.env.MONGO_URI,
	collection: "ex1-Sessions",
});

// to access to views dir
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// to access public dir such as css
app.use(express.static("public"));

app.use(
	session({
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: false,
		store: store,
	})
);

//=================== Routes
// Landing Page
app.get("/", (req, res) => {
	// req.session.isAuth = true;
	// console.log(req.session);
	res.render("landing");
});

app.get("/login", (req, res) => {
	res.render("login");
});

app.get("/register", (req, res) => {
	res.render("register");
});

app.get("/dashboard", (req, res) => {
	res.render("dashboard");
});

app.listen(process.env.PORT, () => {
	console.log(`server on http://localhost:${process.env.PORT}`);
});
