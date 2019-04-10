<template>
  <v-app
    style="box-sizing: border-box; background: #E3E3EE; height: 100vh; padding-top: 50px; overflow: hidden"
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
        flex
        prepend-icon="search"
        placeholder="Under construction *"
        color="accent"
        single-line
        hide-details
      ></v-text-field>

      <v-spacer></v-spacer>

      <!-- Horizontal Navbar Links -->
      <v-flex v-if="tokenExpirationTimeMilliseconds<5 * 1000* 60">
        <div class="text-xs-center">
          <v-badge color="purple" left overlap>
            <div class="App_Session-Timer">
              <span class="Session-Timer_Title">Session time</span>
              <template v-slot:badge>
                <v-icon dark small>timer</v-icon>
              </template>

              <span>{{millisecondsIntoTimer.minutes}}:{{millisecondsIntoTimer.seconds}}</span>
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
          <v-badge right color="blue darken-2">
            <!-- <span slot="badge"></span> -->
            Profile
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
      sideNav: false,
      authSnackbar: false,
      authErrorSnackbar: false,
      // sessionWasExpiredSnackbar: false,
      sessionTimer: false,
      timeLeftBeforeSessionExpire: null,
      interval: null,
      timer: null
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
    }
  },
  computed: {
    ...mapGetters([
      "tokenExpirationTimeMilliseconds",
      "sessionExpired",
      "errorSession",
      "authError",
      "user"
    ]),
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
        items = [
          { icon: "chat", title: "Posts", link: "/posts" },
          { icon: "chat", title: "Chat", link: "/chat" }
        ];
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

.App_Session-Timer {
  display: flex;
  flex-direction: column;
  position: relative;
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
</style>
