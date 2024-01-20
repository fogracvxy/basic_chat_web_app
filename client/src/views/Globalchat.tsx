import React from "react";
import { Navigation } from "../components/Navigation";
import { ChatUI } from "../components/ChatUI";
const Globalchat: React.FC = () => {
  return (
    <div className="bg-gray-900 w-full h-screen">
      <Navigation />
      <ChatUI />
    </div>
  );
};

export default Globalchat;
