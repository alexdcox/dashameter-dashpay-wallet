<template>
  <div v-for="chatListItem in chatList" :key="chatListItem.friendOwnerId">
    <ChatListItemLegacy
      v-if="chatListItem.id === 'legacy'"
      :chatListItem="chatListItem"
      @click="router.push(`/legacy`)"
    >
    </ChatListItemLegacy>
    <ChatListItem v-else :chatListItem="chatListItem"> </ChatListItem>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

import useContacts from "@/composables/contacts";

import ChatListItem from "@/components/Chat/ChatListItem.vue";
import ChatListItemLegacy from "@/components/Chat/ChatListItemLegacy.vue";

export default defineComponent({
  components: { ChatListItem, ChatListItemLegacy },
  props: ["chatList"],

  setup() {
    const store = useStore();

    const router = useRouter();

    return {
      router,
      store,
    };
  },
});
</script>
