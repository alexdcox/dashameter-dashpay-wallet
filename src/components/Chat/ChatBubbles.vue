<script>
import {useStore} from "vuex";

import {ref} from "vue";
import {
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonChip,
  IonLabel,
} from "@ionic/vue";
import {checkmarkDoneOutline} from "ionicons/icons";
import ChatMessage from "@/components/Chat/ChatMessage.vue";
import ChatTxn from "@/components/Chat/ChatTxn.vue";
import ChatSmallTxn from "@/components/Chat/ChatSmallTxn.vue";
import RequestResponse from "../TransactionModals/RequestResponse.vue";
import ConvoSvg from '../../../public/assets/icons/convo.svg'

export default {
  props: ["chatMsgs", "friendOwnerId"],
  components: {
    IonGrid,
    IonRow,
    IonIcon,
    IonCol,
    ChatMessage,
    ChatTxn,
    ChatSmallTxn,
    RequestResponse,
    IonChip,
    IonLabel,
  },
  data() {
    return {
      ConvoSvg,
    }
  },
  setup(props, context) {
    const store = useStore();
    const chatText = ref("");

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

    const setReplyToId = (msg) => {
      store.commit("setActiveReplyToId", {
        friendOwnerId: props.friendOwnerId,
        replyToId: msg.id.toString(),
        msgOwnerId: msg.ownerId.toString(),
      });
    };

    // Resolve reply to msgs
    // TODO load in single query
    props.chatMsgs.map((msg) => {
      if (!msg.data.replyToChatId) return;
      store.dispatch("fetchMsgById", {
        ownerId: props.friendOwnerId,
        msgId: msg.data.replyToChatId,
      });
    });

    return {
      checkmarkDoneOutline,
      setReplyToId,
      sendChatWrapper,
      acceptAndSayHi,
      isSendingAccept,
      chatText,
      store,
    };
  },
};
</script>

<template>
  <div class="scroll_container">
    <div v-if="chatMsgs.length === 0" @click="acceptAndSayHi">
      <ion-icon class="figure" :src="ConvoSvg"></ion-icon>
      <div class="begin">This is the beginning of a great conversation</div>
      <div class="write">
        Write something nice or tap me to send a greeting.
      </div>
    </div>
    <div>
      <ion-grid style="padding: 0px">
        <ion-row
            v-for="msg in chatMsgs"
            :key="msg.id.toString()"
            class="row_padding">
          <ion-col>
            <div class="flex ion-justify-content-center">
              <ion-chip
                  v-if="msg._displayDate"
                  class="timestamp_chip ion-text-center">
                <ion-label class="timestamp_label">{{ msg._displayDate }}
                </ion-label>
              </ion-chip>
            </div>
            <chat-message
                v-if="msg.data.text && !msg.data.amount"
                :msg="msg"
                :friendOwnerId="friendOwnerId">
            </chat-message>
            <chat-txn
                v-if="
                (msg.data.amount && msg.data.text) ||
                msg.data.request === 'open'
              "
                :msg="msg"
                :friendOwnerId="friendOwnerId">
            </chat-txn>
            <chat-small-txn
                v-if="!msg.data.request && msg.data.amount && !msg.data.text"
                :msg="msg"
                :friendOwnerId="friendOwnerId"
            >
            </chat-small-txn>
            <request-response
                v-if="msg.data.request === 'decline' || msg.data.request === 'accept'"
                :msg="msg"
                :friendOwnerId="friendOwnerId"
            ></request-response>
          </ion-col>
        </ion-row>
      </ion-grid>
    </div>
  </div>
</template>


<style scoped>
.scroll_container {
  position: relative;
  height: 100%;
  display: flex;
  overflow-y: scroll;
  flex-direction: column-reverse;
}

/* .row_padding {
  padding-top: 5px;
  padding-bottom: 4px;
} */
.figure {
  height: 238px;
  width: 123px;
  position: fixed;
  top: 0;
  left: 0;
  transform: translate(-10%, 75%);
  opacity: 0.6;
}

.begin {
  position: fixed;
  width: 165px;
  height: 30px;
  left: 98px;
  top: 273px;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 15px;
  text-align: center;
  color: #000000;
}

.write {
  /* margin-top: -5px; */
  position: fixed;
  width: 175px;
  height: 28px;
  left: 93px;
  top: 309px;
  font-style: normal;
  font-weight: normal;
  font-size: 11px;
  line-height: 14px;
  /* or 127% */
  text-align: center;
  color: #818c99;
}
</style>
