const getUserByEmail = (email, database) => {
  for (let userId in database) {
    if (database[userId].email === email) {
      //returns the whole user object back
      return database[userId];
    }
  }
  return; // no else required to write, shorthand
};

// function to filter URLS that belong to specific users
const urlsForUser = (id, urlDatabase) => {
  const userUrls = {}; // will be used to store filtered URLS

  // make sure urlDatabase is not empty
  if (!urlDatabase) {
    return userUrls;
  }

  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === id) { // checks if URL belongs to current user, if so, add to filtered URLS
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls; // returns only the URL that belong to current logged in user.
};


module.exports = { getUserByEmail, urlsForUser };