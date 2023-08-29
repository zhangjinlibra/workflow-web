const TOKEN_KEY = "X-Token";

const isLogin = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};

const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export { clearToken, getToken, isLogin, setToken };
