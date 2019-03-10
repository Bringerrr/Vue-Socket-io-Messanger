<template>
  <v-layout row>
    <v-flex xs12 sm6 offset-sm3>
      <v-card>
        <v-toolbar color="teal" dark>
          <v-toolbar-side-icon></v-toolbar-side-icon>

          <v-toolbar-title class="text-xs-center">{{ $route.params.id }}</v-toolbar-title>

          <v-spacer></v-spacer>

          <v-btn icon>
            <v-icon>search</v-icon>
          </v-btn>
        </v-toolbar>

        <v-list subheader>
          <v-subheader>Recent chat</v-subheader>
          <v-list-tile
            v-for="item in currentChatRoomMessages"
            :key="item._id"
            avatar
            @click.prevent
          >
            <v-list-tile-avatar>
              <img :src="item.avatar">
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title class="Private-Message" v-html="item.message"></v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-icon :color="item.active ? 'teal' : 'grey'">chat_bubble</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>

        <v-divider></v-divider>

        <v-container>
          <v-form lazy-validation ref="form" @submit.prevent="sendMessage">
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
  name: "ChatRoom",
  data() {
    return {
      socket: null,
      currentRoomId: this.$route.params.id,
      items: [
        {
          active: true,
          message: "Hello, nigger",
          avatar: "https://cdn.vuetifyjs.com/images/lists/1.jpg"
        }
      ],
      message: "",
      messageRules: [message => !!message || "write something"]
    };
  },
  methods: {
    sendMessage() {
      this.socket.emit("message", this.message);
      const payload = {
        roomId: this.currentRoomId,
        userid: this.user._id,
        username: this.user.username,
        message: this.message
      };
      this.$store.dispatch("sendChatMessage", payload);
      console.log("message payload", payload);

      this.message = "";
      console.log("currentChatRoomMessages", this.currentChatRoomMessages);
    }
  },
  watch: {
    $route(to, from) {
      console.log("route", to, from);
    }
  },
  computed: {
    ...mapGetters(["loading", "user", "currentChatRoomMessages"])
  },
  created() {
    // get messages from current room querry
    console.log("CHat room route", this.$route.params.id);
    this.$store.dispatch("getCurrentChatRoomMessages", this.currentRoomId);
  },
  mounted() {
    this.socket = io("localhost:4000");
    this.socket.emit("joinRoom", this.currentRoomId);
    this.socket.on("message", data => {
      console.log(data);
      // this.props.addMessage(data);
      // this.scrollChatToBot();
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
.Private-Message {
  border-radius: 0px 0 20px 0;
  padding-left: 20px;
}
</style>
