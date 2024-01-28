import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../redux/store";
interface User {
  username: string;
  avatar_url?: string;
}

const UserSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const userInfo = useSelector((state: RootState) => state.auth.user);

  const searchUsers = async (query: string) => {
    if (query.length < 3) {
      setUsers([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/auth/usersearch?username=${query}`,
        { method: "GET", credentials: "include" }
      );
      const data = (await response.json()) as User[];
      setUsers(data);
    } catch (error) {
      console.error("Failed to search users:", error);
    }
  };
  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchUsers(query);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);
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
          handleSearchQueryChange(e.target.value);
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
                <div className="pt-3 pl-3">
                  {" "}
                  {user.username === userInfo?.username
                    ? `${user.username} (You)`
                    : `${user.username}`}
                </div>
              </li>
            ))}
          </ul>
          {users.length === 0 && (
            <>
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-auto">
                <li className="p-2 ">No users found!</li>
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default UserSearch;
