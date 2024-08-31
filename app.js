const express = require("express");
const session = require("express-session");
const path = require('path');
const passport = require('./passport');
const flash = require('connect-flash');

const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const searchRouter = require("./routes/searchRouter");
const paymentRouter = require("./routes/paymentRouter");

const app = express();
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(flash())
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/log-in');
}

app.use("/", authRouter);
app.use("/search", searchRouter);
app.use("/profile", ensureAuthenticated, profileRouter);
app.use("/payment", paymentRouter);
app.get("/", (req, res) => {res.render("index", {user: req.user})})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express app listening on port ${PORT}!`));