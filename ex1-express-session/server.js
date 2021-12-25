const express = require("express");
const session = require("express-session");
const app = express();

const SECRET = "heylapooyeah";
const PORT = 3000;

app.use(
	session({
		secret: SECRET,
		resave: false,
		saveUninitialized: false,
	})
);

app.get("/", (req, res) => {
	console.log(req.session);
	res.send("hello");
});

app.listen(PORT, () => {
	console.log(`server on http://localhost:${PORT}`);
});
