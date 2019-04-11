<template>
  <v-app
    style="box-sizing: border-box; background: #E3E3EE; min-height: 100vh;  padding-top: 50px;"
  >
    <!-- Side Navbar -->
    <v-navigation-drawer app temporary fixed v-model="sideNav">
      <v-toolbar color="accent" dark flat>
        <v-toolbar-side-icon @click="toggleSideNav"></v-toolbar-side-icon>
        <router-link to="/" tag="span" style="cursor: pointer">
          <h1 class="title pl-3">PicShare</h1>
        </router-link>
      </v-toolbar>

      <v-divider></v-divider>

      <!-- Side Navbar Links -->
      <v-list>
        <v-list-tile avatar v-if="user">
          <v-list-tile-avatar>
            <img :src="user.avatar">
          </v-list-tile-avatar>

          <v-list-tile-content>
            <v-list-tile-title>{{user.username}}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-list-tile ripple v-for="item in sideNavItems" :key="item.title" :to="item.link">
          <v-list-tile-action>
            <v-icon>{{item.icon}}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>{{item.title}}</v-list-tile-content>
        </v-list-tile>
        <!-- Signout Button -->
        <v-list-tile v-if="user" @click="handleSignoutUser">
          <v-list-tile-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>Signout</v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <!-- Horizontal Navbar -->
    <v-toolbar fixed color="primary" dark>
      <!-- App Title -->
      <v-toolbar-side-icon @click="toggleSideNav"></v-toolbar-side-icon>
      <v-toolbar-title class="hidden-xs-only">
        <router-link to="/" tag="span" style="cursor: pointer">PicShare</router-link>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Search Input -->
      <v-text-field
        v-model="searchTerm"
        @input="handleSearchPosts"
        flex
        prepend-icon="search"
        placeholder="Search posts"
        color="accent"
        single-line
        hide-details
      ></v-text-field>

      <!-- Search Results Card -->
      <v-card dark v-if="searchResults.length" id="search__card">
        <v-list>
          <v-list-tile
            v-for="result in searchResults"
            :key="result._id"
            @click="goToSearchResult(result._id)"
          >
            <v-list-tile-title>
              {{result.title}} -
              <span
                class="font-weight-thin"
              >{{formatDescription(result.description)}}</span>
            </v-list-tile-title>
            <v-spacer></v-spacer>
            <!-- Show Icon if Result Favorited by User -->
            <v-list-tile-action v-if="checkIfUserFavorite(result._id)">
              <v-icon>favorite</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-card>

      <v-spacer></v-spacer>

      <!-- Horizontal Navbar Links -->
      <v-flex v-if="sesionExpirationAlert">
        <div class="text-xs-center">
          <v-badge color="purple" left overlap>
            <div class="App_Session-Timer">
              <span class="Session-Timer_Title Session-Timer__colored">Session time</span>
              <!-- <template v-slot:badge>
                <v-icon dark small>timer</v-icon>
              </template>-->

              <span
                class="Session-Timer_Timer Session-Timer__colored"
              >{{millisecondsIntoTimer.minutes}}:{{millisecondsIntoTimer.seconds}}</span>
            </div>
          </v-badge>
        </div>
      </v-flex>
      <v-toolbar-items class="hidden-xs-only">
        <v-btn flat v-for="item in horizontalNavItems" :key="item.title" :to="item.link">
          <v-icon class="hidden-sm-only" left>{{item.icon}}</v-icon>
          {{item.title}}
        </v-btn>

        <!-- Profile Button -->
        <v-btn flat to="/profile" v-if="user">
          <v-icon class="hidden-sm-only" left>account_box</v-icon>
          <v-badge right color="error" :class="{ 'bounce': badgeAnimated }">
            <span slot="badge" v-if="userFavorites.length">{{userFavorites.length}}</span>
            Profile
          </v-badge>
        </v-btn>

        <v-btn flat to="/chat" v-if="user">
          <v-icon class="hidden-sm-only" left>account_box</v-icon>
          <v-badge right color="error" :class="{ 'bounce': badgeAnimated }">
            <span slot="badge" v-if="userFavorites.length">{{userFavorites.length}}</span>
            Chat
          </v-badge>
        </v-btn>

        <!-- Signout Button -->
        <v-btn flat v-if="user" @click="handleSignoutUser">
          <v-icon class="hidden-sm-only" left>exit_to_app</v-icon>Signout
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <!-- App Content -->
    <main>
      <v-container>
        <transition>
          <router-view/>
        </transition>

        <!-- Auth Snackbar -->
        <v-snackbar v-model="authSnackbar" color="success" :timeout="5000" bottom left>
          <v-icon class="mr-3">check_circle</v-icon>
          <h3>You are now signed in!</h3>
          <v-btn dark flat @click="authSnackbar = false">Close</v-btn>
        </v-snackbar>

        <!-- Session was expired Snackbar -->
        <!-- <v-snackbar v-model="sessionWasExpiredSnackbar" color="error" :timeout="5000" bottom left>
          <v-icon class="mr-3">cancel</v-icon>
          <h3>{{errorSession}}</h3>
          <v-btn dark flat to="/signin">Sign in</v-btn>
        </v-snackbar>-->

        <!-- Auth Error Snackbar -->
        <v-snackbar
          v-if="authError"
          v-model="authErrorSnackbar"
          color="info"
          :timeout="5000"
          bottom
          left
        >
          <v-icon class="mr-3">cancel</v-icon>
          <h3>{{authError.message}}</h3>
          <v-btn dark flat to="/signin">Sign in</v-btn>
        </v-snackbar>
      </v-container>
    </main>
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";
import store from "./store";
import router from "./router";

