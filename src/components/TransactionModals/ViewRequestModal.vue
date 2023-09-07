<script lang="ts">
import useWallet from "@/composables/wallet";
import useRates from "@/composables/rates";
import useChats from "@/composables/chats";
import useContacts from "@/composables/contacts";
import MySelf from "@/components/TransactionModals/MySelf.vue";
import MyFriend from "@/components/TransactionModals/MyFriend.vue";
import Accept from "@/components/TransactionModals/Accept.vue";
import { useRouter } from "vue-router";
import { copyOutline } from "ionicons/icons";
import {
  IonContent,
  IonIcon,
  IonTextarea,
  IonChip,
  IonFooter,
  IonToolbar,
  modalController,
} from "@ionic/vue";
import { ref, defineComponent, computed } from "vue";
import { arrowDownOutline, closeOutline } from "ionicons/icons";
import { useStore } from "vuex";
import RequestHeaderSvg from '../../../public/assets/icons/requestHeader.svg'
import SendHeaderSvg from '../../../public/assets/icons/sendHeader.svg'
import ArrowDownSvg from '../../../public/assets/icons/arrow_down.svg'

export default defineComponent({
  props: ["msg", "initSendRequestDirection", "friendOwnerId"],
  components: {
    IonContent,
    IonIcon,
    IonTextarea,
    IonChip,
    IonFooter,
    IonToolbar,
    MySelf,
    MyFriend,
    Accept,
  },
  data() {
    return {
      RequestHeaderSvg,
      SendHeaderSvg,
      ArrowDownSvg,
    }
  },
  setup(props, { emit }) {
    const { myBalance } = useWallet();
    const { duffsInDash, dashInDuffs } = useRates();

    const { getUserLabel } = useContacts();
    const store = useStore();
    const router = useRouter();

    const { getRequestByReplyToId } = useChats();

    const flow = ref("");
    const flows = function () {
      if (
        (props.msg.data.request && props.msg._direction === "RECEIVED") ||
        (!props.msg.data.request && props.msg._direction === "SENT")
      ) {
        return (flow.value = "outflow");
      } else if (
        (!props.msg.data.request && props.msg._direction === "RECEIVED") ||
        (props.msg.data.request && props.msg._direction === "SENT")
      ) {
        return (flow.value = "inflow");
      }
    };

    const newDashBalance = computed(() => {
      let balance;
      if (flow.value === "outflow") {
        balance = myBalance.value - props.msg.data.amount;
      }
      if (flow.value === "inflow") {
        balance = myBalance.value + props.msg.data.amount;
      }
      return duffsInDash.value(balance);
    });

    const openRequest = function () {
      if (
        props.msg.data.request &&
        store.getters.getRequestByReplyToId(props.msg.id.toString())?.data
          .request !== "accept" &&
        store.getters.getRequestByReplyToId(props.msg.id.toString())?.data
          .request !== "decline"
      ) {
        return true;
      }
    };

    // const closedRequest = function () {
    //   if (
    //     store.getters.getRequestByReplyToId(props.msg.id.toString())?.data
    //       .request === "accept" ||
    //     store.getters.getRequestByReplyToId(props.msg.id.toString())?.data
    //       .request === "decline"
    //   ) {
    //     return true;
    //   }
    // };

    const title = computed(() => {
      // open request
      if (openRequest())
        return props.msg._direction === "SENT"
          ? "Your Request"
          : store.getters.getUserLabel(props.friendOwnerId) + "'s Request";
      // request: received && accepted
      else if (
        props.msg._direction === "RECEIVED" &&
        store.getters.getRequestByReplyToId(props.msg.id.toString())?.data
          .request === "accept"
      )
        return "You Sent (Accepted Request)";
      // request: sent && accepted
      else if (
        props.msg._direction === "SENT" &&
        store.getters.getRequestByReplyToId(props.msg.id.toString())?.data
          .request === "accept"
      )
        return "You Received (Accepted Request)";
      // not a request
      else return props.msg._direction === "SENT" ? "You sent" : "You received";
      // disabled ability to click and view declined requests in ChatTxn.vue
    });

    const declineRequestWrapper = () => {
      emit("declineRequest");
      // TODO keep modal open onError and show error message
      modalController.dismiss();
    };

    const { sendChat } = useChats();

    const sendRequestAmount = () => {
      // TODO send DIP15 L1 tx
      // TODO amount is mocked and should come from request msg
      sendChat(
        "",
        props.friendOwnerId,
        duffsInDash.value(props.msg.data.amount),
        "accept",
        props.msg.id.toString()
      );
      // TODO keep modal open onError and show error message
      modalController.dismiss();
    };

    const cancel = () => {
      modalController.dismiss();
    };

    function copyToClipboard() {
      navigator.clipboard.writeText("Xcu5iYBH...FHrFVdYu").then(
        function () {
          store.dispatch("showToast", {
            text: "Copied message text",
            type: "copiedtoast",
            icon: "copyIcon",
          });
          console.log(
            "Copying to clipboard was successful! Message: ",
            props.msg.data.text
          );
        },
        function (err) {
          console.error("Could not copy text: ", err);
        }
      );
    }

    return {
      myBalance,
      newDashBalance,
      sendRequestAmount,
      cancel,
      emit,
      declineRequestWrapper,
      arrowDownOutline,
      closeOutline,
      duffsInDash,
      getUserLabel,
      title,
      copyOutline,
      copyToClipboard,
      router,
      getRequestByReplyToId,
      flows,
      openRequest,
      // closedRequest,
    };
  },
});
</script>

