import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom for navigation
import { Navigation } from "../components/Navigation";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
const Home: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  return (
    <>
      <Navigation />
      <div className="w-full h-screen bg-gray-900 flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl text-sky-600 mb-6">{user?.username}</h1>
          <h1 className="text-4xl text-white mb-6">Welcome to Chat App</h1>
          <p className="text-xl text-gray-300 mb-10">
            Click the button below to start chatting.
          </p>
          <Link to="/globalchat">
            {" "}
            {/* Add the path you want to navigate to on button click */}
            <button className="bg-blue-500 hover:bg-blue-600 text-white text-lg py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
              Click Here to Chat
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Home;
