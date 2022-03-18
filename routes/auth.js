
const express = require("express");

const { BadRequestError } = require("../expressError");
const router = new express.Router();
const jsonschema = require("jsonschema");
const User = require('../models/user')
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json");
const userRegisterSchema = require("../schemas/userRegister.json");



/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 * This is how existing users login
 * Can only use this route if already have account
 *
 * Authorization required: none
 */

router.post("/token", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userAuthSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const { username, password } = req.body;

        const user = await User.authenticate(username, password);
 
        const token = createToken(user);
        return res.json({ token });
    } catch (err) {
        return next(err);
    }
});

/** POST /auth/register:   { user } => { token }
*
* user must include { username, password }
* username must be unique, password >= 5 chars
*
* Returns JWT token which can be used to authenticate further requests.
*
* Authorization required: none
*/

router.post("/register", async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userRegisterSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const newUser = await User.register({ ...req.body });
        const token = createToken(newUser);
        return res.status(201).json({ token });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;