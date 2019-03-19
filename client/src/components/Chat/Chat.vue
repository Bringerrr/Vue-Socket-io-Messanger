<template>
  <v-flex>
    <v-bottom-nav :active.sync="bottomNav" :value="true" color="primary" dark>
      <v-btn dark flat value="chatrooms">
        <span>Chat Rooms</span>
        <v-icon>meeting_room</v-icon>
      </v-btn>

      <v-btn dark flat value="privatemessages">
        <span>Private messages</span>
        <v-icon>email</v-icon>
      </v-btn>

      <v-btn dark flat value="invites">
        <span>Invites</span>
        <v-icon>notification_important</v-icon>
      </v-btn>
    </v-bottom-nav>
    <div class="headline text-xs-center pa-5">
      <ChatRooms v-if="bottomNav==='chatrooms'"/>
      <PrivateMessages v-if="bottomNav==='privatemessages'"/>
      <Invites v-if="bottomNav==='invites'"/>
    </div>
  </v-flex>
</template>

<script>
import ChatRooms from "./ChatRooms";
import PrivateMessages from "./PrivateMessages";
import Invites from "./Invites";

export default {
  name: "Chat",
  components: {
    ChatRooms,
    PrivateMessages,
    Invites
  },
  data() {
    return {
      bottomNav: "chatrooms"
    };
  }
};
</script>

<style>
.Chat-Container {
  padding: 40px;
}
</style>
