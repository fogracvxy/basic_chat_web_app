import bcrypt from "bcryptjs";
import express from "express";
const authrouter = express.Router();
import pool from "../database/db.js";
import User from "./user.js";
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    next(); // If user is logged in, proceed to the next middleware/route handler
  } else {
    res.status(401).json({ error: "Not authenticated" }); // User is not logged in
  }
}
authrouter.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.find(username);
    if (existingUser) {
      return res.status(409).json({ error: "Username is already taken" });
    }

    // Create a new user
    const newUser = await User.create(username, email, password);

    // Set user id in the session
    req.session.userId = newUser.id;

    // Send back the new user data
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
authrouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    // console.log(req.body);
    // Validate the user's password
    const user = await User.validatePassword(username, password);
    if (user) {
      // Set user id in the session
      req.session.userId = user.id;

      // Send back the user data
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
authrouter.get("/status", async (req, res) => {
  try {
    // Check if the user is logged in
    if (req.session.userId) {
      const user = await User.findById(req.session.userId);

      if (user) {
        // Return user data excluding sensitive information like password
        const { password, ...userData } = user;
        res.json(userData);
      } else {
        // User not found in database, could be an invalid session
        res.status(404).json({ error: "User not found" });
      }
    } else {
      // No user is logged in
      res.status(401).json({ error: "Not authenticated" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
authrouter.get("/profile", isAuthenticated, (req, res) => {});
authrouter.get("/usersearch", async (req, res) => {
  const userName = req.query.username;

  if (userName) {
    const query = `
      SELECT username, avatar_url
      FROM users
      WHERE username LIKE $1
    `;
    const { rows } = await pool.query(query, [`%${userName}%`]);
    res.json(rows);
  } else {
    res.json([]);
  }
});
authrouter.get("/user/:username", isAuthenticated, async (req, res) => {
  const { username } = req.params;
  const user = username;

  if (user) {
    const query = `
      SELECT username, avatar_url, email
      FROM users
      WHERE username LIKE $1
    `;

    const { rows } = await pool.query(query, [`%${username}%`]);
    res.json(rows);
  } else {
    res.status(404).send("User not found");
  }
});

authrouter.post("/logout", isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Could not log out, please try again" });
    } else {
      res.clearCookie("sid");
      res.json({ message: "Logout successful" });
    }
  });
});
export default authrouter;
