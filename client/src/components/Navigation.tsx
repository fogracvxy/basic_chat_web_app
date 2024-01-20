import React, { useState } from "react";
import { FaUser, FaHome, FaPowerOff } from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { ImMenu, ImMenu4 } from "react-icons/im";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { logout } from "../redux/authslice";
export const Navigation: React.FC = () => {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false); // State to control logout modal visibility
  const user = useSelector((state: RootState) => state.auth.user);
  const openLogoutWarning = () => {
    setIsLogoutModalOpen(true);
  };
  const handleLogout = async () => {
    setIsLogoutModalOpen(false); // Close the modal
    const response = await fetch("http://localhost:3001/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      dispatch(logout());
      localStorage.setItem("logout", Date.now().toString()); // Broadcast logout event
      navigate("/login");
    } else {
      // Handle logout errors
    }
  };

  return (
    <>
      <nav className="relative flex flex-wrap items-center justify-between px-2 py-3 bg-gray-500">
        <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
          <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
            <p className="text-sm font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase text-white">
              {" "}
              Pozdrav, {user?.username}
            </p>

            <button
              className="text-white cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
              type="button"
              onClick={() => setNavbarOpen(!navbarOpen)}
            >
              {navbarOpen ? <ImMenu4 /> : <ImMenu />}
            </button>
          </div>
          <div
            className={
              "lg:flex flex-grow items-center" +
              (navbarOpen ? " flex" : " hidden")
            }
            id="example-navbar-danger"
          >
            <ul className="flex flex-col lg:flex-row list-none lg:ml-auto">
              <li
                onClick={() => {
                  navigate("/home");
                }}
                className="nav-item px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75 cursor-pointer"
              >
                <FaHome />
                <span className="ml-2">Home</span>
              </li>
              <li
                onClick={() => {
                  navigate("/globalchat");
                }}
                className="nav-item px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75 cursor-pointer"
              >
                <FaMessage></FaMessage>
                <span className="ml-2">Chat</span>
              </li>
              <li
                onClick={() => {
                  navigate("/profile");
                }}
                className="nav-item px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75 cursor-pointer"
              >
                <FaUser />
                <span className="ml-2">Profile</span>
              </li>

              <li
                onClick={() => {
                  openLogoutWarning();
                }}
                className="nav-item px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75 cursor-pointer"
              >
                {navbarOpen ? (
                  <>
                    <FaPowerOff color="red" />{" "}
                    <p className="pl-2 text-redish">Logout</p>{" "}
                  </>
                ) : (
                  <FaPowerOff color="red" />
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {isLogoutModalOpen && (
        <div className="justify-center items-center flex overflow-x-hidden  overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
          <div className="relative w-auto my-6 mx-auto max-w-sm">
            {/* Modal content */}
            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
              {/* Modal header */}
              <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t">
                <h3 className="text-xl font-semibold">Logout</h3>
                <button
                  className=" ml-auto bg-transparent border-0 text-black float-right text-xl leading-none font-semibold outline-none focus:outline-none"
                  onClick={() => setIsLogoutModalOpen(false)}
                >
                  <span className="bg-transparent text-black text-xl block outline-none focus:outline-none">
                    ×
                  </span>
                </button>
              </div>
              {/* Modal body */}
              <div className="relative p-6 flex-auto">
                <p className="my-4 text-gray-600 text-m leading-relaxed">
                  Are you sure you want to logout?
                </p>
              </div>
              {/* Modal footer */}
              <div className="flex items-center justify-end py-2 px-4 border-t border-solid border-gray-300 rounded-b">
                <button
                  className="text-red-500 background-transparent font-bold uppercase px-14 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                  type="button"
                  style={{ transition: "all .15s ease" }}
                  onClick={() => setIsLogoutModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-sm px-14 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                  type="button"
                  style={{ transition: "all .15s ease" }}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isLogoutModalOpen && (
        <div className="opacity-90 fixed inset-0 z-40 bg-black"></div>
      )}
    </>
  );
};
