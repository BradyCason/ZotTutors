const { Router } = require("express");

const searchRouter = Router();
const searchController = require("../controllers/searchController")

searchRouter.get("/", searchController.searchGet)
searchRouter.get("/classes", searchController.searchGet)
searchRouter.get("/tutors", searchController.searchGet)
searchRouter.post("/classes", searchController.searchClassesPost)
searchRouter.post("/tutors", searchController.searchTutorsPost)
searchRouter.get("/class/:classId", searchController.classGet)
searchRouter.get("/tutor/:tutorId", searchController.tutorGet)

module.exports = searchRouter;