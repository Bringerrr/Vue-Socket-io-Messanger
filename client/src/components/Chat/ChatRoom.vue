<template >
  <v-layout>
    <v-flex xs2 sm2 align-self-start>
      <v-card v-if="access === 'private' " class="Chat-Sidebar">
        <v-toolbar color="indigo" dark>
          <v-icon>people</v-icon>

          <v-toolbar-title>Participants</v-toolbar-title>
        </v-toolbar>
        <v-list class="Chat-Sidebar-List">
          <v-list-tile v-for="item in usersOnline" :key="item.username" avatar>
            <v-list-tile-avatar>
              <img :src="item.avatar">
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title v-text="item.username"></v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-icon v-if="item.icon" color="pink">star</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-flex>
    <v-flex xs9 sm9 offset-sm0 align-self-center>
      <v-card>
        <v-toolbar color="teal" dark>
          <v-toolbar-title class="text-xs-center">Room {{ $route.params.id }}</v-toolbar-title>

          <v-spacer></v-spacer>
        </v-toolbar>

        <v-list ref="chatcontainer" class="Chat-Container" id="scroll-target" subheader>
          <v-subheader>Recent chat</v-subheader>
          <v-list-tile
            v-scroll:#scroll-target="onScroll"
            v-for="item in currentChatRoomMessages"
            :key="item._id"
            avatar
            @click.prevent
          >
            <v-list-tile-avatar>
              <img :src="item.avatar">
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>
                <span>{{item.username}}</span>
                <span class="ChatRoom_Message_Date caption">{{item.createdDate}}</span>
              </v-list-tile-title>
              <v-list-tile-sub-title class="ChatRoom_Message_Text" v-html="item.message"></v-list-tile-sub-title>
            </v-list-tile-content>
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
      pageNum: 0,
      showMoreEnabled: true,
      pageSize: 10,
      scrollPosition: 0,
      scrollHeight: 0,
      oldScrollHeight: 0,
      usersOnline: [
        {
          username: "Test",
          avatar: "https://cdn.vuetifyjs.com/images/lists/1.jpg",
          icon: true
        }
      ],
      socket: null,
      currentRoomId: this.$route.params.id,
      access: this.$route.params.access,
      message: "",
      messageRules: [message => !!message || "write something"]
    };
  },
  methods: {
    onScroll(e) {
      this.scrollPosition = e.target.scrollTop;
      // console.log(e.target);
    },
    scrollToBot(elem) {
      console.log("scrolled to Bot", elem);
      elem.scrollTop = elem.scrollHeight - elem.clientHeight;
    },
    async sendMessage() {
      const payload = {
        roomId: this.currentRoomId,
        userid: this.user._id,
        username: this.user.username,
        avatar: this.user.avatar,
        message: this.message,
        private: false
      };
      this.socket.emit("message", payload);
      await this.$store.dispatch("sendChatMessage", payload);
      this.message = "";
    },
    async showMessages() {
      this.pageNum = 1;
      // fetch more data and transform original result
      let payload = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        roomid: this.currentRoomId
      };
      this.$store.dispatch("infiniteScrollMessages", payload);
      return true;
    },
    async showMoreMessages() {
      this.pageNum += 1;
      // fetch more data and transform original result
      let payload = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        roomid: this.currentRoomId
      };
      this.$store.dispatch("infiniteScrollMessages", payload);
    }
  },
  watch: {
    async scrollPosition(newVal, oldVal) {
      // console.log("newValScroll", newVal, "oldValScroll", oldVal);
      if (oldVal > 0 && newVal === 0) {
        console.log("fetching latest messages");
        await this.showMoreMessages();
      }
    },
    scrollHeight(newVal, oldVal) {
      if (newVal > oldVal && oldVal > 0 && newVal > 0) {
        this.oldScrollHeight = this.$refs.chatcontainer.$el.scrollTop =
          newVal - oldVal;
        console.log("scrollHeight Worked");
      }
    },
    currentChatRoomMessages(newVal, oldVal) {
      console.log(
        "newValcurrentChatRoomMessages",
        newVal,
        "oldValcurrentChatRoomMessages",
        oldVal
      );
      let newScrollHeight = this.$refs.chatcontainer.$el.scrollHeight;
      this.$refs.chatcontainer.$el.scrollTop =
        newScrollHeight - this.oldScrollHeight;
      console.log(newScrollHeight - this.oldScrollHeight);
      this.oldScrollHeight = newScrollHeight;
    }
  },
  computed: {
    ...mapGetters(["loading", "user", "currentChatRoomMessages"])
  },
  async created() {
    await this.showMessages();
    console.log(this.$refs.chatcontainer.$el);
  },
  mounted() {
    this.socket = io("localhost:4000");
    this.socket.emit("joinRoom", {
      roomId: this.currentRoomId,
      username: this.user
    });
    this.socket.on("getMessage", async data => {
      await this.$store.dispatch("setChatMessage", data);
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
  updated() {
    // Scroll chat to bot when component initiated
    if (this.currentChatRoomMessages.length === this.pageSize) {
      this.scrollToBot(this.$refs.chatcontainer.$el);
    }
  },
  beforeDestroy() {},
  destroyed() {
    this.pageNum = 0;
    this.$store.dispatch("clearMessages");
    // const reason = "user exited the room";
    this.socket.emit("disconnectRoom", "user exited the room");
  }
};
</script>

<style>
.v-list__tile__title,
.v-list__tile__sub-title {
  width: auto;
}
.ChatRoom_Message_Date {
  margin-left: 20px;
  padding: 0 10px;
  border: 1px solid #000;
}
.ChatRoom_Message_Text {
  border: 1px solid #000;
  margin-left: 20px;
  padding: 0 20px;
  border-radius: 0px 10px 10px 10px;
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
.Chat-Sidebar {
  max-height: 60vh;
}

.Chat-Sidebar-List {
  overflow: hidden;
  overflow-y: scroll;
}
</style>
