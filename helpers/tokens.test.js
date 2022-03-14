const jwt = require("jsonwebtoken");
const { createToken } = require("./tokens");
const { SECRET_KEY } = require("../config");


describe("createToken", function () {
  test("Creates token when given correct input", function () {
    const token = createToken({ username: "test", id: 1 });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      id: expect.any(Number)
    });
  });
});

