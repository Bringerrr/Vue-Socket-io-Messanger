<template>
  <v-layout row>
    <v-flex xs12 sm6 offset-sm3>
      <v-card>
        <v-toolbar color="primary" dark>
          <ChatCreateForm/>
        </v-toolbar>

        <v-list subheader>
          <v-subheader>Private messages</v-subheader>
          <v-list-tile v-for="item in items" :key="item.title" avatar @click.prevent>
            <v-list-tile-avatar>
              <img :src="item.avatar">
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title v-html="item.title"></v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-icon :color="item.active ? 'teal' : 'grey'">chat_bubble</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>

        <v-divider></v-divider>

        <v-list subheader>
          <v-subheader>Chat Rooms</v-subheader>

          <v-list-tile v-for="room in chatRooms" :key="room._id" @click.prevent="routeTo(room._id)">
            <div>{{room.description}}</div>

            <div>{{room.title}}</div>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-flex>
  </v-layout>
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
      items: [
        {
          active: true,
          title: "Jason Oner",
          avatar: "https://cdn.vuetifyjs.com/images/lists/1.jpg"
        },
        {
          active: true,
          title: "Ranee Carlson",
          avatar: "https://cdn.vuetifyjs.com/images/lists/2.jpg"
        },
        {
          title: "Cindy Baker",
          avatar: "https://cdn.vuetifyjs.com/images/lists/3.jpg"
        },
        {
          title: "Ali Connors",
          avatar: "https://cdn.vuetifyjs.com/images/lists/4.jpg"
        }
      ],
      items2: [
        {
          title: "Travis Howard",
          avatar: "https://cdn.vuetifyjs.com/images/lists/5.jpg"
        }
      ]
    };
  },
  methods: {
    routeTo(id) {
      console.log(id);
      this.$router.push("/chat/" + id);
    }
  },
  computed: {
    // publicChatRooms() {
    //   console.log(this.$store.getters.chatRooms, "storr");
    //   return this.$store.getters.chatRooms;
    // }
    ...mapGetters(["chatRooms"])
  },
  created() {
    this.$store.dispatch("getPublicChatRooms");
  }
};
</script>
