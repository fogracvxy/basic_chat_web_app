import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { formatDistanceToNow } from "date-fns";
const socket = io("http://localhost:3001"); // Ensure this points to your server

export const ChatUI = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  useEffect(() => {
    // Function to load messages from the database
    const loadMessages = async () => {
      try {
        const response = await fetch("http://localhost:3001/chat/messages");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const loadedMessages = await response.json();
        setMessages(
          loadedMessages.map((msg) => ({
            ...msg,
            createdAt: new Date(msg.created_at),
          }))
        );
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    loadMessages();
  }, []);
  useEffect(() => {
    socket.on("chatMessage", (msg) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...msg, createdAt: new Date(msg.created_at) },
      ]);
    });

    return () => socket.off("chatMessage");
  }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  console.log(user);
  const sendMessage = () => {
    if (input.trim()) {
      const message = {
        id: Date.now(),
        userId: user?.id,
        text: input,
        username: user?.username,
        avatar_url: user?.avatar_url,
      };
      socket.emit("chatMessage", message);
      setInput("");
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const renderMessage = (message) => {
    const isSelf = user?.id === message.user_id;
    const userProfilePicture = message.avatar_url;

    const messageBubbleClasses = isSelf
      ? "bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg"
      : "bg-gray-300 p-3 rounded-r-lg rounded-bl-lg";

    const avatarClasses = `h-10 w-10 rounded-full ${
      isSelf ? "bg-blue-500 order-1" : "bg-gray-300 order-1"
    }`;

    const textContainerClasses = `flex flex-col ${
      isSelf ? "items-end mr-2 order-1" : "items-start ml-2 order-2"
    }`;

    const usernameClasses = `text-xs font-medium ${
      isSelf ? "order-3" : "order-1"
    }`;

    return (
      <div
        key={message.id}
        className={`flex w-full mt-4 ${isSelf ? "flex-row-reverse" : ""}`}
      >
        <img src={userProfilePicture} alt="Avatar" className={avatarClasses} />
        <div className={textContainerClasses}>
          <span className={usernameClasses}>
            {isSelf ? "You" : message.username}
          </span>
          <div className={messageBubbleClasses}>
            <p className="text-sm">{message.content}</p>
          </div>
          <span className="text-xs text-gray-500 leading-none mt-1">
            {message.created_at &&
              formatDistanceToNow(new Date(message.created_at), {
                addSuffix: true,
              })}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-screen min-h-screen bg-gray-100 text-gray-800 p-10">
      <div className="flex flex-col flex-grow w-full max-w-xl bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="flex flex-col flex-grow h-0 p-4 overflow-auto">
          {messages.length === 0 && (
            <div className="text-center">
              <p>No messages yet!</p>
            </div>
          )}
          {messages.map((message) => renderMessage(message))}
          <div ref={bottomRef}></div>
        </div>

        <div className="flex items-center bg-gray-300 p-4">
          <input
            className="flex-grow h-10 rounded-l px-3 text-sm"
            type="text"
            placeholder="Type your message…"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
