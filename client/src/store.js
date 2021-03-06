import Vue from "vue";
import Vuex from "vuex";
import router from "./router";

import { defaultClient as apolloClient } from "./main";

import {
  GET_CURRENT_USER,
  GET_CURRENT_USER_CORRESPONDENCE,
  GET_CURRENT_USER_CORRESPONDENCE_MESSAGES,
  GET_POSTS,
  // GET_USER_POSTS,
  SEARCH_POSTS,
  ADD_POST,
  SIGNIN_USER,
  SIGNUP_USER,
  ADD_CHAT_ROOM,
  GET_PUBLIC_CHAT_ROOMS,
  GET_PRIVATE_CHAT_ROOMS,
  GET_CURRENT_CHAT_ROOM_MESSAGES,
  INFINITE_SCROLL_MESSAGES,
  SEND_CHAT_MESSAGE,
  SEND_PRIVATE_CHAT_MESSAGE
} from "./queries";

Vue.use(Vuex);

function scrollToBot(elem) {
  elem.scrollTop = elem.scrollHeight - elem.clientHeight;
}

export default new Vuex.Store({
  state: {
    posts: [],
    publicChatRooms: [],
    privateChatRooms: [],
    currentChatRoomMessages: [],
    chat: [],
    user: null,
    userPosts: [],
    searchResults: [],
    tokenExpirationTimeMilliseconds: null,
    currentUserCorrespondence: [],
    currentUserCorrespondenceMessages: [],
    loading: false,
    error: null,
    errorSession: null,
    authError: null,
    sessionExpired: null
  },
  mutations: {
    setPosts: (state, payload) => {
      state.posts = payload;
    },
    setSearchResults: (state, payload) => {
      if (payload !== null) {
        state.searchResults = payload;
      }
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
    },
    setChatMessage: (state, payload) => {
      if (typeof payload === "object" && payload.length > 0) {
        state.currentChatRoomMessages = state.currentChatRoomMessages.concat(
          payload.reverse()
        );
      } else
        state.currentChatRoomMessages = [
          ...state.currentChatRoomMessages,
          payload
        ];
      console.log("setChatMessage", payload);
    },
    setOlderChatMessage: (state, payload) => {
      if (typeof payload === "object" && payload.length > 0) {
        state.currentChatRoomMessages = payload
          .reverse()
          .concat(state.currentChatRoomMessages);
      } else
        state.currentChatRoomMessages = [
          ...state.currentChatRoomMessages,
          payload
        ];
    },
    setUser: (state, payload) => {
      state.user = payload;
    },
    setTokenExpirationTimeMilliseconds: (state, payload) => {
      state.tokenExpirationTimeMilliseconds = payload;
    },
    setAnotherUser: (state, payload) => {
      state.anotheruser = payload;
    },
    setCurrentUserCorrespondence: (state, payload) => {
      state.currentUserCorrespondence = payload;
    },
    setCurrentUserCorrespondenceMessages: (state, payload) => {
      state.currentUserCorrespondenceMessages = payload;
    },
    setLoading: (state, payload) => {
      state.loading = payload;
    },
    setError: (state, payload) => {
      state.error = payload;
    },
    setErrorSession: (state, payload) => {
      state.errorSession = payload;
    },
    setAuthError: (state, payload) => {
      state.authError = payload;
    },
    setSessionExpired: (state, payload) => {
      state.sessionExpired = payload;
    },
    clearUser: state => (state.user = null),
    clearError: state => (state.error = null),
    clearPublicChatRooms: state => (state.publicChatRooms = null),
    clearMessages: state => (state.currentChatRoomMessages = []),
    clearSearchResults: state => (state.searchResults = [])
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
          commit("setChatMessage", data.sendChatMessage);
        })
        .catch(err => {
          commit("setLoading", false);
          console.error(err);
        });
    },
    sendPrivateChatMessage: ({ commit }, payload) => {
      commit("setLoading", true);
      // console.log("sendPrivateChatMessage_vuex_store", payload);
      apolloClient
        .mutate({
          mutation: SEND_PRIVATE_CHAT_MESSAGE,
          variables: payload
        })
        .then(({ data }) => {
          commit("setLoading", false);
          commit("setChatMessage", data.sendPrivateMessage);
          console.log("sendPrivateChatMessage_vuex_store", payload.ref);
        })
        .then(() => {
          scrollToBot(payload.ref);
        })
        .catch(err => {
          commit("setLoading", false);
          console.error(err);
        });
    },
    setChatMessage: ({ commit }, payload) => {
      try {
        async () => {
          await commit("setChatMessage", payload);
          console.log("setChatMEssageVuex");
          await scrollToBot(payload.ref);
        };
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
      commit("setLoading", true);
      apolloClient
        .query({
          query: GET_CURRENT_USER_CORRESPONDENCE_MESSAGES,
          variables: payload
        })
        .then(({ data }) => {
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
          commit("setUser", data.getCurrentUser.user);
          commit(
            "setTokenExpirationTimeMilliseconds",
            data.getCurrentUser.tokenExpirationTime
          );
        })
        .catch(err => {
          commit("setLoading", false);
          console.log("setLoading", JSON.stringify(err.message));
          // commit("setSessionExpired", true);
          // commit("setErrorSession", JSON.stringify(err.message));
          // if error is about jwt's expiration - clear the token
          if (JSON.stringify(err.message.indexOf("jwt expired")) !== -1) {
            console.log("JWT WAS EXPIRED", err.message);
            // localStorage.setItem("token", "");
            commit("setSessionExpired", true);
            commit("setErrorSession", JSON.stringify(err.message));
          }
        });
      commit("setLoading", true);
    },
    searchPosts: ({ commit }, payload) => {
      if (payload.searchTerm === "") {
        commit("clearSearchResults");
        return null;
      }
      apolloClient
        .query({
          query: SEARCH_POSTS,
          variables: payload
        })
        .then(({ data }) => {
          commit("setSearchResults", data.searchPosts);
        })
        .catch(err => console.error(err));
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
        .then(({ data }) => {})
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
          commit("setSessionExpired", false);
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
          router.go();
        })
        .catch(err => {
          commit("setLoading", false);
          commit("setError", err);
          console.error(err);
        });
    },
    signoutUser: async ({ commit }) => {
      commit("clearUser");
      localStorage.setItem("token", "");
      // end session
      await apolloClient.resetStore();
      router.push("/");
    }
  },
  getters: {
    posts: state => state.posts,
    user: state => state.user,
    userPosts: state => state.userPosts,
    searchResults: state => state.searchResults,
    userFavorites: state => state.user && state.user.favorites,
    tokenExpirationTimeMilliseconds: state =>
      state.tokenExpirationTimeMilliseconds,
    anotheruser: state => state.anotheruser,
    currentUserCorrespondence: state => state.currentUserCorrespondence,
    currentUserCorrespondenceMessages: state =>
      state.currentUserCorrespondenceMessages,
    currentChatRoomMessages: state => state.currentChatRoomMessages,
    loading: state => state.loading,
    error: state => state.error,
    authError: state => state.authError,
    sessionExpired: state => state.sessionExpired,
    errorSession: state => state.errorSession,
    publicChatRooms: state => state.publicChatRooms,
    privateChatRooms: state => state.privateChatRooms
  }
});
