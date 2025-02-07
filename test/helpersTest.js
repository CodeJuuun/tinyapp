const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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