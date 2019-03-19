<template>
  <v-flex>
    <v-toolbar color="primary" dark>
      <ChatCreateForm/>
    </v-toolbar>

    <v-divider></v-divider>

    <v-list two-line subheader>
      <v-subheader>
        <v-icon>group</v-icon>Public Chat Rooms
      </v-subheader>

      <v-list-tile height="200px" v-for="room in publicChatRooms" :key="room._id">
        <div class="ChatRooms_Item">
          <div class="ChatRooms-Item_Title">{{room.title}}</div>
          <div class="ChatRooms_Buttons">
            <v-btn @click.prevent="routeTo(room._id, 'public')" color="info">enter</v-btn>
            <!-- <v-btn color="error">leave</v-btn> -->
          </div>
        </div>
      </v-list-tile>
    </v-list>
    <v-divider></v-divider>
    <v-list two-line subheader>
      <v-subheader>
        <v-icon>lock</v-icon>Private Chat Rooms Under construction*
      </v-subheader>

      <v-list-tile v-for="room in privateChatRooms" :key="room._id">
        <div class="ChatRooms_Item">
          <div class="ChatRooms-Item_Title">{{room.title}}</div>
          <div class="ChatRooms_Buttons">
            <v-btn @click.prevent="routeTo(room._id, 'private')" color="info">enter</v-btn>
            <!-- <v-btn color="error">leave</v-btn> -->
          </div>
        </div>
      </v-list-tile>
    </v-list>
  </v-flex>
</template>


<script>
import ChatCreateForm from "./ChatCreateForm";
import { mapGetters } from "vuex";

export default {
  name: "ChatRooms",
  components: {
    ChatCreateForm
  },
  data() {
    return {
      bottomNav: "recent"
    };
  },
  methods: {
    routeTo(id, access) {
      this.$router.push(`/chat/chatroom/${access}/${id}`);
    }
  },
  computed: {
    ...mapGetters(["privateChatRooms", "publicChatRooms"])
  },
  created() {
    this.$store.dispatch("getPublicChatRooms");
    this.$store.dispatch("getPrivateChatRooms");
  }
};
</script>

<style>
.ChatRooms-Item_Title {
  display: flex;
  align-items: center;
}

.ChatRooms_Item {
  display: flex;
  width: 100%;
  justify-content: space-between;
}
@media only screen and (max-width: 600px) {
  .v-list__tile {
    justify-content: center;
  }
  .ChatRooms_Item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .ChatRooms_Buttons {
    align-self: center;
  }
}
</style>

