const { Router } = require("express");

const profileRouter = Router();
const profileController = require("../controllers/profileController")

profileRouter.get("/", profileController.profileGet)
profileRouter.get("/update", profileController.updateGet)
profileRouter.post("/update", profileController.updatePost)

module.exports = profileRouter;