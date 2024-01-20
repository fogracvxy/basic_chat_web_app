import React from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "../redux/authslice";
// import { RootState } from "../redux/store";
// import { useNavigate } from "react-router-dom";
import { Navigation } from "../components/Navigation";
const Home: React.FC = () => {
  // const dispatch = useDispatch();
  // const navigate = useNavigate();

  // const user = useSelector((state: RootState) => state.auth.user);
  return (
    <>
      {" "}
      <Navigation />
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        {/* <div>
          {" "}
          <div className="text-blue-200 text-center">
            Hello, {user?.username}
          </div>
          <div>
            {" "}
            <p className="text-center text-green-800">You are logged in!!!</p>
          </div>
          <div className="text-center">
            {" "}
            <button
              className="bg-slate-500 text-center m-5 p-10 border-red-900 border-4"
              onClick={() => handleLogout()}
            >
              Logout
            </button>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default Home;
