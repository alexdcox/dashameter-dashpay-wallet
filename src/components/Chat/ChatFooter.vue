<script>
import { useStore } from "vuex";

import { IonInput, IonIcon } from "@ionic/vue";
import {
  happyOutline,
  attachOutline,
  send,
  closeOutline,
} from "ionicons/icons";
import { ref, computed } from "vue";
import IncomingRequests from "@/components/TransactionModals/IncomingRequests.vue";
import ChatTxn from "@/components/Chat/ChatTxn.vue";
import ChatSmallTxn from "@/components/Chat/ChatSmallTxn.vue";
import RequestResponse from "@/components/TransactionModals/RequestResponse.vue";
import DashdPurpleSvg from '../../../public/assets/icons/dashd-purple.svg'
import UserSentSvg from '../../../public/assets/icons/userSent.svg'
import UserSentDisabledSvg from '../../../public/assets/icons/userSent_disabled.svg'
import SendingSvg from '../../../public/assets/icons/sending.svg'

export default {
  props: ["receivedContactRequest", "sentContactRequest", "friendOwnerId"],
  emits: ["sendChatWrapper", "showSendRequestPopup"],
  components: {
    IonInput,
    IonIcon,
    IncomingRequests,
    ChatTxn,
    ChatSmallTxn,
    RequestResponse,
  },
  data() {
    return {
      DashdPurpleSvg,
      UserSentSvg,
      UserSentDisabledSvg,
      SendingSvg,
    }
  },
  setup(props, context) {
    const chatText = ref("");
    const store = useStore();

    const isSendingAccept = ref(false);

    const sendChatWrapper = () => {
      context.emit("sendChatWrapper", chatText.value);
      chatText.value = "";
    };

    const acceptAndSayHi = () => {
      isSendingAccept.value = true;
      chatText.value = "hi";
      sendChatWrapper();
    };

    const showSendRequestPopup = function () {
      props.receivedContactRequest &&
        context.emit("showSendRequestPopup", true);
    };

    const resetReplyToId = function (friendOwnerId) {
      // reset the friend's replyToId
      store.commit("setActiveReplyToId", {
        friendOwnerId: friendOwnerId,
        replyToId: undefined,
        msgOwnerId: undefined,
      });
    };

    const friendOrYou = computed(() => {
      if (
        store.getters.getUserLabel(
          store.getters.getActiveReplyToMsgOwnerId(props.friendOwnerId)
        ) === store.getters.getUserLabel(props.friendOwnerId)
      ) {
        return store.getters.getUserLabel(props.friendOwnerId);
      } else {
        return "You";
      }
    });

    return {
      happyOutline,
      attachOutline,
      closeOutline,
      send,
      sendChatWrapper,
      acceptAndSayHi,
      showSendRequestPopup,
      resetReplyToId,
      isSendingAccept,
      chatText,
      store,
      myLabel: computed(() => store.getters.myLabel),
      getUserLabel: computed(() => store.getters.getUserLabel),
      getActiveReplyToMsgOwnerId: computed(
        () => store.getters.getActiveReplyToMsgOwnerId
      ),
      friendOrYou,
    };
  },
};
</script>

