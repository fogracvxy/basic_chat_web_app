interface NotificationDropdownProps {
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  notifications: Notification[];
}
interface Notification {
  senderusername: string;
  senderavatar: string;
  message: string;
}
export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  dropdownOpen,
  setDropdownOpen,
  notifications,
}) => (
  <div className="relative">
    {dropdownOpen && (
      <>
        <div
          onClick={() => setDropdownOpen(false)}
          className="fixed inset-0 h-full w-full z-10"
        ></div>

        <div
          className="absolute right-0 mt-2 bg-white rounded-md shadow-lg overflow-hidden z-20"
          style={{ width: "20rem" }}
        >
          <div className="py-2">
            {notifications.map((notification, index) => (
              <a
                key={index}
                href={`/user/${notification.senderusername}`} // Link to sender's profile
                className="flex items-center px-4 py-3 border-b hover:bg-gray-100 -mx-2"
              >
                <img
                  className="h-8 w-8 rounded-full object-cover mx-1"
                  src={notification.senderavatar}
                  alt={notification.senderusername}
                />
                <p className="text-gray-600 text-sm mx-2">
                  User {notification.senderusername} {notification.message}
                </p>
              </a>
            ))}
          </div>
          <a
            href="/notifications" // Link to all (future implementation)
            className="block bg-blue-400 text-white text-center font-bold py-2"
          >
            See all notifications
          </a>
        </div>
      </>
    )}
  </div>
);
