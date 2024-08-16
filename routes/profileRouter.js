const { Router } = require("express");

const profileRouter = Router();
const profileController = require("../controllers/profileController")

function ensureNotTutor(req, res, next) {
    if (!req.user.isTutor) {
        return next();
    }
    res.redirect('/profile');
}

profileRouter.get("/", profileController.profileGet)
profileRouter.post("/search-classes", profileController.updateClassesSearchPost)
profileRouter.get("/update", profileController.updateGet)
profileRouter.post("/update", profileController.updatePost, (req, res) => {res.redirect("/profile")})
profileRouter.post("/update-classes", profileController.updateClassesPost, (req, res) => {res.redirect("/profile")})
profileRouter.post("/tutor", profileController.tutorPost)
profileRouter.get("/tutor-sign-up", ensureNotTutor, profileController.tutorSignUpGet)
profileRouter.post("/tutor-sign-up", profileController.tutorSignUpPost)
profileRouter.post("/tutor-remove", profileController.tutorRemovePost)

module.exports = profileRouter;