import express from "express";
const chatrouter = express.Router();
import pool from "../database/db.js";
chatrouter.get("/messages", async (req, res) => {
  try {
    // Replace 'username' with the actual column name from your users table
    const query = `
        SELECT m.*, u.username, u.avatar_url
        FROM messages m
        JOIN users u ON m.user_id = u.id
        ORDER BY m.created_at ASC
      `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default chatrouter;
