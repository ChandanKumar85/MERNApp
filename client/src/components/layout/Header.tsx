import { useAuthStore } from "../../features/auth/store/authStore";
import { logoutUser } from "../../features/auth/api/authApi";

const Header = () => {
  const { clearTokens } = useAuthStore();

  const logout = async () => {
    const { id, accessToken } = useAuthStore.getState();
    try {
      const res = await logoutUser({ id, accessToken });
      if (res.message === "LOGOUT_SUCCESSFUL") {
        clearTokens();
        window.location.reload();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className='bg-amber-600 p-4 text-white flex justify-between items-center'>
      <h1>Header</h1>
      <button type="button" onClick={logout} className='bg-white text-amber-600 px-4 py-2 rounded cursor-pointer'>Logout</button>
    </div>
  )
}

export default Header
