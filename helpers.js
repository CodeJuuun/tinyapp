const getUserByEmail = (email, database) => {
  for (let userId in database) {
    if (database[userId].email === email) {
      //returns the whole user object back
      return database[userId];
    }
  }
  return; // no else required to write, shorthand
};

//---------------------------------------------------------
// function to filter URLS that belong to specific users
const urlsForUser = (id, urlDatabase) => {
  const userUrls = {};

  // make sure urlDatabase is not empty
  if (!urlDatabase) {
    return userUrls;
  }

  // checks if URL belongs to current user, if so, add to filtered URLS
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

//---------------------------------------------------------
// Helper function to generate a random 6 character string for a short URL
const generateRandomString = () => {
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charLength = char.length;
  let result = "";

  for (let i = 0; i < 6; i++) {
    result += char.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};

module.exports = { getUserByEmail, urlsForUser, generateRandomString };