<template>
  <ion-content class="ion-padding">
    <div class="flex ion-nowrap ion-padding-bottom">
      <ion-icon :icon="closeOutline" class="close" @click="cancel"></ion-icon>
      <div v-if="flows() === 'inflow'" class="title green flex ion-nowrap">
        <ion-icon
            class="header-icon"
            :src="RequestHeaderSvg"
        />
        {{ title }}
      </div>
      <div v-else class="title purple flex ion-nowrap">
        <ion-icon
            class="header-icon"
            :src="SendHeaderSvg"
        />
        {{ title }}
      </div>
    </div>
    <div
        class="transaction"
        :class="{
        outflow: flows() === 'outflow',
        inflow: flows() === 'inflow',
      }"
    >
      <MyFriend
          v-if="flows() === 'inflow'"
          :sendRequestDirection="msg._direction"
          :friendOwnerId="friendOwnerId"
      ></MyFriend>
      <MySelf
          v-if="flows() === 'outflow'"
          :amount="duffsInDash(msg.data.amount)"
          :sendRequestDirection="msg._direction"
          :newDashBalance="newDashBalance"
      ></MySelf>
      <div class="line" />
      <MySelf
          v-if="flows() === 'inflow'"
          :amount="duffsInDash(msg.data.amount)"
          :sendRequestDirection="msg._direction"
          :newDashBalance="newDashBalance"
      ></MySelf>
      <MyFriend
          v-if="flows() === 'outflow'"
          :sendRequestDirection="msg._direction"
          :friendOwnerId="friendOwnerId"
      ></MyFriend>
      <ion-icon
          class="arrow"
          :src="ArrowDownSvg"
      ></ion-icon>
    </div>

    <!-- only show if request is open && outflow (i.e. a received request) && newDashBalance < 0 -->
    <span
        class="funds"
        v-if="openRequest() && flows() === 'outflow' && newDashBalance < 0"
    >Not enough funds to pay this request.</span
    >
    <div class="swap-container">
      <Accept
          :amount="duffsInDash(msg.data.amount)"
          :fiatAmount="msg.data.fiatAmount"
          :direction="msg._direction"
      >
      </Accept>
    </div>

    <div class="message-text" v-if="msg.data.text">
      {{
        msg._direction === "RECEIVED"
            ? getUserLabel(friendOwnerId) + "'s Request Message:"
            : "Your Request Message:"
      }}
    </div>
    <ion-textarea
        class="show-message"
        readonly
        :value="msg.data.text"
    ></ion-textarea>
    <!-- TODO hard-coded address for now | display actual dash address once L1 functionality is added -->
    <div
        class="centerheader"
        v-if="
        !msg.data.request ||
        getRequestByReplyToId(msg.id.toString())?.data.request === 'accept' ||
        getRequestByReplyToId(msg.id.toString())?.data.request === 'decline'
      "
    >
      <ion-label class="address">Xcu5iYBH...FHrFVdYu</ion-label>
      <ion-icon
          :icon="copyOutline"
          class="copyicon"
          @click="copyToClipboard()"
      ></ion-icon>
    </div>
  </ion-content>
  <ion-footer class="ion-no-border ion-padding">
    <ion-toolbar>
      <!-- show Decline/Send buttons only if request is received and open -->
      <div v-if="msg.data.request">
        <div
            v-if="
            msg._direction === 'RECEIVED' &&
            getRequestByReplyToId(msg.id.toString())?.data.request !==
              'accept' &&
            getRequestByReplyToId(msg.id.toString())?.data.request !== 'decline'
          "
            class="flex ion-nowrap"
        >
          <ion-chip class="decline" @click="declineRequestWrapper"
          ><span class="request-text purple"> Decline</span></ion-chip
          >
          <ion-chip
              class="send"
              @click="sendRequestAmount"
              :disabled="newDashBalance < 0"
          ><span class="send-text request-text"> Send</span></ion-chip
          >
        </div>
        <!-- show Cancel request button only if you sent a request and it's still open -->
        <div
            v-if="msg._direction === 'SENT' && openRequest()"
            class="flex ion-nowrap"
        >
          <ion-chip class="cancelit" expand="block"
          ><span class="cancel-text"> Cancel Request</span></ion-chip
          >
        </div>
      </div>
      <!-- Open explorer to view completed transaction if it's not a request or if the request is closed -->
      <div
          v-if="
          !msg.data.request ||
          getRequestByReplyToId(msg.id.toString())?.data.request === 'accept' ||
          getRequestByReplyToId(msg.id.toString())?.data.request === 'decline'
        "
          class="flex ion-justify-content-center"
      >
        <a target="_blank" href="https://insight.dash.org/insight/">
          <ion-chip class="explorer">
            <span class="explorer-text">Open explorer</span></ion-chip
          >
        </a>
      </div>
    </ion-toolbar>
  </ion-footer>
