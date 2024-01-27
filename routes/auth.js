import bcrypt from "bcryptjs";
import express from "express";
const authrouter = express.Router();
import pool from "../database/db.js";
import User from "./user.js";

export default function (io) {
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
        SELECT id, username, avatar_url, email
        FROM users
        WHERE username LIKE $1
      `;

      const { rows } = await pool.query(query, [`%${username}%`]);
      res.json(rows);
    } else {
      res.status(404).send("User not found");
    }
  });

  authrouter.post("/friend-request", isAuthenticated, async (req, res) => {
    const { senderId, receiverId } = req.body;
    if (senderId === receiverId) {
      return res
        .status(400)
        .json({ error: "Cannot send a friend request to yourself." });
    }

    try {
      // Begin a transaction
      await pool.query("BEGIN");
      // Check if the receiver has already sent a friend request to the sender
      // Check if a valid friend request already exists that is not declined
      const checkIfFriendRequestExistsText = `
SELECT * FROM friend_requests
WHERE 
  (
    (sender_id = $1 AND receiver_id = $2)
    OR (sender_id = $2 AND receiver_id = $1)
  )
  AND status NOT IN ('declined')
`;

      const checkIfFriendRequestExistsValues = [senderId, receiverId];
      const checkIfFriendRequestExistsResult = await pool.query(
        checkIfFriendRequestExistsText,
        checkIfFriendRequestExistsValues
      );
      if (checkIfFriendRequestExistsResult.rows.length > 0) {
        await pool.query("ROLLBACK");
        return res.status(400).json({
          error: "Friend request already sent.",
        });
      }
      // Insert friend request into the database
      const insertFriendRequestText = `
        INSERT INTO friend_requests (sender_id, receiver_id, status)
        VALUES ($1, $2, $3) RETURNING id`;
      const insertFriendRequestValues = [senderId, receiverId, "pending"];
      const friendRequestResult = await pool.query(
        insertFriendRequestText,
        insertFriendRequestValues
      );

      // Optionally, create a notification for the receiver
      const insertNotificationText = `
  INSERT INTO notifications (user_id, sender_id, type, message, reference_id, seen)
  VALUES ($1, $2, $3, $4, $5, $6)`;
      const insertNotificationValues = [
        receiverId,
        senderId,
        "friend_request",
        "sent you a friend request!",
        friendRequestResult.rows[0].id,
        false,
      ];
      await pool.query(insertNotificationText, insertNotificationValues);

      // Commit the transaction
      await pool.query("COMMIT");

      // Emit a real-time event to the receiver if they are connected
      // Make sure to have access to the `io` object that's connected to your Socket.IO setup
      // You'll need to establish a way to map `receiverId` to their socket id
      // Inside authrouter.post("/friend-request", ...)
      const getUserData = async (userId) => {
        const { rows } = await pool.query(
          "SELECT username, avatar_url FROM users WHERE id = $1",
          [userId]
        );
        return rows[0];
      };
      const senderUserData = await getUserData(senderId); // Implement this function to fetch user data

      io.to(`user_${receiverId}`).emit("notification", {
        type: "friend_request",
        message: "sent you a friend request!",
        senderId: senderId,
        senderusername: senderUserData.username,
        senderavatar: senderUserData.avatar_url,
        friendRequestId: friendRequestResult.rows[0].id,
      });

      res.status(200).json({ message: "Friend request sent successfully." });
    } catch (error) {
      await pool.query("ROLLBACK");
      console.error(error);
      res.status(500).json({ error: "Error sending friend request" });
    }
  });
  authrouter.get("/notifications/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;

      // Adjust the query to join with the users table to get the sender's data based on sender_id
      const result = await pool.query(
        `
        SELECT n.*, u.username AS senderUsername, u.avatar_url AS senderAvatar
        FROM notifications n
        JOIN users u ON u.id = n.sender_id
        WHERE n.user_id = $1
        ORDER BY n.created_at DESC
        LIMIT $2 OFFSET $3
        `,
        [userId, limit, offset]
      );

      // Now each notification will include the sender's username and avatar URL
      res.status(200).json({
        notifications: result.rows.map((notification) => {
          return {
            ...notification,
            // message: `${notification.senderUsername}: ${notification.message}`,
            // Include other fields as needed
          };
        }),
        currentPage: page,
        totalItems: result.rowCount,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error fetching notifications" });
    }
  });
  authrouter.get(
    "/friend-request/status/:currentUserId/:otherUserId",
    isAuthenticated,
    async (req, res) => {
      const { currentUserId, otherUserId } = req.params;

      try {
        const result = await pool.query(
          `
          SELECT * FROM friend_requests
          WHERE 
            (
              (sender_id = $1 AND receiver_id = $2) OR 
              (sender_id = $2 AND receiver_id = $1)
            )
          ORDER BY created_at DESC LIMIT 1
          `,
          [currentUserId, otherUserId]
        );
        const friendRequest = result.rows[0];

        if (friendRequest) {
          // This will send back the most recent friend request status between the two users
          res.json({
            isPending:
              friendRequest.status === "pending" &&
              friendRequest.receiver_id === parseInt(currentUserId),
            status: friendRequest.status,
            requestId: friendRequest.id,
          });
        } else {
          res.json({ isPending: false, status: null, requestId: null });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error checking friend request status" });
      }
    }
  );

  authrouter.post(
    "/friend-request/respond",
    isAuthenticated,
    async (req, res) => {
      const { requestId, status } = req.body; // status should be 'accepted' or 'declined'

      try {
        // Begin a transaction
        await pool.query("BEGIN");

        // Update the friend request status
        const updateFriendRequestText = `
        UPDATE friend_requests
        SET status = $1
        WHERE id = $2 AND status = 'pending'
        RETURNING *;
      `;
        const updateFriendRequestValues = [status, requestId];
        const updateResult = await pool.query(
          updateFriendRequestText,
          updateFriendRequestValues
        );

        if (updateResult.rows.length === 0) {
          await pool.query("ROLLBACK");
          return res.status(404).json({
            error: "Friend request not found or already responded to.",
          });
        }

        // Optionally, create a notification for the other user to inform them of the response
        // ...

        // Commit the transaction
        await pool.query("COMMIT");

        res.json({ message: `Friend request ${status}.` });
      } catch (error) {
        await pool.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ error: "Error responding to friend request" });
      }
    }
  );

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

  return authrouter;
}
