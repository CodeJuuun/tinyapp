const express       = require("express");
const app           = express();
const bcrypt        = require("bcryptjs");
const cookieSession = require("cookie-session");
const morgan        = require('morgan');
const { getUserByEmail, urlsForUser, generateRandomString } = require("./helpers");
const PORT          = 8080; //default port 8080

app.set("view engine", "ejs");

//---------------------------------------------------------
//middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys:['secretkey1', 'secretkey2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
const setUser = (req, res, next) => {
  req.user = users[req.session.userId] || null;
  next();
};

app.use(setUser);
//--------------------------------------------------------
// key is short URL, value is now an object that contains the long url and the associated user
const urlDatabase = {
  "b2xVn2"  : {
    longURL: "http://www.lighthouselabs.ca",
    userId: "userId"
  },
  "9sm5xK"  : {
    longURL: "http://www.google.com",
    userId: "userId"
  }
};

// userObj

const users = {
  user1: {
    id: generateRandomString(),
    email: "[email protected]",
    password: "password098",
  },
  user2: {
    id: generateRandomString(),
    email: "[email protected]",
    password: "password123",
  },
};

//---------------------------------------------------------
// Route to home page
app.get("/", (req, res) => {
  res.send("Hello!");
});
//---------------------------------------------------------
// returns the urlDatabase in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//---------------------------------------------------------
// Route to render page showing all URLS
app.get("/urls", (req, res) => {
  if (!req.user) {
    return res.status(403).send("<h2>You must be logged in to view URLs. <a href='/login'>Login</a> or <a href='/register'>Register</a></h2>");
  }
  const userUrl = urlsForUser(req.user.id, urlDatabase);

  // need to send variables via inside object
  const templateVars = {
    urls: userUrl,
    user: req.user
  };
  //  pass in name of template, object
  res.render("urls_index", templateVars);
});
//---------------------------------------------------------
// Route to handle form submission, creates short URL
app.post("/urls", (req, res) => {
  if (!req.user) {
    return res.status(403).send("<h1>You must be logged in to do that</h1>");
  }

  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    longURL: longURL,
    userId: req.user.id
  };

  console.log(urlDatabase)
  res.redirect(`/urls/${shortURL}`);
});
//---------------------------------------------------------
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//---------------------------------------------------------
// Route to render form page for creating new URL
app.get("/urls/new", (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  res.render("urls_new", {
    user: req.user
  });
});

//---------------------------------------------------------
// Route to display the short URL along with the original long URL
app.get("/urls/:id", (req, res) => {
  if (!req.user) {
    return res.status(403).send("<h2>You must be logged in to view URL details.</h2>");
  }
  const shortURL = req.params.id;
  const urlData = urlDatabase[shortURL];
  if (!urlData) {
    res.status(404).send("URL not found");
  }

  if (urlData.userId !== req.user.id) {
    return res.status(403).send("You are not authorized to view URL");
  }
 
  //if url exists, create templateVars and render the template
  const templateVars = {
    id: shortURL,
    longURL: urlData.longURL,
    user: req.user
  };
  res.render("urls_show", templateVars);
});

//---------------------------------------------------------
//Route to handle form submission as well as update URL
app.post("/urls/:id", (req, res) => {
  const shortURL        = req.params.id;
  const updatedLongURL  = req.body.longURL;

  // validation check
  if (!req.user) {
    return res.status(403).send("You must be logged in first");
  }

  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Short URL not found");
  }

  if (urlDatabase[shortURL].userId !== req.user.id) {
    return res.status(403).send("You're not authorized to edit this URL");
  }
  urlDatabase[shortURL].longURL = updatedLongURL;
  console.log(`Updated URL: ${shortURL} to ${updatedLongURL}`);
  res.redirect("/urls");
  
});
//---------------------------------------------------------
// Handles redirection to longURL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const urlData = urlDatabase[id];

  if (!urlData) {
    return res.status(404).send("The URL you are trying to access does not exist");
  }
  res.redirect(urlData.longURL);
});
//---------------------------------------------------------
// Route to handle deleting URL, and redirects back to url page
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;

  if (!req.user) {
    return res.status(403).send("You must be logged in first");
  }

  if (!urlDatabase[shortURL]) {
    return res.status(404).send("URL not found");
  }

  if (urlDatabase[shortURL].userId !== req.user.id) {
    return res.status(403).send("You are not authorized to delete this URL");
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
//---------------------------------------------------------
// Route to handle registration form page
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  // use helper function (reuseable code) to DRY
  const existingUser = getUserByEmail(email, users);
  if (existingUser) {
    return res.status(400).send("Email you used is already registered");
  }

  const userId = generateRandomString();
  //create new user obj
  const newUser = {
    id: userId,
    email: email,
    password: hashedPassword
  };

  users[userId] = newUser;

  req.session.userId = userId;
  console.log("user data after registration:", users);
  res.redirect("/urls");
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
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(403).send("Email not found, please register first!");
  }

  // check if the password matches
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect password, please try again");
  }

  // if both checks are valid, set cookie to user.id
  req.session.userId = user.id;
  res.redirect("/urls");
});
//---------------------------------------------------------
//route to handle logout page and redirect back to login page
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//---------------------------------------------------------
app.listen(PORT, () => { 
  console.log(`Example app listening on port ${PORT}!`);
});