<template>
  <v-card>
    <div>Under construction *</div>
    <v-list></v-list>
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
