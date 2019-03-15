<template>
  <v-card>
    <div>Invite</div>
    <div>Invite</div>
    <v-list>
      <!-- <v-list-tile v-for="item in items" :key="item.title" avatar> -->
      <!-- <v-list-tile v-for="item in items" :key="item.title" avatar>
        <v-list-tile-action>
          <v-icon v-if="item.icon" color="pink">star</v-icon>
        </v-list-tile-action>

        <v-list-tile-content>
          <v-list-tile-title v-text="item.title"></v-list-tile-title>
        </v-list-tile-content>

        <v-list-tile-avatar>
          <img :src="item.avatar">
        </v-list-tile-avatar>
      </v-list-tile>-->
    </v-list>
  </v-card>
</template>

<script>
import ChatCreateForm from "./ChatCreateForm";
import { mapGetters } from "vuex";

export default {
  name: "Invites",
  data() {
    return {};
  },
  methods: {
    routeTo(id) {
      console.log(id);
      this.$router.push("/chat/chatroom/" + id);
    }
  },
  computed: {
    ...mapGetters(["chatRooms"])
  },
  created() {
    this.$store.dispatch("getPublicChatRooms");
  }
};
</script>
