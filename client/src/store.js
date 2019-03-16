import Vue from "vue";
import Vuex from "vuex";
import router from "./router";

import { defaultClient as apolloClient } from "./main";

import {
  GET_CURRENT_USER,
  GET_CURRENT_USER_CORRESPONDENCE,
  GET_CURRENT_USER_CORRESPONDENCE_MESSAGES,
  GET_POSTS,
  ADD_POST,
  SIGNIN_USER,
  SIGNUP_USER,
  ADD_CHAT_ROOM,
  GET_PUBLIC_CHAT_ROOMS,
  GET_PRIVATE_CHAT_ROOMS,
  GET_CURRENT_CHAT_ROOM_MESSAGES,
  INFINITE_SCROLL_MESSAGES,
  SEND_CHAT_MESSAGE
} from "./queries";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    posts: [],
    publicChatRooms: [],
    privateChatRooms: [],
    currentChatRoomMessages: [],
    chat: [],
    user: null,
    currentUserCorrespondence: [],
    currentUserCorrespondenceMessages: [],
    loading: false,
    error: null,
    authError: null
  },
  mutations: {
    setPosts: (state, payload) => {
      state.posts = payload;
    },
    setChatRoom: (state, payload) => {
      state.publicChatRooms.unshift(payload);
    },
    setPublicChatRooms: (state, payload) => {
      state.publicChatRooms = payload;
    },
    setPrivateChatRooms: (state, payload) => {
      state.privateChatRooms = payload;
    },
    setCurrentChatRoomMessages: (state, payload) => {
      state.currentChatRoomMessages = payload;
      console.log("setCurrentChatRoomMessages", state.currentChatRoomMessages);
    },
    setChatMessage: (state, payload) => {
      if (typeof payload === "object" && payload.length > 0) {
        payload.forEach(message => {
          state.currentChatRoomMessages.push(message);
        });
      } else state.currentChatRoomMessages.push(payload);
    },
    setOlderChatMessage: (state, payload) => {
      if (typeof payload === "object" && payload.length > 0) {
        payload.forEach(message => {
          state.currentChatRoomMessages.unshift(message);
        });
      } else state.currentChatRoomMessages.push(payload);
    },
    setUser: (state, payload) => {
      state.user = payload;
    },
    setAnotherUser: (state, payload) => {
      state.anotheruser = payload;
      console.log("setAnotherUser", state.anotheruser);
    },
    setCurrentUserCorrespondence: (state, payload) => {
      state.currentUserCorrespondence = payload;
    },
    setCurrentUserCorrespondenceMessages: (state, payload) => {
      state.currentUserCorrespondenceMessages = payload;
      console.log(
        "setCurrentUserCorrespondenceMessages",
        state.currentUserCorrespondenceMessages
      );
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
    clearPublicChatRooms: state => (state.publicChatRooms = null),
    clearMessages: state => (state.currentChatRoomMessages = [])
  },
  actions: {
    addChatRoom: ({ commit }, payload) => {
      commit("setLoading", true);
      apolloClient
        .mutate({
          mutation: ADD_CHAT_ROOM,
          variables: payload
        })
        .then(({ data }) => {
          commit("setLoading", false);
          router.push(`/chat/chatroom/public/${data.addChatRoom._id}`);
        })
        .catch(err => {
          commit("setLoading", false);
          console.error("ADD_PUBLIC_CHAT_ROOM", err);
        });
    },
    addPrivateChatRoom: ({ commit }, payload) => {
      commit("setLoading", true);
      apolloClient
        .mutate({
          mutation: ADD_PRIVATE_CHAT_ROOM,
          variables: payload
        })
        .then(({ data }) => {
          commit("setPrivateChatRoom", data.addPrivateChatRoom);
          commit("setLoading", false);
          router.push(`/chat/chatroom/private/${data.addPrivateChatRoom._id}`);
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
          commit("setPublicChatRooms", data.getPublicChatRooms);
        })
        .catch(err => {
          commit("setLoading", false);
          console.error(err);
        });
    },
    getPrivateChatRooms: ({ commit }) => {
      commit("setLoading", true);
      apolloClient
        .query({
          query: GET_PRIVATE_CHAT_ROOMS
        })
        .then(({ data }) => {
          commit("setLoading", false);
          commit("setPrivateChatRooms", data.getPrivateChatRooms);
        })
        .catch(err => {
          commit("setLoading", false);
          console.error(err);
        });
    },
    sendChatMessage: ({ commit }, payload) => {
      commit("setLoading", true);
      apolloClient
        .mutate({
          mutation: SEND_CHAT_MESSAGE,
          variables: payload
        })
        .then(({ data }) => {
          commit("setLoading", false);
          // console.log("sendChatMessage", data.sendChatMessage);
          // commit("setChatMessage", data.sendChatMessage);
        })
        .catch(err => {
          commit("setLoading", false);
          console.error(err);
        });
    },
    setChatMessage: ({ commit }, payload) => {
      try {
        commit("setChatMessage", payload);
      } catch (err) {
        console.error(err);
      }
    },
    getCurrentChatRoomMessages: ({ commit }, payload) => {
      commit("setLoading", true);
      apolloClient
        .query({
          query: GET_CURRENT_CHAT_ROOM_MESSAGES,
          variables: { roomId: payload }
        })
        .then(({ data }) => {
          commit("setLoading", false);
          commit("setCurrentChatRoomMessages", data.getCurrentChatRoomMessages);
        })
        .catch(err => {
          commit("setLoading", false);
          console.error(err);
        });
    },
    infiniteScrollMessages: ({ commit }, payload) => {
      commit("setLoading", true);
      apolloClient
        .query({
          query: INFINITE_SCROLL_MESSAGES,
          variables: payload
        })
        .then(({ data }) => {
          console.log(
            "data.infiniteScrollMessages.messages",
            data.infiniteScrollMessages
          );
          commit("setLoading", false);
          if (data.infiniteScrollMessages.messages.length > 0)
            commit("setOlderChatMessage", data.infiniteScrollMessages.messages);
        })
        .catch(err => {
          commit("setLoading", false);
          console.error(err);
        });
    },
    clearMessages: ({ commit }) => {
      commit("clearMessages");
    },
    getCurrentUserCorrespondenceMessages: ({ commit }, payload) => {
      console.log("getCurrentUserCorrespondenceMessagesPayload", payload);
      commit("setLoading", true);
      apolloClient
        .query({
          query: GET_CURRENT_USER_CORRESPONDENCE_MESSAGES,
          variables: payload
        })
        .then(({ data }) => {
          console.log(
            "getCurrentUserCorrespondenceMessages",
            data.getCurrentUserCorrespondenceMessages
          );
          commit("setLoading", false);
          commit(
            "setCurrentUserCorrespondenceMessages",
            data.getCurrentUserCorrespondenceMessages
          );
          return true;
        })
        .catch(err => {
          commit("setLoading", false);
          console.error(err);
        });
    },
    getCurrentUser: async ({ commit }) => {
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
        })
        .catch(err => {
          commit("setLoading", false);
          console.error(err);
        });
      commit("setLoading", true);
    },
    getCurrentUserCorrespondence: async ({ commit }) => {
      commit("setLoading", true);
      apolloClient
        .query({
          query: GET_CURRENT_USER_CORRESPONDENCE,
          variables: { token: localStorage.getItem("token") }
        })
        .then(({ data }) => {
          commit("setLoading", false);
          commit(
            "setCurrentUserCorrespondence",
            data.getCurrentUserCorrespondence
          );
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
    addPost: ({ commit }, payload) => {
      apolloClient
        .mutate({
          mutation: ADD_POST,
          variables: payload
        })
        .then(({ data }) => {
          console.log(data.addPost);
        })
        .catch(err => {
          console.error(err);
        });
    },
    signinUser: async ({ commit }, payload) => {
      commit("clearError");
      commit("setLoading", true);
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
    user: state => state.user,
    anotheruser: state => state.anotheruser,
    currentUserCorrespondence: state => state.currentUserCorrespondence,
    currentUserCorrespondenceMessages: state =>
      state.currentUserCorrespondenceMessages,
    currentChatRoomMessages: state => state.currentChatRoomMessages,
    loading: state => state.loading,
    error: state => state.error,
    authError: state => state.authError,
    publicChatRooms: state => state.publicChatRooms,
    privateChatRooms: state => state.privateChatRooms
  }
});
