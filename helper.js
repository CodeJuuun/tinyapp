const getUserByEmail = (email, database) => {
  for (let userId in database) {
    if (database[userId].email === email) {
      //returns the whole user object back
      return database[userId];
    }
  }
  return null; // no else required to write, shorthand
};


module.exports = { getUserByEmail };