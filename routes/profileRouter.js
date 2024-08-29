const { Router } = require("express");

const profileRouter = Router();
const profileController = require("../controllers/profileController")

function ensureNotTutor(req, res, next) {
    if (!req.user.isTutor) {
        return next();
    }
    res.redirect('/profile');
}

function ensureTutor(req, res, next) {
    if (req.user.isTutor) {
        return next();
    }
    res.redirect('/profile');
}

profileRouter.get("/", profileController.profileGet)
profileRouter.post("/search-classes", profileController.updateClassesSearchPost)
profileRouter.get("/update-profile", profileController.updateProfileGet)
profileRouter.get("/update-classes", ensureTutor, profileController.updateClassesGet)
profileRouter.post("/update-profile", profileController.updateProfilePost, (req, res) => {res.redirect("/profile")})
profileRouter.post("/update-classes", profileController.updateClassesPost, (req, res) => {res.redirect("/profile")})
profileRouter.post("/tutor", profileController.tutorPost)
profileRouter.get("/tutor-sign-up", ensureNotTutor, profileController.tutorSignUpGet)
profileRouter.post("/tutor-sign-up", profileController.tutorSignUpPost)
profileRouter.post("/tutor-remove", profileController.tutorRemovePost)
profileRouter.post("/add-class/:classId", profileController.addClassPost)
profileRouter.post("/remove-class/:classId", profileController.removeClassPost)

module.exports = profileRouter;