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

async function updateUser(userId, firstName, lastName, email, isTutor) {
  try {
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        isTutor: isTutor
      }
    });
    console.log('User updated:', updatedUser);
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

module.exports = {
    addUser,
    updateUser,
    findUserByEmail,
    findUserById,
    getNumUsers
};