<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <ChatCreateForm/>
    </v-toolbar>

    <v-divider></v-divider>

    <v-list subheader>
      <v-subheader>
        <v-icon>group</v-icon>Chat Rooms
      </v-subheader>

      <v-list-tile
        v-for="room in publicChatRooms"
        :key="room._id"
        @click.prevent="routeTo(room._id)"
      >
        <div>{{room.title}}</div>
        <div class="ChatRooms_Buttons">
          <v-btn @click.prevent="routeTo(room._id)" color="info">enter</v-btn>
          <v-btn color="error">leave</v-btn>
        </div>
      </v-list-tile>
    </v-list>
    <v-divider></v-divider>
    <v-list subheader>
      <v-subheader>
        <v-icon>lock</v-icon>Private Chat Rooms
      </v-subheader>

      <v-list-tile v-for="room in publicChatRooms" :key="room._id">
        <div>{{room.title}}</div>

        <div class="ChatRooms_Buttons">
          <v-btn @click.prevent="routeTo(room._id)" color="info">enter</v-btn>
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
  name: "Profile",
  components: {
    ChatCreateForm
  },
  data() {
    return {
      bottomNav: "recent"
    };
  },
  methods: {
    routeTo(id) {
      console.log(id);
      this.$router.push("/chat/chatroom/" + id);
    }
  },
  computed: {
    ...mapGetters(["publicChatRooms"])
  },
  created() {
    this.$store.dispatch("getPublicChatRooms");
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

