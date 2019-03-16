<template>
  <v-layout row justify-center>
    <template>
      <v-btn color="accent" @click="dialog = true">Create Chat Room</v-btn>
    </template>
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">User Profile</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12 sm12 md12>
                <v-text-field v-model="title" label="Room's title*" required></v-text-field>
              </v-flex>
              <v-flex xs12 sm12 md12>
                <v-text-field v-model="description" label="Description" required></v-text-field>
              </v-flex>
              <v-checkbox v-model="checkbox" label="Private" value="true"></v-checkbox>
              <v-checkbox v-model="checkbox" label="Public" value="false"></v-checkbox>
            </v-layout>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="dialog = false">Close</v-btn>
          <v-btn color="primary" @click="createPublicChatRoom">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { mapState } from "vuex";

export default {
  data: () => ({
    checkbox: "true",
    dialog: false,
    title: "",
    description: ""
  }),
  computed: {
    isPrivate: function() {
      return this.checkbox === String(true);
    },
    ...mapState({
      user: state => state.user
    })
  },
  methods: {
    createPublicChatRoom() {
      console.log(this.user);
      const payload = {
        userid: this.$store.getters.user._id,
        title: this.title,
        description: this.description,
        private: this.isPrivate
      };

      this.$store.dispatch("addChatRoom", payload);
      // this.$store.dispatch("addPrivateChatRoom", payload);
      this.dialog = false;
    }
  }
};
</script>