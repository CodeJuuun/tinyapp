const express = require("express");
const app     = express();
const cookieParser = require("cookie-parser");
const morgan  = require('morgan');
const PORT    = 8080; //default port 8080

app.set("view engine", "ejs");

//---------------------------------------------------------
//middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//this code needs to be before ALL routes so it can parse any incoming data into something readable

// helper function
const setUser = (req, res, next) => {
  req.user = users[req.cookies["user_id"]] || null;
  next();
};

app.use(setUser);
//---------------------------------------------------------
//short url generator
const generateRandomString = () => {
  const char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomStr = "";

  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * char.length);
    randomStr += char[index];
  }
  return randomStr;
};

//helper function to generate userID
const generateRandomId = () => {
  return Math.random().toString(36).slice(2, 8);
};

// helper function to search user by email
const getUserByEmail = (email) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      //returns the whole user object back
      return users[userId];
    }
  }
  return null; // no else required to write, shorthand
};
//---------------------------------------------------------
// key is short URL, value is long URL
const urlDatabase = {
  b2xVn2  : "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// userObj

const users = {
  user1: {
    id: "userID",
    email: "[email protected]",
    password: "password098",
  },
  user2: {
    id: "user2ID",
    email: "[email protected]",
    password: "password123",
  },
};

//---------------------------------------------------------
// Route to home page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// returns the urlDatabase in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Route to render page showing all URLS
app.get("/urls", (req, res) => {
  // need to send variables via inside object
  const templateVars = {
    urls: urlDatabase,
    user: req.user
  };
  //  pass in name of template, object
  res.render("urls_index", templateVars);
});

// Route to handle form submission, creates short URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL; // extract URL from body of req
  urlDatabase[shortURL] = longURL;// assign longURL the id from shortURL generated from function

  console.log(`New URL added: ${longURL} as ${shortURL}`); // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
});
//---------------------------------------------------------
app.get("/hello", (req, res) => {
  // console.log("GET /hello route was accessed");
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//---------------------------------------------------------
// Route to render form page for creatting new URL
app.get("/urls/new", (req, res) => {
  res.render("urls_new", {
    user: req.user
  });
});

//---------------------------------------------------------
// Route to display the short URL along with the original long URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  // const user = users[req.cookies["user_id"]] || null;

  if (longURL) { //if url exists, create templateVars and render the template
    const templateVars = {
      id: req.params.id,
      longURL: longURL,
      user: req.user
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("URL not found");
  }
});

//---------------------------------------------------------
app.post("/urls/:id", (req, res) => {
  const shortURL        = req.params.id; // capture shortURL from URL parameter
  const updatedLongURL  = req.body.longURL;

  // validation check
  if (!updatedLongURL) {
    return res.status(400).send("URL cannot be empty");
  }

  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Short URL not found");
  }
  urlDatabase[shortURL] = updatedLongURL;
  console.log(`Updated URL: ${shortURL} to ${updatedLongURL}`);
  res.redirect("/urls");
  
});
//---------------------------------------------------------
// Handles redirection to longURL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("short URL not found");
  }
});

// Route to handle deleting URL, and redirects back to url page
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;

  if (!urlDatabase[shortURL]) {
    return res.status(404).send("URL not found");
  }

  delete urlDatabase[shortURL];
  return res.redirect("/urls");
});

//---------------------------------------------------------
// Route to render registration form
app.get("/register", (req, res) => {
  if (req.user) {
    return res.redirect("/urls");
  }
  res.render("register", { user: req.user });
});
//-----------------------------
// Route to handle registration form page
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  // use helper function (reuseable code) to DRY
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    return res.status(400).send("Email you used is already registered");
  }
  // generate userID
  const userID = generateRandomId();
  //create new user obj
  const newUser = {
    id: userID,
    email: email,
    password: password
  };

  //add new user to the global user object
  users[userID] = newUser;

  res.cookie("user_id", userID);
  console.log("user data after registration:", users);
  res.redirect("urls");
});

//---------------------------------------------------------
// route to login page
app.get("/login", (req, res) => {
  if (req.user) {
    return res.redirect("/urls");
  }
  res.render("login", { user: req.user});
});

// route to handle login form
app.post("/login", (req, res) => {
  const { email, password } = req.body; // capture username input

  // replaced with helper function
  const user = getUserByEmail(email);

  // error handling
  if (!user) {
    return res.status(403).send("Invalid user");
  }

  // check if the password matches
  if (user.password !== password) {
    return res.status(403).send("Incorrect password");
  }

  // if both checks are valid, set cookie to user.id
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});
//---------------------------------------------------------
//route to handle logout page and redirect back to login page
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//---------------------------------------------------------
app.listen(PORT, () => { // the code is what gets express app to start running
  console.log(`Example app listening on port ${PORT}!`);
});
