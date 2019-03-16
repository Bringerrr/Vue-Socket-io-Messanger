<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <ChatCreateForm/>
    </v-toolbar>

    <v-divider></v-divider>

    <v-list subheader>
      <v-subheader>
        <v-icon>group</v-icon>Public Chat Rooms
      </v-subheader>

      <v-list-tile
        v-for="room in publicChatRooms"
        :key="room._id"
      >
        <div>{{room.title}}</div>
        <div class="ChatRooms_Buttons">
          <v-btn @click.prevent="routeTo(room._id, 'public')" color="info">enter</v-btn>
          <v-btn color="error">leave</v-btn>
        </div>
      </v-list-tile>
    </v-list>
    <v-divider></v-divider>
    <v-list subheader>
      <v-subheader>
        <v-icon>lock</v-icon>Private Chat Rooms
      </v-subheader>

      <v-list-tile v-for="room in privateChatRooms" :key="room._id">
        <div>{{room.title}}</div>

        <div class="ChatRooms_Buttons">
          <v-btn @click.prevent="routeTo(room._id, 'private')" color="info">enter</v-btn>
          <v-btn color="error">leave</v-btn>
        </div>
      </v-list-tile>
    </v-list>
  </v-card>
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
      console.log(id);
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
.v-list__tile {
  justify-content: space-between;
}
.ChatRooms_Buttons {
  align-self: flex-end;
}
</style>

