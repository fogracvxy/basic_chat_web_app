import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import cors from "cors";
import pool from "./database/db.js";
import authrouter from "./routes/auth.js";
import chatrouter from "./routes/chatapi.js";
const pgSession = connectPgSimple(session);
const port = 3001;
import helmet from "helmet";
import "dotenv/config";
const app = express();
import { Server } from "socket.io";
app.use(helmet()); // Add Helmet middleware for security
const allowedOrigins = ["http://localhost:5173", "http://localhost"];
app.use(
  cors({
    origin: allowedOrigins, // Set allowed origin
    credentials: true, // Allow credentials
  })
);
app.use(express.json());
app.disable("x-powered-by");

app.use(
  session({
    store: new pgSession({
      pool: pool, // Use database pool for session store
      tableName: "sessions", // Custom table name for session store
      createTableIfMissing: true, // Automatically create table if it doesn't exist
    }),
    name: "sid",
    secret: process.env.SESSION_SECRET, // Replace 'your-secret-key' with a real secret string
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production" ? "auto" : "auto", // Use secure cookies in production
      httpOnly: true, // Prevent JavaScript access to cookies
      expires: 1000 * 60 * 60 * 24 * 7, // Set cookie expiration (7 days here)
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Use 'Strict' sameSite in production for CSRF protection
    }, // Use secure cookies in production
  })
);

app.use("/chat", chatrouter);
// Adjust the route to include '/api'
app.get("/api", (req, res) => {
  res.send("Test api!");
});

const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
const io = new Server(server, {
  cors: { origin: allowedOrigins },
  methods: ["GET", "POST"],
  credentials: true,
});
app.use("/auth", authrouter(io));
io.on("connection", (socket) => {
  socket.on("joinRoom", (roomName) => {
    socket.join(roomName);
  });

  socket.on("leaveRoom", (roomName) => {
    socket.leave(roomName);
  });
  socket.on("chatMessage", async (msg) => {
    try {
      // Save message to PostgreSQL
      const insertResult = await pool.query(
        "INSERT INTO messages (user_id, content) VALUES ($1, $2) RETURNING *",
        [msg.userId, msg.text]
      );

      const savedMessage = insertResult.rows[0];

      // Fetch the username from the users table
      const userResult = await pool.query(
        "SELECT username, avatar_url FROM users WHERE id = $1",
        [savedMessage.user_id]
      );
      // Check if a user was found
      if (userResult.rows.length > 0) {
        const username = userResult.rows[0].username;
        const avatar = userResult.rows[0].avatar_url;
        // Emit the message to all clients, including the username
        io.emit("chatMessage", {
          ...savedMessage,
          username: username,
          created_at: new Date(savedMessage.created_at).toISOString(), // Make sure to convert to ISO string if necessary
          avatar_url: avatar,
        });
      } else {
        console.error("User not found for the message");
      }
    } catch (err) {
      console.error(err);
    }
  });
});
