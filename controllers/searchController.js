const db = require("../db/queries");

async function searchGet(req, res) {
    res.render("search-classes", {classes: await db.getClasses()})
}

async function classGet(req, res) {
    res.render("class", {
        classItem: await db.getClass(Number(req.params.classId)),
        tutors: await db.getTutors(Number(req.params.classId))
    })
}

async function tutorGet(req, res) {
    res.render("tutor", {tutor: await db.getTutor(Number(req.params.tutorId))})
}

module.exports = {
    searchGet,
    classGet,
    tutorGet
}