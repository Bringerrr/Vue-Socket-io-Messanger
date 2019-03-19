import store from "./store";

export default (to, from, next) => {
  if (
    localStorage.getItem("token") === null ||
    localStorage.getItem("token") === undefined
  ) {
    next({
      path: "/signin"
    });
  } else {
    next();
  }
};
