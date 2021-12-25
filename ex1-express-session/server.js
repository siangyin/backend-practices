require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const app = express();
const UserModel = require("./models/User");

const bcrypt = require("bcryptjs");
const salt = 12;

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
// converting form-data to JSON, allow post/put req to pass data to server
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

// middleware isAuth
const isAuth = (req, res, next) => {
	if (req.session.isAuth) {
		next();
	} else {
		req.session.error = "Please login to access";
		res.redirect("/login");
	}
};

//=================== Routes
// Landing Page
app.get("/", (req, res) => {
	res.render("landing");
});

// Login Page
app.get("/login", (req, res) => {
	const error = req.session.error;
	delete req.session.error;
	res.render("login");
});

app.post("/login", async (req, res) => {
	const { email, password } = req.body;
	let user = await UserModel.findOne({ email });

	if (!user) {
		req.session.error = "Invalid Credentials";
		return res.redirect("/login");
	}

	const isMatch = await bcrypt.compare(password, user.password);

	if (!isMatch) {
		req.session.error = "Invalid Credentials";
		return res.redirect("/login", { err: error });
	}

	req.session.isAuth = true;
	req.session.username = user.username;
	res.redirect("/dashboard");
});

// Register Page
app.get("/register", (req, res) => {
	const error = req.session.error;
	delete req.session.error;
	res.render("register", { err: error });
});

app.post("/register", async (req, res) => {
	const { username, email, password } = req.body;
	let user = await UserModel.findOne({ email });

	if (user) {
		return res.redirect("/register");
	}

	const hashedPassword = await bcrypt.hash(password, 12);
	user = new UserModel({ username, email, password: hashedPassword });
	await user.save();
	res.redirect("/login");
});

// Dashboard Page
app.get("/dashboard", isAuth, (req, res) => {
	const username = req.session.username;
	res.render("dashboard", { name: username });
});

// Logout
app.post("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) throw err;
		res.redirect("/");
	});
});

app.listen(process.env.PORT, () => {
	console.log(`server on http://localhost:${process.env.PORT}`);
});
