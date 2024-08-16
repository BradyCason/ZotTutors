const db = require("../db/queries");

async function searchGet(req, res) {
    res.render("search-classes", {
        classes: await db.getClasses(""),
        searched: false
    })
}

async function searchPost(req, res) {
    const searchTerm = req.body.searchTerm
    res.render("search-classes", {
        classes: await db.getClasses(searchTerm),
        searched: true
    })
}

async function classGet(req, res) {
    res.render("class", {
        classItem: await db.getClass(req.params.classId),
        tutors: await db.getTutors(req.params.classId)
    })
}

async function tutorGet(req, res) {
    res.render("tutor", {
        tutor: await db.getTutor(Number(req.params.tutorId)),
        classesTaught: await db.getTutorClasses(Number(req.params.tutorId))
    })
}

module.exports = {
    searchGet,
    searchPost,
    classGet,
    tutorGet
}