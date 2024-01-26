import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
interface User {
  username: string;
  avatar_url?: string;
}

const UserSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [showNoUserMessage, setShowNoUserMessage] = useState<boolean>(false);
  let searchTimeout: NodeJS.Timeout | null = null;
  const navigate = useNavigate();
  useEffect(() => {
    // Clear the "no user found" message and timeout when searchQuery changes
    setShowNoUserMessage(false);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  }, [searchQuery]);

  const searchUsers = async (query: string) => {
    if (query.length >= 3) {
      const response = await fetch(
        `http://localhost:3001/auth/usersearch?username=${query}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = (await response.json()) as User[];
      setUsers(data);

      if (data.length === 0) {
        // Clear any previous timeout
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }

        // Set a new timeout to show the message if no users are found
        searchTimeout = setTimeout(() => {
          setShowNoUserMessage(true);
        }, 1500);
      }
    } else {
      setUsers([]);
    }
  };

  const handleUserClick = (username: string) => {
    navigate(`/user/${username}`);
  };
  return (
    <div className="relative">
      <input
        type="text"
        className="border border-gray-300 p-2 rounded"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          searchUsers(e.target.value);
        }}
      />
      {searchQuery.length >= 3 && (
        <>
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-auto">
            {users.map((user, index) => (
              <li
                key={index}
                onClick={() => handleUserClick(user.username)}
                className="flex flex-row p-2 hover:bg-gray-100 cursor-pointer"
              >
                <div>
                  <img
                    className="w-12 h-12 rounded-full hover:bg-gray-100"
                    src={user.avatar_url}
                  ></img>{" "}
                </div>
                <div className="pt-3 pl-3"> {user.username}</div>
              </li>
            ))}
          </ul>
          {searchQuery.length >= 3 && showNoUserMessage && (
            <>
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-auto">
                <li className="p-2  ">No users found!</li>
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default UserSearch;
