const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "[email protected]",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "[email protected]",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("[email protected]", testUsers);
    const expectedUserID = "userRandomID";
    // should find user OBJECT
    assert.isObject(user, "should be an object");
    assert.equal(user.id, expectedUserID, "User ID should match expected ID");
  });

  it("should return undefined when email given is not found in database", function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.isUndefined(user, "return value should be undefined if email does not exist");
  });
});


describe("urlsForUser", function () {
// testing urlDatabase
  const urlDatabase = {
    "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
    "9sm5xK": { longURL: "http://www.google.com", userId: "user2" },
    "abc123": { longURL: "http://www.example.com", userId: "user1" },
    "xyz789": { longURL: "http://www.bing.com", userId: "user3" },
  };

// Define expectedOutput
  it("should return URLs that belong to the given user", function () {
    const user1Urls = urlsForUser("user1", urlDatabase);
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "abc123": { longURL: "http://www.example.com", userId: "user1" },
    };
    assert.deepEqual(user1Urls, expectedOutput);
  })

  // call the function
  it("should return an empty object if the user has no URLs", function () {
    const user4Urls = urlsForUser("user4", urlDatabase);
    assert.deepEqual(user4Urls, {});
  });

  it("should return an empty object if the urlDatabase is empty", function () {
    const emptyDatabase = {};
    const result = urlsForUser("user1", emptyDatabase);
    assert.deepEqual(result, {});
  });

  it("should not return URLs that belong to a different user", function () {
    const user1Urls = urlsForUser("user1", urlDatabase);
    
    // Ensure that URLs belonging to other users are NOT included
    assert.notProperty(user1Urls, "9sm5xK"); // Belongs to user2
    assert.notProperty(user1Urls, "xyz789"); // Belongs to user3
  });
});

