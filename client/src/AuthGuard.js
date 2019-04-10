import jwtDecode from "jwt-decode";

function getTokenExpiration(token) {
  return jwtDecode(token).exp;
}

function tokenWasExpired(expirationDateToken) {
  return expirationDateToken < Math.floor(new Date().getTime() / 1000);
}

export default (to, from, next) => {
  if (tokenWasExpired(getTokenExpiration(localStorage.getItem("token")))) {
    next({
      path: "/signin"
    });
  } else {
    next();
  }
};
