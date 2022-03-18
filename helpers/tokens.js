const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user data. */

function createToken(user) {
  // user contains id, username
  const payload = { id: user.id };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };