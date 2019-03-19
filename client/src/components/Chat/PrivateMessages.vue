<template>
  <v-card>
    <v-list subheader>
      <v-subheader>Private messages - Under construction *</v-subheader>
      <v-list-tile
        v-for="item in currentUserCorrespondence"
        :key="item._id"
        avatar
        @click.prevent="routeTo(item.anotheruser._id)"
      >
        <v-list-tile-avatar>
          <img :src="item.anotheruser.avatar">
        </v-list-tile-avatar>

        <v-list-tile-content>
          <v-list-tile-title v-html="item.anotheruser.username"></v-list-tile-title>
        </v-list-tile-content>

        <v-list-tile-action>
          <v-icon :color="item.active ? 'teal' : 'grey'">chat_bubble</v-icon>
        </v-list-tile-action>
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
    return {};
  },
  methods: {
    routeTo(id) {
      this.$router.push({
        path: `/chat/chatroom/correspondence/${id}`
      });
    }
  },
  computed: {
    ...mapGetters(["currentUserCorrespondence"])
  },
  created() {
    this.$store.dispatch("getCurrentUserCorrespondence");
  }
};
</script>