export default {
  name: "App",
  data() {
    return {
      searchTerm: "",
      sideNav: false,
      authSnackbar: false,
      authErrorSnackbar: false,
      // sessionWasExpiredSnackbar: false,
      sessionTimer: false,
      timeLeftBeforeSessionExpire: null,
      interval: null,
      timer: null,
      badgeAnimated: false
    };
  },
  watch: {
    user(newValue, oldValue) {
      // if we had no value for user before, show snackbar
      if (oldValue === null) {
        this.authSnackbar = true;
      }
    },
    authError(value) {
      // if auth error is not null, show auth error snackbar
      if (value !== null) {
        this.authErrorSnackbar = true;
      }
    },
    errorSession(value) {
      console.log("SESSION EXPIRED SNACKBAR");
      if (value !== null) {
        this.sessionWasExpiredSnackbar = false;
      }
    },
    userFavorites(value) {
      // if user favorites value changed at all
      if (value) {
        this.badgeAnimated = true;
        setTimeout(() => (this.badgeAnimated = false), 1000);
      }
    }
  },
  computed: {
    ...mapGetters([
      "tokenExpirationTimeMilliseconds",
      "sessionExpired",
      "errorSession",
      "authError",
      "user",
      "userFavorites",
      "searchResults"
    ]),
    sesionExpirationAlert() {
      if (
        this.tokenExpirationTimeMilliseconds < 5 * 1000 * 60 &&
        this.tokenExpirationTimeMilliseconds !== null
      ) {
        return true;
      } else false;
    },
    sessionWasExpiredSnackbar() {
      if (
        this.tokenExpirationTimeMilliseconds < 5 * 1000 * 60 &&
        this.tokenExpirationTimeMilliseconds >= 0
      ) {
        return true;
      } else return false;
    },
    horizontalNavItems() {
      let items = [
        { icon: "chat", title: "Posts", link: "/posts" },
        { icon: "lock_open", title: "Sign In", link: "/signin" },
        { icon: "create", title: "Sign Up", link: "/signup" }
      ];
      if (this.user) {
        items = [{ icon: "chat", title: "Posts", link: "/posts" }];
      }
      return items;
    },
    sideNavItems() {
      let items = [
        { icon: "chat", title: "Posts", link: "/posts" },
        { icon: "lock_open", title: "Sign In", link: "/signin" },
        { icon: "create", title: "Sign Up", link: "/signup" }
      ];
      if (this.user) {
        items = [
          { icon: "chat", title: "Posts", link: "/posts" },
          { icon: "stars", title: "Create Post", link: "/post/add" },
          { icon: "account_box", title: "Profile", link: "/profile" },
          { icon: "chat", title: "Chat", link: "/chat" }
        ];
      }
      return items;
    },
    millisecondsIntoTimer() {
      let timer = { hours: 0, minutes: 0, seconds: 0 };
      timer.seconds = Math.floor(this.timeLeftBeforeSessionExpire / 1000) % 60;
      timer.minutes =
        Math.floor(this.timeLeftBeforeSessionExpire / (1000 * 60)) % 60;
      timer.hours =
        Math.floor(this.timeLeftBeforeSessionExpire / (1000 * 60 * 60)) % 24;
      if (timer.seconds < 10) {
        timer.seconds =
          "0" + (Math.floor(this.timeLeftBeforeSessionExpire / 1000) % 60);
      }

      return timer;
    }
  },
  methods: {
    handleSearchPosts() {
      this.$store.dispatch("searchPosts", {
        searchTerm: this.searchTerm
      });
    },
    goToSearchResult(resultId) {
      // Clear search term
      this.searchTerm = "";
      // Go to desired result
      this.$router.push(`/posts/${resultId}`);
      // Clear search results
      this.$store.commit("clearSearchResults");
    },
    formatDescription(desc) {
      return desc.length > 30 ? `${desc.slice(0, 30)}...` : desc;
    },
    checkIfUserFavorite(resultId) {
      return (
        this.userFavorites &&
        this.userFavorites.some(fave => fave._id === resultId)
      );
    },
    handleSignoutUser() {
      this.$store.dispatch("signoutUser");
    },
    toggleSideNav() {
      this.sideNav = !this.sideNav;
    },
    culcTimeBeforeSessionExpiration() {
      this.interval = setInterval(() => {
        this.timeLeftBeforeSessionExpire -= 1000;
        if (this.timeLeftBeforeSessionExpire <= 0) {
          clearInterval(this.interval);
          store.commit("setSessionExpired", true);
          router.go();
        }
      }, 1000);
    }
  },
  watch: {
    tokenExpirationTimeMilliseconds(newValue, oldValue) {
      if (oldValue === null && newValue !== null) {
        this.timeLeftBeforeSessionExpire = newValue;
        this.culcTimeBeforeSessionExpiration();
      }
    }
  }
};
</script>

<style>
* {
  box-sizing: border-box;
}
#search__card {
  position: absolute;
  width: 100vw;
  z-index: 8;
  top: 100%;
  left: 0%;
}

.application--wrap {
  min-height: auto;
}

.App_Session-Timer {
  display: flex;
  flex-direction: column;
  position: relative;
}

.Session-Timer__colored {
  color: #bf653f;
}

.fade-enter-active,
.fade-leave-active {
  transition-property: opacity;
  transition-duration: 0.25s;
}

.fade-enter-active {
  transition-delay: 0.25s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}

.bounce {
  animation: bounce 1s both;
}

@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  40%,
  43% {
    transform: translate3d(0, -20px, 0);
  }
  70% {
    transform: translate3d(0, -10px, 0);
  }
  90% {
    transform: translate3d(0, -5px, 0);
  }
}
</style>
