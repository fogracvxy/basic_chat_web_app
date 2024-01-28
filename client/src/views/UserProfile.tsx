import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navigation } from "../components/Navigation";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const UserProfile: React.FC = () => {
  interface User {
    id: number;
    username: string;
    email: string;
    avatar_url: string;
  }
  const [isFriendRequestPending, setIsFriendRequestPending] =
    useState<boolean>(false);
  const [requestId, setRequestId] = useState<number | null>(null);

  const loggedUser = useSelector((state: RootState) => state.auth.user);
  const { username } = useParams();
  const [friendRequestStatus, setFriendRequestStatus] = useState("");
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const checkFriendRequestStatus = async () => {
      if (loggedUser && user) {
        const response = await fetch(
          `http://localhost:3001/auth/friend-request/status/${loggedUser.id}/${user.id}`,
          { method: "GET", credentials: "include" }
        );

        if (response.ok) {
          const {
            isPending,
            status,
            requestId: fetchedRequestId,
          } = await response.json();
          setIsFriendRequestPending(isPending);
          setFriendRequestStatus(status); // This should now reflect 'pending', 'accepted', etc.
          setRequestId(fetchedRequestId);
        }
      }
    };

    checkFriendRequestStatus();
  }, [user, loggedUser]);

  const acceptFriendRequest = async (requestId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3001/auth/friend-request/respond`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId: requestId,
            status: "accepted",
          }),
          credentials: "include",
        }
      );

      if (response.ok) {
        setIsFriendRequestPending(false); // No more pending request
        setRequestId(null); // Clear the requestId
        setFriendRequestStatus("accepted"); // Set the status to accepted
        // Any other UI update that signifies the friend request has been accepted
      } else {
        // Handle errors
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const declineFriendRequest = async (requestId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3001/auth/friend-request/respond`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId: requestId,
            status: "declined",
          }),
          credentials: "include",
        }
      );

      if (response.ok) {
        setIsFriendRequestPending(false); // No more pending request
        setRequestId(null); // Clear the requestId
        setFriendRequestStatus("declined"); // Update the status to declined
        // Any other UI updates that signify the friend request has been declined
      } else {
        // Handle errors
      }
    } catch (error) {
      console.error("Error declining friend request:", error);
    }
  };

  useEffect(() => {
    const userDataFetch = async () => {
      const response = await fetch(
        `http://localhost:3001/auth/user/${username}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        if (response.ok && data.length > 0) {
          setUser(data[0]);
        } else {
          //handle error here
        }
      } else {
        // Handle errors
        console.error("Fetch error: ", data);
      }
    };
    userDataFetch();
  }, [username]);
  const sendFriendRequest = async (receiverId: number) => {
    const currentUserId = loggedUser?.id;
    if (!currentUserId) {
      console.error("Current user ID is not available.");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:3001/auth/friend-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ senderId: currentUserId, receiverId }),
          credentials: "include",
        }
      );

      if (response.ok) {
        // Handle successful friend request...
        // You might want to set `isFriendRequestPending` to true here and `requestId` to the new request's ID.
        const result = await response.json();
        setFriendRequestStatus("pending");
        setRequestId(result.friendRequestId); // assuming your backend sends this
      } else {
        // Handle non-200 responses...
        const errorResult = await response.json();
        console.error("Failed to send friend request:", errorResult.error);
      }
    } catch (error) {
      console.error("Send friend request error:", error);
      // Handle fetch error
    }
  };

  return (
    <>
      <Navigation />

      {user && (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-lg shadow-md">
          <img
            src={user?.avatar_url}
            alt="User"
            className="w-32 h-32 rounded-full object-cover mb-4"
          />
          <h1 className="text-2xl font-semibold text-gray-800">
            {user.username === loggedUser?.username
              ? `${user.username} (You)`
              : user.username}
          </h1>
          <p className="text-gray-600 mt-2">{user.email}</p>
          <p className="font-bold pt-5">
            {friendRequestStatus === "accepted" && "You are friends!"}
          </p>

          {loggedUser?.id !== user.id && (
            <>
              {friendRequestStatus !== "pending" &&
                friendRequestStatus !== "accepted" && (
                  <button
                    onClick={() => sendFriendRequest(user.id)}
                    className="bg-blue-500 text-white font-semibold px-4 py-2 mt-4 rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg transition duration-300 ease-in-out"
                  >
                    Add Friend
                  </button>
                )}
              {isFriendRequestPending && (
                <div className="space-x-2 mt-4">
                  <button
                    onClick={() =>
                      requestId !== null && acceptFriendRequest(requestId)
                    }
                    className="bg-green-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-green-600 hover:shadow-lg transition duration-300 ease-in-out"
                  >
                    Accept Friend Request
                  </button>
                  <button
                    onClick={() =>
                      requestId !== null && declineFriendRequest(requestId)
                    }
                    className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-red-600 hover:shadow-lg transition duration-300 ease-in-out"
                  >
                    Decline Friend Request
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};
export default UserProfile;
