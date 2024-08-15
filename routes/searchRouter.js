const { Router } = require("express");

const searchRouter = Router();
const searchController = require("../controllers/searchController")

searchRouter.get("/", searchController.searchGet)
searchRouter.post("/", searchController.searchPost)
searchRouter.get("/class/:classId", searchController.classGet)
searchRouter.get("/tutor/:tutorId", searchController.tutorGet)

module.exports = searchRouter;