const db = require("../db/queries");
const { body, validationResult} = require("express-validator");

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 15 characters.";

const validateUpdate = [
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
      return res.status(400).render("update-profile", {
        errors: [{ msg: 'Email already in use' }],
        user: req.user,
      });
    }
  
    next();
  };

const updatePost = [
    validateUpdate,
    checkEmailExists,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).render("update-profile", {
            errors: errors.array(),
            user: req.user
          });
        }
        const { firstName, lastName, email } = req.body;
        const isTutor = req.body.isTutor ? true : false;
        console.log(isTutor)
        await db.updateUser(req.user.id, firstName, lastName, email, isTutor)
        res.redirect("/");
      }
];

async function profileGet(req, res) {
    res.render("profile", {user: req.user})
}

async function updateGet(req, res) {
    res.render("update-profile", {user: req.user})
}

module.exports = {
    profileGet,
    updateGet,
    updatePost
}