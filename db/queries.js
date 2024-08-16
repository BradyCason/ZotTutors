const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient()

async function addUser(firstName, lastName, email, hashedPassword, isTutor) {
    user = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        isTutor: isTutor
    }

    await prisma.users.create({ data: user })
}

async function updateUser(userId, { firstName, lastName, email, isTutor, bio, availability, isOnline, isInPerson }) {
  try {
    const updateData = {};
    
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (isTutor !== undefined) updateData.isTutor = isTutor;
    if (bio !== undefined) updateData.bio = bio;
    if (availability !== undefined) updateData.availability = availability;
    if (isOnline !== undefined) updateData.isOnline = isOnline;
    if (isInPerson !== undefined) updateData.isInPerson = isInPerson;

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
    });

    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
  }
}

async function findUserByEmail(email){
    const user = await prisma.users.findUnique({
        where: {
          email: email,
        },
      });
      return user;
}

async function findUserById(id){
    const user = await prisma.users.findUnique({
        where: {
          id: id,
        },
      });
      return user;
}

async function getNumUsers(){
  return (await prisma.users.count());
}

async function getClasses(searchTerm){
  const searchTermLower = searchTerm.toLowerCase()
  const response = await fetch('https://api.peterportal.org/rest/v0/courses/all');
  const data = await response.json();
  const tutorClasses = await getAllTutorClasses()
  const classes = await Promise.all(
    data
    .filter(i => {
      const idLower = i.id.toLowerCase();
      const classCodeLower = (i.department + " " + i.number).toLowerCase();
      const titleLower = i.title.toLowerCase();

      return (idLower.includes(searchTermLower) ||
            classCodeLower.includes(searchTermLower) ||
            titleLower.includes(searchTermLower));
    })
    .map(async i => {
      return { 
          id: i.id,
          classCode: i.department + " " + i.number,
          classDesc: i.description,
          className: i.title,
          numTutors: tutorClasses.reduce((acc, obj) => {
            return obj.classId === i.id ? acc + 1 : acc;
          }, 0)
      }
    }))
  return(classes)
}

async function getClass(id){
  const response = await fetch('https://api.peterportal.org/rest/v0/courses/' + id);
  const data = await response.json();
  return { 
    id: data.id,
    classCode: data.department + " " + data.number,
    classDesc: data.description,
    className: data.title,
    numTutors: await getTutors(data.id)
}
}

async function getAllTutorClasses(){
  return (await prisma.tutorclasses.findMany({
    include: {
      tutor: true  // Include related User information
    }
  })
)}

async function getTutorClasses(userId){
  const tutorClasses = await prisma.tutorclasses.findMany({
    where: {
      tutorId: userId
    },
    select: {
      classId: true
    }
  });

  const classDetailsPromises = tutorClasses.map(async (tutorClass) => {
    return await getClass(tutorClass.classId);
  });

  return(await Promise.all(classDetailsPromises))
}

async function getTutors(classId){
  return (await prisma.tutorclasses.findMany({
    where: {
      classId: classId
    },
    include: {
      tutor: true  // Include related User information
    }
  })
)};

async function getTutor(tutorId){
  return (await prisma.users.findUnique({
    where: {
      id: tutorId
    }
  })
)};

async function makeTutor(userId){
  await prisma.users.update({
    where: { id: userId },
    data: {isTutor: true},
  });
}

async function removeTutor(userId){
  await prisma.users.update({
    where: { id: userId },
    data: {isTutor: false},
  });
}

async function removeTutorClasses(tutorId){
  await prisma.tutorclasses.deleteMany({
    where: {
      tutorId: tutorId,  // Replace userID with the actual ID you want to delete
    },
  });
}

async function addTutorClass(tutorId, classId){
  await prisma.tutorclasses.create({ data: {
    tutorId: tutorId,
    classId: classId
  }})
}

module.exports = {
    addUser,
    updateUser,
    findUserByEmail,
    findUserById,
    getNumUsers,
    getClasses,
    getClass,
    getTutors,
    getTutor,
    getTutorClasses,
    getAllTutorClasses,
    makeTutor,
    removeTutor,
    removeTutorClasses,
    addTutorClass
};