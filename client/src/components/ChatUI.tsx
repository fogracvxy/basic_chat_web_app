import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { formatDistanceToNow } from "date-fns";
const socket = io("http://localhost:3001"); // Ensure this points to your server
import DOMPurify from "dompurify";
import "../components/ChatUI.css";
export const ChatUI = () => {
  interface Message {
    id: number;
    user_id: number;
    avatar_url: string;
    username: string;
    content: string;
    created_at: Date;
  }
  interface SocketMessage {
    id: number;
    user_id: number;
    content: string;
    created_at: Date;
    username: string;
    avatar_url: string;
  }
  interface ApiMessage {
    id: number;
    user_id: number;
    content: string;
    created_at: Date;
    username: string;
    avatar_url: string;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const user = useSelector((state: RootState) => state.auth.user);

  const [input, setInput] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch("http://localhost:3001/chat/messages");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const loadedMessages: ApiMessage[] = await response.json();
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
    const handleChatMessage = (msg: SocketMessage) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { ...msg, createdAt: new Date(msg.created_at) },
      ]);
    };

    socket.on("chatMessage", handleChatMessage);

    // Updated cleanup function
    return () => {
      socket.off("chatMessage", handleChatMessage);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  console.log(user);
  const sendMessage = () => {
    const trimmedInput = input.trim();
    const uuid = crypto.randomUUID();
    if (trimmedInput) {
      const message = {
        id: uuid,
        userId: user?.id,
        text: trimmedInput,
        username: user?.username,
        avatar_url: user?.avatar_url,
      };

      socket.emit("chatMessage", message, (error: Error | null) => {
        if (error) {
          console.error("Message sending failed", error);
        }
      });

      setInput("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const renderMessage = (message: Message) => {
    const isSelf = user?.id === message.user_id;
    const userProfilePicture = message.avatar_url;

    const UserProfileImage: React.FC<{ userProfilePicture: string }> = ({
      userProfilePicture,
    }) => {
      const sanitizedUrl = DOMPurify.sanitize(userProfilePicture, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: ["src"],
      });

      const safeImageUrl = sanitizedUrl;

      return <img src={safeImageUrl} alt="Avatar" className={avatarClasses} />;
    };
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
        <UserProfileImage userProfilePicture={userProfilePicture} />
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
    <div className="flex flex-col items-center justify-center min-h-screen background-svg text-gray-800 p-10">
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
            onKeyDown={handleKeyPress}
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
