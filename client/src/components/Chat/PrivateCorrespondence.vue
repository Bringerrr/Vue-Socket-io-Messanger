<template >
  <v-layout row>
    <v-flex xs12>
      <v-card>
        <v-toolbar color="teal" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>

          <v-toolbar-title class="text-xs-center">{{ $route.params.id }}</v-toolbar-title>

          <v-spacer></v-spacer>

          <v-btn icon>
            <v-icon>search</v-icon>
          </v-btn>
        </v-toolbar>

        <v-list ref="chatcontainer" class="Chat-Container" id="scroll-target" subheader>
          <v-subheader>Recent chat</v-subheader>
          <v-list-tile
            v-scroll:#scroll-target="onScroll"
            v-for="item in currentUserCorrespondenceMessages"
            :key="item._id"
            avatar
            @click.prevent
          >
            <v-list-tile-avatar>
              <img :src="item.avatar">
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title v-html="item.username"></v-list-tile-title>
              <v-list-tile-sub-title v-html="item.message"></v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>

        <v-divider></v-divider>

        <v-container>
          <v-form lazy-validation ref="form" @submit.prevent="sendPrivateMessage">
            <v-layout row>
              <v-flex xs12>
                <v-text-field
                  :rules="messageRules"
                  v-model="message"
                  prepend-icon="face"
                  label="Message"
                  type="text"
                  required
                ></v-text-field>
              </v-flex>

              <v-btn color="info" type="submit">Send</v-btn>
            </v-layout>
          </v-form>
        </v-container>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { mapGetters } from "vuex";
import io from "socket.io-client";

export default {
  name: "PrivateCorrespondence",
  data() {
    return {
      socket: null,
      currentRoomId: this.$route.params.id,
      message: "",
      messageRules: [message => !!message || "write something"]
    };
  },
  methods: {
    scrollToBot(elem) {
      elem.scrollTop = elem.scrollHeight - elem.clientHeight;
    },
    async sendPrivateMessage() {
      const payload = {
        roomId: this.currentRoomId,
        userid: this.user._id,
        anotheruserid: this.currentRoomId,
        username: this.user.username,
        avatar: this.user.avatar,
        message: this.message,
        private: true
      };
      this.socket.emit("message", payload);
      await this.$store.dispatch("sendPrivateChatMessage", payload);
      this.message = "";
    }
  },
  computed: {
    ...mapGetters(["loading", "user", "currentUserCorrespondenceMessages"])
  },
  async created() {
    // get messages from current room querry

    const payload = {
      token: localStorage.getItem("token"),
      anotheruserid: this.currentRoomId
    };

    await this.$store.dispatch("getCurrentUserCorrespondenceMessages", payload);
    this.scrollToBot(this.$refs.chatcontainer.$el);
  },
  mounted() {
    console.log(this);
    this.socket = io("localhost:4000");
    this.socket.emit("joinRoom", this.currentRoomId);
    this.socket.on("getMessage", async data => {
      await this.$store.dispatch("setChatMessage", data);
      this.scrollToBot(this.$refs.chatcontainer.$el);
    });
    this.socket.on("editMessage", async data => {
      // await this.props.replaceMessage({
      //   index: data.index,
      //   newMessage: data.text
      // });
    });
    this.socket.on("resetMessage", deleted => {
      // this.props.removeMessage(deleted);
    });
  },
  beforeDestroy() {},
  destroyed() {
    // const reason = "user exited the room";
    this.socket.emit("disconnectRoom", "user exited the room");
    console.log("CHAT ROOM DESTROYED");
  }
};
</script>

<style>
/* .v-list__tile__content {
  flex: none;
} */
.Chat-Component {
}
.Private-Message {
  border-radius: 0px 0 20px 0;
  padding-left: 20px;
  align-self: flex-start;
}
.Chat-Container {
  overflow: hidden;
  overflow-y: scroll;
  height: 60vh;
}
</style>
