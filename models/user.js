"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { id, username }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
      `SELECT id, 
                  username,
                  password
           FROM users
           WHERE username = $1`,
      [username],
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        // user contains username/id
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with given username + password.
   *
   * Returns { username, id }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register({ username, password }) {
    const duplicateCheck = await db.query(
      `SELECT username
           FROM users
           WHERE username = $1`,
      [username],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
           (username,
            password)
           VALUES ($1, $2)
           RETURNING username, id`,
      [
        username,
        hashedPassword
      ],
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{ id, username }, ...]
   **/

  static async findAll() {
    const result = await db.query(
      `SELECT id, username
           FROM users
           ORDER BY username`,
    );

    return result.rows;
  }

  /** Given an id, return data about a specific user.
   *
   * Returns { id, username, points }
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(id) {
    const userRes = await db.query(
      `SELECT id, username,
                  points
           FROM users
           WHERE id = $1`,
      [id],
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${id}`);

    return user;
  }

    /** Updates user table to include points value
   *
   * Returns { id, points }
   *
   * Throws NotFoundError if user not found.
   **/

  static async setPoints(id, points) {
    const result = await db.query(`UPDATE users 
                      SET points = $2
                      WHERE id = $1 
                      RETURNING id, points`, [id, points]);

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${id}`);
    return result.rows[0]
  }


      /** Delete user based on id
   *
   * returns "deleted": id 
   *
   * Throws NotFoundError if user not found.
   **/

  static async remove(id) {
    let result = await db.query(
      `DELETE
           FROM users
           WHERE id = $1
           RETURNING username`,
      [id],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${id}`);
  }


}


module.exports = User;