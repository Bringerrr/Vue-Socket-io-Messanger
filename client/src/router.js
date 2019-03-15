import Vue from "vue";
import Router from "vue-router";
import Home from "./components/Home.vue";

import AddPost from "./components/Posts/AddPost.vue";
import Posts from "./components/Posts/Posts.vue";

import Profile from "./components/Auth/Profile.vue";
import Signin from "./components/Auth/Signin.vue";
import Signup from "./components/Auth/Signup.vue";
import Chat from "./components/Chat/Chat.vue";
import ChatRoom from "./components/Chat/ChatRoom.vue";
import PrivateCorrespondence from "./components/Chat/PrivateCorrespondence.vue";

import AuthGuard from "./AuthGuard";

Vue.use(Router);

const router = new Router({
  mode: "history",
  // base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/posts",
      name: "Posts",
      component: Posts
    },
    {
      path: "/post/add",
      name: "AddPost",
      component: AddPost,
      beforeEnter: AuthGuard
    },
    {
      path: "/profile",
      name: "Profile",
      component: Profile,
      beforeEnter: AuthGuard
    },
    {
      path: "/signin",
      name: "Signin",
      component: Signin
    },
    {
      path: "/Signup",
      name: "Signup",
      component: Signup
    },
    {
      path: "/Chat",
      name: "Chat",
      component: Chat,
      beforeEnter: AuthGuard
    },
    { path: "/chat/chatroom/:id", component: ChatRoom, beforeEnter: AuthGuard },
    {
      path: "/chat/correspondence/:id",
      component: PrivateCorrespondence,
      beforeEnter: AuthGuard
    }
  ]
});

export default router;
