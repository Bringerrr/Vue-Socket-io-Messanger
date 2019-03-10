import Vue from "vue";
import Vuex from "vuex";
import router from "./router";

import axios from "axios";

import { defaultClient as apolloClient } from "./main";

import {
  GET_CURRENT_USER,
  GET_POSTS,
  SIGNIN_USER,
  SIGNUP_USER,
  ADD_PUBLIC_CHAT_ROOM,
  GET_PUBLIC_CHAT_ROOMS,
  GET_CURRENT_CHAT_ROOM_MESSAGES,
  SEND_CHAT_MESSAGE
} from "./queries";
import { debug } from "util";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    posts: [],
    chatRooms: [],
    currentChatRoomMessages: [],
    chat: [],
    user: null,
    loading: false,
    error: null,
    authError: null
  },
  mutations: {
    setPosts: (state, payload) => {
      state.posts = payload;
    },
    setChatRooms: (state, payload) => {
      state.chatRooms = payload;
    },
    setCurrentChatRoomMessages: (state, payload) => {
      state.currentChatRoomMessages = payload;
    },
    setChatMessage: (state, payload) => {
      console.log("setChatMessage before", state.currentChatRoomMessages);
      state.currentChatRoomMessages.push(payload);
      console.log("setChatMessage after", state.currentChatRoomMessages);
    },
    setUser: (state, payload) => {
      console.log("setUserVuex_Pyaload", payload);
      state.user = payload;
    },
    setLoading: (state, payload) => {
      state.loading = payload;
    },
    setError: (state, payload) => {
      state.error = payload;
    },
    setAuthError: (state, payload) => {
      state.authError = payload;
    },
    clearUser: state => (state.user = null),
    clearError: state => (state.error = null),
    clearChatRooms: state => (state.chatRooms = null)
  },
  actions: {
    addPublicChatRoom: ({ commit }, payload) => {
      commit("setLoading", true);
      console.log(payload);
      apolloClient
        .mutate({
          mutation: ADD_PUBLIC_CHAT_ROOM,
          variables: payload
        })
        .then(({ data }) => {
          commit("setLoading", false);
          console.log("ADD_PUBLIC_CHAT_ROOM", data);
        })
        .catch(err => {
          commit("setLoading", false);
          console.error("ADD_PUBLIC_CHAT_ROOM", err);
        });
    },
    getPublicChatRooms: ({ commit }) => {
      commit("setLoading", true);
      apolloClient
        .query({
          query: GET_PUBLIC_CHAT_ROOMS
        })
        .then(({ data }) => {
          commit("setLoading", false);
          commit("setChatRooms", data.getPublicChatRooms);
          console.log(data);
        })
        .catch(err => {
          commit("setLoading", false);
          console.error(err);
        });
    },
    sendChatMessage: ({ state, commit }, payload) => {
      commit("setLoading", true);
      console.log("sendChatMessage_payload", payload);
      apolloClient
        .mutate({
          mutation: SEND_CHAT_MESSAGE,
          variables: payload
        })
        .then(({ data }) => {
          commit("setLoading", false);
          // const { currentChatRoomMessages } = state;
          // const newChatMessages = {
          //   currentChatRoomMessages: [
          //     ...currentChatRoomMessages,
          //     data.sendChatMessage
          //   ]
          // };
          commit("setChatMessage", data.sendChatMessage);
          console.log("newChatMessages", data.sendChatMessage);
          console.log(data);
        })
        .catch(err => {
          commit("setLoading", false);
          console.error(err);
        });
    },

    getCurrentChatRoomMessages: ({ commit }, payload) => {
      commit("setLoading", true);
      console.log("payload", payload);
      apolloClient
        .query({
          query: GET_CURRENT_CHAT_ROOM_MESSAGES,
          variables: { roomId: payload }
        })
        .then(({ data }) => {
          commit("setLoading", false);
          commit("setCurrentChatRoomMessages", data.getCurrentChatRoomMessages);
          console.log(data);
        })
        .catch(err => {
          commit("setLoading", false);
          console.error(err);
        });
    },
    getCurrentUser: async ({ commit }) => {
      console.log("gsu store");
      commit("setLoading", true);
      apolloClient
        .query({
          query: GET_CURRENT_USER,
          variables: { token: localStorage.getItem("token") }
        })
        .then(({ data }) => {
          commit("setLoading", false);
          // Add user data to state
          commit("setUser", data.getCurrentUser);
          console.log(data.getCurrentUser);
        })
        .catch(err => {
          commit("setLoading", false);
          console.error(err);
        });
      commit("setLoading", true);
    },
    getPosts: ({ commit }) => {
      commit("setLoading", true);
      apolloClient
        .query({
          query: GET_POSTS
        })
        .then(({ data }) => {
          commit("setPosts", data.getPosts);
          commit("setLoading", false);
        })
        .catch(err => {
          commit("setLoading", false);
          console.error(err);
        });
    },
    signinUser: async ({ commit }, payload) => {
      commit("clearError");
      commit("setLoading", true);

      console.log("SIGNIN_PAYLOAD", payload);
      apolloClient
        .mutate({
          mutation: SIGNIN_USER,
          variables: payload
        })
        .then(({ data }) => {
          commit("setLoading", false);
          localStorage.setItem("token", data.signinUser.token);
          // to make sure created method is run in main.js (we run getCurrentUser), reload the page
          router.go();
        })
        .catch(err => {
          commit("setLoading", false);
          commit("setError", err);
          console.error(err);
        });
    },
    signupUser: ({ commit }, payload) => {
      commit("clearError");
      commit("setLoading", true);
      apolloClient
        .mutate({
          mutation: SIGNUP_USER,
          variables: payload
        })
        .then(({ data }) => {
          commit("setLoading", false);
          localStorage.setItem("token", data.signupUser.token);
          // to make sure created method is run in main.js (we run getCurrentUser), reload the page
          router.go();
        })
        .catch(err => {
          commit("setLoading", false);
          commit("setError", err);
          console.error(err);
        });
    },
    signoutUser: async ({ commit }) => {
      // clear user in state
      commit("clearUser");
      // remove token in localStorage
      localStorage.setItem("token", "");
      // end session
      await apolloClient.resetStore();
      // redirect home - kick users out of private pages (i.e. profile)
      router.push("/");
    }
  },
  getters: {
    posts: state => state.posts,
    currentChatRoomMessages: state => state.currentChatRoomMessages,
    user: state => state.user,
    loading: state => state.loading,
    error: state => state.error,
    authError: state => state.authError,
    chatRooms: state => state.chatRooms
  }
});
