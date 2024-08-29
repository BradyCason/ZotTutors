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

async function updateUser(userId, { firstName, lastName, email, rate, isTutor, bio, availability, isOnline, isInPerson }) {
  try {
    const updateData = {};
    
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (rate !== undefined) updateData.rate = rate;
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

async function getClasses(searchTerm, department = "All"){
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

      searchCondition = (idLower.includes(searchTermLower) ||
        classCodeLower.includes(searchTermLower) ||
        titleLower.includes(searchTermLower))
      depCondition = (department == "All" || i.department == department)

      return (searchCondition && depCondition);
    })
    .map(async i => {
      return { 
          id: i.id,
          classCode: i.department + " " + i.number,
          classDesc: i.description,
          className: i.title,
          numTutors: tutorClasses.reduce((acc, obj) => {
            return obj.classId === i.id ? acc + 1 : acc;
          }, 0),
          department: i.department,
          departmentName: i.department_name,
          courseNumber: parseInt(i.number, 10)
      }
    }))
    
    classes.sort((a, b) => {
      const departmentComparison = a.department.localeCompare(b.department);
      if (departmentComparison !== 0) {
        return departmentComparison;
      }
      return a.courseNumber - b.courseNumber;
    });
  
    return classes;
}

async function getClass(id){
  const response = await fetch('https://api.peterportal.org/rest/v0/courses/' + id);
  const data = await response.json();
  const tutorClasses = await getAllTutorClasses()
  return { 
    id: data.id,
    classCode: data.department + " " + data.number,
    classDesc: data.description,
    className: data.title,
    numTutors: await getTutors(data.id),
    numTutors: tutorClasses.reduce((acc, obj) => {
      return obj.classId === data.id ? acc + 1 : acc;
    }, 0),
  }
}

async function getDepartments(){
  const classes = await getClasses("");
  const departmentMap = new Map();

  // Iterate over the classes and add each unique department to the Map
  classes.forEach(classItem => {
    if (classItem.department && !departmentMap.has(classItem.department)) {
      departmentMap.set(classItem.department, classItem.departmentName);
    }
  });

  // Convert the Map to an array of objects
  return Array.from(departmentMap, ([department, departmentName]) => ({ department, departmentName }));
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
  tutors = await prisma.tutorclasses.findMany({
    where: {
      classId: classId
    },
    include: {
      tutor: true  // Include related User information
    }
  })
  return (tutors.map(tutor => tutor.tutor))
};

async function getTutor(tutorId){
  return (await prisma.users.findUnique({
    where: {
      id: tutorId
    }
  })
)};

async function searchTutors(firstName = "", lastName = "") {
  firstName = firstName.toLowerCase();
  lastName = lastName.toLowerCase();

  let queryConditions = {
    isTutor: true
  };

  if (firstName !== "") {
    queryConditions.firstName = {
      contains: firstName,
      mode: 'insensitive',
    };
  }

  if (lastName !== "") {
    queryConditions.lastName = {
      contains: lastName,
      mode: 'insensitive',
    };
  }

  return await prisma.users.findMany({
    where: queryConditions
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
      tutorId: tutorId,
    },
  });
}

async function removeTutorClass(tutorId, classId){
  await prisma.tutorclasses.deleteMany({
    where: {
      AND : {
        tutorId: tutorId,
        classId: classId
      }
    },
  });
}

async function addTutorClass(tutorId, classId){
  const tutorClasses = await getTutorClasses(tutorId)
  if (!tutorClasses.includes(classId)){
    await prisma.tutorclasses.create({ data: {
      tutorId: tutorId,
      classId: classId
    }})
  }
}

async function isTutorClass(tutorId, classId) {
  const tutorClass = await prisma.tutorclasses.findUnique({
    where: {
      tutorId_classId: {
        tutorId: tutorId,
        classId: classId,
      },
    },
  });

  return tutorClass !== null;
}

module.exports = {
    addUser,
    updateUser,
    findUserByEmail,
    findUserById,
    getNumUsers,
    getClasses,
    getClass,
    getDepartments,
    getTutors,
    searchTutors,
    getTutor,
    getTutorClasses,
    getAllTutorClasses,
    makeTutor,
    removeTutor,
    removeTutorClasses,
    removeTutorClass,
    addTutorClass,
    isTutorClass
};