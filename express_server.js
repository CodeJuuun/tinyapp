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
//---------------------------------------------------------
// key is short URL, value is long URL
const urlDatabase = {
  b2xVn2  : "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//---------------------------------------------------------
// GET
//---------------------------------------------------------
app.get("/", (req, res) => {
  res.send("Hello!");
});
//------------
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//------------
app.get("/urls", (req, res) => {
  // need to send variables via inside object
  const templateVars = {
    urls: urlDatabase
  };
  // parameters: templateName, variableName
  res.render("urls_index", templateVars);
});
//------------
app.get("/hello", (req, res) => {
  // console.log("GET /hello route was accessed");
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//------------
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
//------------
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  if (longURL) { //if url exists, create templateVars and render the template
    const templateVars = {
      id: req.params.id,
      longURL: longURL
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("URL not found");
  }
});
//------------
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("short URL not found");
  }
});


//---------------------------------------------------------
//POST
//---------------------------------------------------------
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL; // extract URL from body of req
  urlDatabase[shortURL] = longURL;// assign longURL the id from shortURL generated from function

  console.log(`New URL added: ${longURL} as ${shortURL}`); // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
});
//------------
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;

  if (!urlDatabase[shortURL]) {
    return res.status(404).send("URL not found");
  }

  delete urlDatabase[shortURL];
  return res.redirect("/urls");
});

//------------
app.post("/urls/:id", (req, res) => {
  const shortURL        = req.params.id; // capture shortURL from URL parameter
  const updatedLongURL  = req.body.longURL;

  // validation check
  if (!updatedLongURL) {
    return res.status(404).send("shortURL not found");
  }

  if (urlDatabase[shortURL]) {
    urlDatabase[shortURL] = updatedLongURL;
    console.log(`Updated URL: ${shortURL} to ${updatedLongURL}`);
    res.redirect("/urls");
  }
});
//------------

app.post("/login", (req, res) => {
  const username = req.body.username; // capture username input

  // validation check
  if (!username) {
    return res.status(404).send("field cannot be empty"); // prevents empty usernames
  }
  
  res.cookie("username", username);
  res.redirect("/urls"); // redirects to main page after logging in
})
//---------------------------------------------------------
app.listen(PORT, () => { // the code is what gets express app to start running
  console.log(`Example app listening on port ${PORT}!`);
});