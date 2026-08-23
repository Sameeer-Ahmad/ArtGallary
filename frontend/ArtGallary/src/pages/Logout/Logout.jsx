import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API } from "../../API/api";

export const useLogout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${API}/user/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        localStorage.removeItem("token");
        localStorage.removeItem("userID");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("profilePic");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return handleLogout;
};

const LogoutButton = () => {
  const handleLogout = useLogout();
  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