<template>
  <div v-if="!receivedContactRequest" class="respond respondtext">
    <ion-icon
        :src="DashdPurpleSvg"
        class="D"
    ></ion-icon>
    You can send Dash once your friend responds
  </div>
  <IncomingRequests
      v-if="receivedContactRequest && !sentContactRequest && !isSendingAccept"
      @acceptAndSayHi="acceptAndSayHi"
  >
  </IncomingRequests>
  <div v-if="store.getters.getActiveReplyToId(friendOwnerId)">
    <div class="replying leftborder">
      <ion-icon
          @click="resetReplyToId(friendOwnerId)"
          :icon="closeOutline"
          class="x"
      ></ion-icon>
      <div class="replyheader">
        Replying to
        {{ friendOrYou }}

        <!-- {{ getUserLabel(getActiveReplyToMsgOwnerId(friendOwnerId)) }} -->
      </div>

      <chat-txn
          v-if="
          (store.getters.getChatMsgById(
            store.getters.getActiveReplyToId(friendOwnerId)
          )?.data.amount &&
            store.getters.getChatMsgById(
              store.getters.getActiveReplyToId(friendOwnerId)
            )?.data.text) ||
          store.getters.getChatMsgById(
            store.getters.getActiveReplyToId(friendOwnerId)
          )?.data.request === 'open'
        "
          :msg="
          store.getters.getChatMsgById(
            store.getters.getActiveReplyToId(friendOwnerId)
          )
        "
          :friendOwnerId="friendOwnerId"
          :isReply="true"
      >
      </chat-txn>

      <chat-small-txn
          class="singleline"
          v-if="
          store.getters.getChatMsgById(
            store.getters.getActiveReplyToId(friendOwnerId)
          )?.data.amount &&
          !store.getters.getChatMsgById(
            store.getters.getActiveReplyToId(friendOwnerId)
          )?.data.text &&
          !store.getters.getChatMsgById(
            store.getters.getActiveReplyToId(friendOwnerId)
          )?.data.request
        "
          :msg="
          store.getters.getChatMsgById(
            store.getters.getActiveReplyToId(friendOwnerId)
          )
        "
          :friendOwnerId="friendOwnerId"
          :isReply="true"
      >
      </chat-small-txn>

      <request-response
          class="singleline large"
          {{
          store.getters.getChatMsgById(
          store.getters.getActiveReplyToId(friendOwnerId)
          )
          }}
          v-if="
          store.getters.getChatMsgById(
            store.getters.getActiveReplyToId(friendOwnerId)
          )?.data.request === 'decline' ||
          store.getters.getChatMsgById(
            store.getters.getActiveReplyToId(friendOwnerId)
          )?.data.request === 'accept'
        "
          :msg="
          store.getters.getChatMsgById(
            store.getters.getActiveReplyToId(friendOwnerId)
          )
        "
          :friendOwnerId="friendOwnerId"
          :isReply="true"
      ></request-response>

      <div
          class="replymessage"
          v-if="
          !store.getters.getChatMsgById(
            store.getters.getActiveReplyToId(friendOwnerId),
            friendOwnerId
          )?.data.amount &&
          store.getters.getChatMsgById(
            store.getters.getActiveReplyToId(friendOwnerId),
            friendOwnerId
          )?.data.text
        "
      >
        {{
          store.getters.getChatMsgById(
              store.getters.getActiveReplyToId(friendOwnerId),
              friendOwnerId
          )?.data?.text
        }}
      </div>
    </div>
  </div>
  <div class="flex ion-nowrap ion-padding-start">
    <ion-input
        placeholder="Messsage... "
        v-model="chatText"
        @keyup.enter="sendChatWrapper"
    >
      <ion-icon class="emoji" :icon="happyOutline"></ion-icon>
      <ion-icon class="attach" :icon="attachOutline"></ion-icon>
    </ion-input>
    <div v-if="getUserLabel(friendOwnerId) != myLabel" class="flex">
      <ion-icon
          v-if="chatText === ''"
          class="dash_button"
          :src="receivedContactRequest ? UserSentSvg : UserSentDisabledSvg"
          @click="showSendRequestPopup"
      ></ion-icon>
      <ion-icon
          v-else
          class="dash_button"
          @click="sendChatWrapper"
          :src="SendingSvg"
      ></ion-icon>
    </div>
    <div v-else class="ion-padding-end"></div>
  </div>
</template>


<style scoped>
ion-input {
  --background: #f3f3f5;
  border-radius: 100px;
}
.respond {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 10px 10px;
  margin: 10px 16px;
  /* width: 328px;
  height: 35px; */
  background: #f2f4ff;
  backdrop-filter: blur(
    30px
  ); /* Note: backdrop-filter has minimal browser support */
  border-radius: 10px;
}
.respondtext {
  font-style: normal;
  font-weight: 500;
  font-size: 13px; /*figma: font-size: 12px; */
  line-height: 15px;
  text-align: center;
  color: #6c69fc;
}
.D {
  margin-right: 10px;
  margin-top: 1px;
}
.emoji {
  padding: 10px 10px 10px 15px;
  /* increased width and height compared to figma */
  width: 20px;
  height: 20px;
  color: #929292;
  /* font-weight: 100px; */
}
.attach {
  /* increased width and height compared to figma */
  padding: 8px 12px 8px 8px;
  width: 24px;
  height: 24px;
  color: #929292;
  order: 3;
}
.dash_button {
  width: 36px;
  height: 36px;
  margin-left: 11px;
  padding-right: 16px;
}
.replying {
  padding-top: 7px;
  padding-right: 23px;
  margin-bottom: 13px;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 15px;
  color: #818c99;
  position: relative;
}
.replyheader {
  color: #818c99;
  margin-bottom: 6px;
}
.replymessage {
  color: #000000;
}

.leftborder {
  border-left: 2px solid #6c69fc;
  border-top: 1px solid #e6e6e6;
  padding-left: 14px;
  margin-left: 0px;
}
.x {
  width: 25px;
  height: 25px;
  color: #68717b;
  float: right;
  position: absolute;
  top: 40%;
  right: 23px;
}
.singleline {
  float: none;
  margin-top: 6px;
}
</style>
