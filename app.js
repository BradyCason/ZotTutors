const express = require("express");
const session = require("express-session");
const passport = require('./passport');

const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");

const app = express();
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/log-in');
}

app.use("/", authRouter);
app.use("/profile", ensureAuthenticated, profileRouter)
app.get("/", ensureAuthenticated, (req, res) => {res.render("index", {user: req.user})})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express app listening on port ${PORT}!`));