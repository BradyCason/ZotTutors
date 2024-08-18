const db = require("../db/queries");

async function searchGet(req, res) {
    res.render("search", {
        classes: [],
        tutors: [],
        searched: false,
        user: req.user
    })
}

async function searchClassesPost(req, res) {
    const searchTerm = req.body.searchTerm
    res.render("search", {
        classes: await db.getClasses(searchTerm),
        tutors: [],
        searched: true,
        user: req.user
    })
}

async function searchTutorsPost(req, res) {
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    res.render("search", {
        classes: [],
        tutors: await db.searchTutors(firstName, lastName),
        searched: true,
        user: req.user
    })
}

async function classGet(req, res) {
    res.render("class", {
        classItem: await db.getClass(req.params.classId),
        tutors: await db.getTutors(req.params.classId),
        user: req.user
    })
}

async function tutorGet(req, res) {
    res.render("tutor", {
        tutor: await db.getTutor(Number(req.params.tutorId)),
        classes: await db.getTutorClasses(Number(req.params.tutorId))
    })
}

module.exports = {
    searchGet,
    searchClassesPost,
    searchTutorsPost,
    classGet,
    tutorGet
}