import { message } from "antd";

const isBrowser = typeof window !== "undefined"; // Check if running in the browser

export const getToken = () => {
  return isBrowser ? localStorage.getItem("token") : null;
};

export const clearToken = () => {
  isBrowser && localStorage.removeItem("token");
};

export const deauthUser = () => {
	message.loading("Please wait...", 1).then(async () => {
	try {
        clearToken();
        localStorage.removeItem('lfwCenter_token');
        localStorage.removeItem('lfwCenter_user');
        localStorage.removeItem('typeUser');
        localStorage.removeItem('lfwCenter_id');
        localStorage.removeItem('lfwCenter_userData');
        window.location.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
	})
}

export const isAuthenticated = () => {
  if (typeof localStorage !== 'undefined') {
    const token = localStorage.getItem("lfwCenter_token");
    return !!token;
  } else {
    // Handle the case where localStorage is not available
    return false;
  }  
};