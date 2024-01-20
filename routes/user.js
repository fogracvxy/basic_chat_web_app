import pool from "../database/db.js";
import bcrypt from "bcryptjs";

class User {
  static async find(username) {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    return rows[0];
  }

  // User.js
  static async create(username, email, password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const { rows } = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );
    return rows[0];
  }

  static async validatePassword(username, password) {
    const user = await User.find(username); // Access the static function using the class name
    if (!user) return false;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : false;
  }
  static async findById(id) {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    return rows[0];
  }
}

export default User;