</template>

<style scoped>
a {
  text-decoration: none;
}
.title {
  position: fixed;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 12px;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  display: flex;
  align-items: center;
}
.header-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: flex-start;
  margin-right: 8px;
}
.transaction {
  border-radius: 10px;
  position: relative;
}
ion-item {
  --background: none;
  --min-height: 70px;
}
.switch {
  width: 35px;
  height: 35px;
  color: #6c69fc;
  position: absolute;
  top: 50%;
  right: 33.5px;
  transform: translate(50%, -50%);
  z-index: 1;
}
.arrow {
  position: absolute;
  z-index: 1;
  top: 50%;
  transform: translate(27px, -50%);
  height: 15px;
}
.swap {
  width: 35px;
  height: 35px;
  position: absolute;
  top: 50%;
  right: 14px;
  transform: translate(0%, -50%);
}
.message-text {
  margin: 40px 0px -30px 0px;

  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 18px;
  color: #a3a3a3;
}
.message-input {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  min-height: 44px;

  background: #f5f5f7;

  border: 0.5px solid rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
  border-radius: 10px;
}
.input-format {
  color: #000000;
}
.swap-container {
  margin-top: 36px;
}
.address {
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #000000;
  margin-top: 30px;
  margin: auto;
}
.copyicon {
  color: #6c69fc;
  margin-left: 8px;
}
ion-chip {
  display: flex;
  flex-direction: row;
  justify-content: center;
  /* align-items: center;
  /* padding: 13px 148px; */
  border-radius: 10px;

  width: 158px;
  height: 44px;
}
.send {
  width: 158px;
  height: 44px;
  background: linear-gradient(40.37deg, #6a67fb 0.15%, #8d71ff 100%);
}
.decline {
  width: 158px;
  height: 44px;
  background: #f2f4ff;
}
.cancelit {
  width: 328px;
  height: 43px;
  margin: auto;
  background: #f2f4ff;
  border-radius: 10px;
}
.cancel-text {
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 17px;
  text-transform: capitalize;
  color: #6c69fc;
}

.message-text {
  text-align: center;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 18px;
  color: #a3a3a3;
}
.request-text {
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 18px;
}
.send-text {
  color: #ffffff;
}
.line {
  position: absolute;
  width: 256px;
  border-bottom: 1px solid #e6e6e6;
  left: 72px;
}
.show-message {
  /* width: 194px; */
  font-style: normal;
  font-weight: normal;
  font-size: 15px;
  line-height: 18px;
  text-align: center;
  color: #000000;
  margin: 34px auto 0 auto;
}
.funds {
  /* width: 210px; */
  height: 15px;
  margin: 10px auto 0px auto;
  display: flex;
  justify-content: center;

  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 15px;

  color: #ff627e;
}
.explorer {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 10px 15px;

  width: 136px;
  height: 40px;

  background: #f2f4ff;
  border-radius: 20px;
}
.explorer-text {
  /* width: 96px;
  height: 17px; */
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: #6c69fc;
}
</style>