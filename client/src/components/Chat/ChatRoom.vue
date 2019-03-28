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
        <v-toolbar color="primary" dark>
          <v-toolbar-title class="text-xs-center">Room {{ $route.params.id }}</v-toolbar-title>

          <v-spacer></v-spacer>
        </v-toolbar>
        <v-flex id="scroll-target" ref="chatcontainer" class="Chat-Container" align-self-center>
          <div
            v-scroll:#scroll-target="onScroll"
            v-for="item in currentChatRoomMessages"
            :key="item._id"
            class="Chat-Message"
          >
            <div class="Chat-Message_Avatar">
              <img :src="item.avatar" alt="avatr">
            </div>

            <div class="Chat-Message_Info">
              <div class="Chat-Message_Header">
                <div class="Chat-Message_Header_UserName">{{item.username}}</div>
                <div class="Chat-Message_Header_Data">{{item.createdDate}}</div>
              </div>
              <div class="Chat-Message_Text">
                <p>{{item.message}}</p>
              </div>
            </div>
          </div>
        </v-flex>
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

              <v-btn color="accent" type="submit">Send</v-btn>
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
          username: "Under construction",
          avatar: "https://cdn.vuetifyjs.com/images/lists/1.jpg",
          icon: true
        }
      ],
      socket: null,
      currentRoomId: this.$route.params.id,
      access: this.$route.params.access,
      message: "",
      messageRules: [
        message => !!message || "write something",
        message => message.length < 150 || "limit is 150 symbols"
      ]
    };
  },
  methods: {
    onScroll(e) {
      this.scrollPosition = e.target.scrollTop;
    },
    scrollToBot(elem) {
      elem.scrollTop = elem.scrollHeight - elem.clientHeight;
    },
    async sendMessage() {
      if (this.$refs.form.validate()) {
        if (this.access !== "correspondence") {
          let payload = {
            roomId: this.currentRoomId,
            userid: this.user._id,
            username: this.user.username,
            avatar: this.user.avatar,
            message: this.message,
            private: false
          };
          await this.$store.dispatch("sendChatMessage", payload);
          this.socket.emit("message", payload);
        } else {
          console.log("SENT PRIVATE MESSAGE");
          let payload = {
            roomId: this.currentRoomId,
            userid: this.user._id,
            anotheruserid: "5c7e49c678691e1eccbd76e7",
            username: this.user.username,
            avatar: this.user.avatar,
            message: this.message,
            private: true
          };
          this.socket.emit("message", payload);
          await this.$store.dispatch("sendPrivateChatMessage", payload);
        }
      }
      this.message = "";
    },
    async sendPrivateMessage() {
      const payload = {
        roomId: this.currentRoomId,
        userid: this.user._id,
        anotheruserid: "5c7e49c678691e1eccbd76e7",
        username: this.user.username,
        avatar: this.user.avatar,
        message: this.message,
        private: true
      };
      this.socket.emit("message", payload);
      await this.$store.dispatch("sendPrivateChatMessage", payload);
      this.message = "";
    },
    async showMessages() {
      this.pageNum = 1;
      let payload = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        roomid: this.currentRoomId,
        roomtype: this.access
      };
      this.$store.dispatch("infiniteScrollMessages", payload);
      return true;
    },
    async showMoreMessages() {
      this.pageNum += 1;
      let payload = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        roomid: this.currentRoomId,
        roomtype: this.access
      };
      this.$store.dispatch("infiniteScrollMessages", payload);
    }
  },
  watch: {
    async scrollPosition(newVal, oldVal) {
      if (oldVal > 0 && newVal === 0) {
        await this.showMoreMessages();
      }
    },
    currentChatRoomMessages(newVal, oldVal) {
      if (newVal.length - oldVal.length > 1) {
        let newScrollHeight = this.$refs.chatcontainer.scrollHeight;

        this.$refs.chatcontainer.scrollTop =
          newScrollHeight - this.oldScrollHeight;
        this.oldScrollHeight = newScrollHeight;
      }
      if (newVal.length - oldVal.length === 1) {
        this.scrollToBot(this.$refs.chatcontainer);
      }
    }
  },
  computed: {
    ...mapGetters([
      "loading",
      "user",
      "currentChatRoomMessages",
      "currentUserCorrespondenceMessages"
    ])
  },
  async created() {
    // if (this.access === "correspondence") {
    //   console.log("correspondence messages");
    //   let payload = {
    //     token: localStorage.getItem("token"),
    //     anotheruserid: "5c7e49c678691e1eccbd76e7"
    //   };
    //   await this.$store.dispatch(
    //     "getCurrentUserCorrespondenceMessages",
    //     payload
    //   );
    //   this.scrollToBot(this.$refs.chatcontainer.$el);
    // } else {
    //   await this.showMessages();
    // }

    await this.showMessages();
  },
  mounted() {
    this.socket = io("localhost:4000");
    this.socket.emit("joinRoom", {
      roomId: this.currentRoomId,
      username: this.user.username,
      avatar: this.user.avatar,
      _id: this.user._id
    });
    this.socket.on("getMessage", async data => {
      await this.$store.dispatch("setChatMessage", data);
    });
  },
  updated() {
    // Scroll chat to bot when component initialized
    if (this.currentChatRoomMessages.length === this.pageSize) {
      this.scrollToBot(this.$refs.chatcontainer);
    }
  },
  beforeDestroy() {},
  destroyed() {
    this.pageNum = 0;
    this.$store.dispatch("clearMessages");
    this.socket.emit("leaveRoom", {
      roomId: this.currentRoomId,
      username: this.user.username,
      avatar: this.user.avatar,
      _id: this.user._id
    });
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
}

.Chat-Container {
  overflow: hidden;
  overflow-y: scroll;
  height: 70vh;
}

.Chat-Container > .Chat-Message {
  display: flex;
  position: relative;
  margin-top: 12px;
}

.Chat-Container > .Chat-Message > .Chat-Message_Avatar {
  overflow: hidden;
  display: block;
  width: 10%;
}

.Chat-Container > .Chat-Message > .Chat-Message_Avatar > img {
  border-radius: 50%;
  width: 100%;
}

.Chat-Container > .Chat-Message > .Chat-Message_Info {
  padding-left: 20px;
  display: flex;
  width: 90%;
  flex-direction: column;
  flex-wrap: wrap;
}

.Chat-Container > .Chat-Message > .Chat-Message_Info > .Chat-Message_Header {
  display: flex;
}

.Chat-Container
  > .Chat-Message
  > .Chat-Message_Info
  > .Chat-Message_Header
  > .Chat-Message_Header_UserName {
  display: flex;
  font-weight: bold;
  font-size: 1.2rem;
  padding-right: 15px;
}

.Chat-Container > .Chat-Message > .Chat-Message_Info > .Chat-Message_Text {
  padding-top: 10px;
  padding-left: 10px;
  margin-top: 10px;
  box-shadow: 3px 3px 15px 1px black;
  border-radius: 0px 10px 10px 10px;
  word-wrap: break-word;
  flex-shrink: 0.2;
}

.Chat-Sidebar {
  max-height: 60vh;
}
.Chat-Sidebar-List {
  overflow: hidden;
  overflow-y: scroll;
}

@media only screen and (max-width: 600px) {
  .Chat-Message_Header {
    flex-direction: column;
  }
}
</style>
