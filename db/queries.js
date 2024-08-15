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
  return (await prisma.classes.findMany({
    where: {
      OR: [
        { classCode: { contains: searchTerm, mode: 'insensitive' } },
        { className: { contains: searchTerm, mode: 'insensitive' } }
      ]
    },
    include: {
      _count: {
        select: { tutors: true }  // Count of related TutorClass entries
      }
    }
  }))
}

async function getClass(id){
  return (await prisma.classes.findUnique({
    where: {
      id: id
    }
  }))
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

async function getTutorClasses(userId){
  return await prisma.classes.findMany({
    where: {
      tutors: {
        some: {
          tutorId: userId
        }
      }
    },
    include: {
      tutors: {
        where: {
          tutorId: userId
        }
      }
    }
  });
}

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

async function addClass(classCode, className, classDesc){
  try{
    await prisma.classes.create({ data: { 
      classCode: classCode,
      classDesc: classDesc,
      className: className
     }})
  }
  catch{
    console.log(classCode)
  }
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
    makeTutor,
    removeTutor,
    removeTutorClasses,
    addTutorClass,
    addClass
};