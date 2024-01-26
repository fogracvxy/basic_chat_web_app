import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navigation } from "../components/Navigation";

const UserProfile: React.FC = () => {
  interface User {
    username: string;
    email: string;
    avatar_url: string;
  }
  const { username } = useParams();
  const [user, setUser] = useState<User | null>(null);
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
            {user.username}
          </h1>
          <p className="text-gray-600 mt-2">{user.email}</p>
          <button
            onClick={() => {}} // implemnt add friend functionality
            className="bg-blue-500 text-white font-semibold px-4 py-2 mt-4 rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg transition duration-300 ease-in-out"
          >
            Add Friend
          </button>
        </div>
      )}
    </>
  );
};

export default UserProfile;
