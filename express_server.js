const express = require("express");
const app = express();
const PORT = 8080; //default port 8080

app.set("view engine", "ejs");


function generateRandomString() {}



const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
 //this code needs to be before ALL routes so it can parse any incoming data into something readable
app.use(express.urlencoded({ extended: true }));
//---------------------------------------------------------
app.get("/", (req, res) => {
  res.send("Hello!");
});
//---------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//---------------------------------------------------------
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//---------------------------------------------------------

//---------------------------------------------------------
app.get("/urls", (req, res) => {
  // need to send variables via inside object
  const templateVars = { 
    urls: urlDatabase
  };
  // parameters: templateName, variableName
  res.render("urls_index", templateVars);
});
//---------------------------------------------------------
app.get("/hello", (req, res) => {
  // console.log("GET /hello route was accessed");
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//---------------------------------------------------------

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//---------------------------------------------------------
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  }
  res.render("urls_show", templateVars);
})

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});