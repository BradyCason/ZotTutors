const db = require("../db/queries");
const { body, validationResult} = require("express-validator");

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 15 characters.";

const validateProfileUpdate = [
    body('firstName').trim()
        .isAlpha().withMessage(`First name ${alphaErr}`)
        .isLength({ min: 1, max: 15 }).withMessage(`First name ${lengthErr}`),
    body("lastName").trim()
        .isAlpha().withMessage(`Last name ${alphaErr}`)
        .isLength({ min: 1, max: 15 }).withMessage(`Last name ${lengthErr}`),
    body("email").trim()
        .isEmail().withMessage(`Email must be a valid email.`)
];

const checkEmailExists = async (req, res, next) => {
    const { email } = req.body;
    const user = await db.findUserByEmail(email);
  
    if (user && user.id !== req.user.id) {
      updateGet(req, res, {errors: [{ msg: 'Email already in use' }]})
      // return res.status(400).render("update-profile", {
      //   errors: [{ msg: 'Email already in use' }],
      //   user: req.user,
      //   classes: await db.getClasses(""),
      //   classIdsTaught: classIds,
      //   searched: false
      // });
    }
  
    next();
  };

const updatePost = [
    validateProfileUpdate,
    checkEmailExists,
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return updateGet(req, res, {errors: errors.array()})
        }

        if (req.user.isTutor){
          const { firstName, lastName, email, bio, availability } = req.body;
          const isOnline = req.body.isOnline ? true : false;
          const isInPerson = req.body.isInPerson ? true : false;
          await db.updateUser(req.user.id, {
            firstName: firstName,
            lastName: lastName,
            email: email,
            bio: bio,
            availability: availability,
            isOnline, isOnline,
            isInPerson, isInPerson
          })
        }
        else{
          const { firstName, lastName, email } = req.body;
          await db.updateUser(req.user.id, {firstName: firstName, lastName: lastName, email: email})
        }
        next()
      }
];

async function updateClassesPost(req, res, next) {
  await db.removeTutorClasses(req.user.id)
  for (const key in req.body) {
    if (req.body.hasOwnProperty(key) && key.startsWith('class')) {
      await db.addTutorClass(req.user.id, key.slice(5, key.length))
    }
  }
  next()
}

async function profileGet(req, res) {
    res.render("profile", {
      user: req.user,
      classesTaught: await db.getTutorClasses(req.user.id)
    })
}

async function updateGet(req, res, {errors}) {
    const classesTaught = await db.getTutorClasses(req.user.id);
    const classIds = classesTaught.map(classItem => classItem.id);
    if (errors){
      res.render("update-profile", {
        errors: errors,
        user: req.user,
        classes: await db.getClasses(""),
        classIdsTaught: classIds,
        searched: false
      })
    }
    else{
      res.render("update-profile", {
        user: req.user,
        classes: await db.getClasses(""),
        classIdsTaught: classIds,
        searched: false
      })
    }
}

async function tutorPost(req, res){
    await db.updateTutor(req.body.bio, req.body.availability, req.body.isOnline, req.body.isInPerson)
}

async function tutorSignUpGet(req, res) {
  res.render("tutor-sign-up", {
    user: req.user
  })
}

async function tutorSignUpPost(req, res){
    await db.makeTutor(req.user.id)
    res.redirect("/")
}

async function tutorRemovePost(req, res){
    await db.removeTutor(req.user.id)
    res.redirect("/")
}

async function updateClassesSearchPost(req, res){
  const classesTaught = await db.getTutorClasses(req.user.id);
  const classIds = classesTaught.map(classItem => classItem.id);
  res.render("update-profile", {
    user: req.user,
    classes: await db.getClasses(req.body.searchTerm),
    classIdsTaught: classIds,
    searched: true
  })
}

module.exports = {
    profileGet,
    updateGet,
    updatePost,
    updateClassesPost,
    tutorPost,
    tutorSignUpGet,
    tutorSignUpPost,
    tutorRemovePost,
    updateClassesSearchPost
}