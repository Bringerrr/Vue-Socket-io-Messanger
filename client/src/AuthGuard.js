import store from "./store";

export default (to, from, next) => {
  console.log("authGuard");
  if (!store.getters.user) {
    next({
      path: "/signin"
    });
  } else {
    next();
  }
};
