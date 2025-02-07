const getUserByEmail = (email) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      //returns the whole user object back
      return users[userId];
    }
  }
  return null; // no else required to write, shorthand
};


module.exports = { getUserByEmail };