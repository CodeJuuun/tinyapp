const getUserByEmail = (email, database) => {
  for (let userId in database) {
    if (database[userId].email === email) {
      //returns the whole user object back
      return database[userId];
    }
  }
  return; // no else required to write, shorthand
};



// currently unused functions

// // checks if user is logged in
// const loggedInUser = (req, res) => {
//   if (!req.user) {
//     return res.status(403).send("You must be logged in first")
//   }
// };

// // checks if URL exists
// const checkURL = (shortURL, res) => {
//   if (!urlDatabase[shortURL]) {
//     return res.status(404).send("URL not found");
//   }
// };

// // function to check if URL belongs to logged in user

// const checkURLOwner = (shortURL, req, res) => {
//   if (urlDatabase[shortURL].userId !== req.user.id) {
//     return res.status(403).send("You're not authorized to edit this URL")
//   }
// }

module.exports = { getUserByEmail };