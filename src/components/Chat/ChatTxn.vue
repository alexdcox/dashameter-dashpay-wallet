<script lang="ts">
import {
  IonLabel,
  IonChip,
  IonRow,
  IonIcon,
  IonModal,
  IonSpinner,
} from "@ionic/vue";
import { checkmarkDoneOutline, closeOutline } from "ionicons/icons";
import { computed, ref } from "vue";
import { useStore } from "vuex";

import ViewRequestModal from "@/components/TransactionModals/ViewRequestModal.vue";
import useContacts from "@/composables/contacts";
import useChats from "@/composables/chats";
import useRates from "@/composables/rates";
import ReplyPopover from "@/components/Chat/ReplyPopover.vue";
import DashRequestSvg from '../../../public/assets/icons/dashRequest.svg'
import UserSentSvg from '../../../public/assets/icons/userSent.svg'
import PartnerSentSvg from '../../../public/assets/icons/partnerSent.svg'

export default {
  props: ["msg", "friendOwnerId", "isReply"],
  components: {
    IonIcon,
    IonLabel,
    IonChip,
    IonRow,
    IonModal,
    ViewRequestModal,
    ReplyPopover,
    IonSpinner,
  },
  data() {
    return {
      DashRequestSvg,
      UserSentSvg,
      PartnerSentSvg,
    }
  },
  setup(props: any) {
    const store = useStore();

    const { duffsInDash, duffsInFiatString, getFiatSymbol } = useRates();
    const hover = ref(false);

    const { sendChat, getRequestByReplyToId } = useChats();
    const declineRequest = () => {
      // TODO amount is mocked and should come from request msg
      sendChat(
        "",
        props.friendOwnerId,
        duffsInDash.value(props.msg.data.amount),
        "decline",
        props.msg.id.toString()
      );
    };

    const mins = computed(() =>
      ("0" + props.msg.createdAt.getMinutes()).slice(-2)
    );

    const { getUserLabel } = useContacts();

    const title = computed(() => {
      if (props.msg.data.request) {
        return props.msg._direction === "SENT"
          ? "You Requested"
          : store.getters.getUserLabel(props.friendOwnerId) + " Requested";
      } else if (props.msg._direction === "SENT" && !props.msg.data.request) {
        return "You Sent";
      } else if (
        props.msg._direction === "RECEIVED" &&
        !props.msg.data.request
      ) {
        return getUserLabel.value(props.friendOwnerId) + " Sent";
      } else {
        return "";
      }
    });

    const isViewRequestModalOpen = ref(false);

    const showViewRequestModal = async (state: boolean) => {
      isViewRequestModalOpen.value = state;
    };

    return {
      checkmarkDoneOutline,
      title,
      closeOutline,
      declineRequest,
      showViewRequestModal,
      isViewRequestModalOpen,
      getRequestByReplyToId,
      duffsInDash,
      duffsInFiatString,
      getFiatSymbol,
      getUserLabel,
      hover,
      store,
      mins,
    };
  },
};
</script>

<template>
  <div
      class="chatbubble chatbubble_txn_big"
      style="position: relative"
      :class="{
      user: msg._direction === 'SENT',
      user_txn: msg._direction === 'SENT' && !msg.data.request,
      chat_partner_txn: msg._direction === 'RECEIVED' && !msg.data.request,
      request: msg.data.request === 'open',
      request_accepted_user:
        msg.data.request === 'accept' && msg._direction === 'SENT',
      request_accepted_partner:
        msg.data.request === 'accept' && msg._direction === 'RECEIVED',
      request_declined:
        getRequestByReplyToId(msg.id.toString())?.data.request === 'decline',
      nofloat: isReply === true,
    }"
      @mouseover="hover = true"
      @mouseleave="hover = false"
      @click="
      getRequestByReplyToId(msg.id.toString())?.data.request !== 'decline' ||
      !msg.data.request
        ? showViewRequestModal(true)
        : ''
    "
  >
    <!-- @click: enable ability to view request or transaction only if it is a completed transaction or a request that has not been declined -->
    <ReplyPopover
        v-if="!isReply"
        class="nowrap"
        :hover="hover"
        :msg="msg"
        :friendOwnerId="friendOwnerId"
        :isReply="isReply"
    ></ReplyPopover>

    <div
        class="title"
        :class="{
        transaction_title: !msg.data.request,
        request_title: msg.data.request,
      }"
    >
      <div
          v-if="
          getRequestByReplyToId(msg.id.toString())?.data.request === 'decline'
        "
      >
        <!-- Request (Declined) title -->
        <div v-if="msg._direction === 'SENT'">Your Request (Declined)</div>
        <div v-if="msg._direction === 'RECEIVED'">
          {{ getUserLabel(friendOwnerId) + "'s Request (Declined)" }}
        </div>
      </div>
      <div
          v-if="
          getRequestByReplyToId(msg.id.toString())?.data.request === 'accept'
        "
      >
        <!-- Request (Accepted) title -->
        <div>
          <span v-if="msg._direction === 'SENT'">Your Request</span>
          <span v-if="msg._direction === 'RECEIVED'">
            {{ getUserLabel(friendOwnerId) + "'s Request" }}
          </span>
          <span
              :class="{
              green: msg._direction === 'SENT',
              purple: msg._direction === 'RECEIVED',
            }"
          >
            (Accepted)</span
          >
        </div>
      </div>
      <!-- Request Open title -->
      <div
          v-if="
          getRequestByReplyToId(msg.id.toString())?.data.request !==
            'decline' &&
          getRequestByReplyToId(msg.id.toString())?.data.request !== 'accept'
        "
          :class="{
          green: msg._direction === 'SENT' && !msg.data.request,
          purple: msg._direction === 'RECEIVED' && !msg.data.request,
        }"
      >
        {{ title }}
      </div>
    </div>

    <div class="amount">{{ duffsInDash(msg.data.amount) }} Dash</div>
    <div class="usd_amount">
      ~{{ msg.data.fiatAmount?.toFixed(2) }} {{ msg.data.fiatSymbol }}
    </div>
    <div class="text">{{ msg.data.text }}</div>
    <div class="justify">
      <ion-icon
          v-if="msg.data.request"
          class="dash_icon"
          :src="DashRequestSvg"
      ></ion-icon>
      <ion-icon
          v-else-if="msg._direction === 'SENT'"
          class="dash_icon"
          :src="UserSentSvg"
      ></ion-icon>
      <ion-icon
          v-else-if="msg._direction === 'RECEIVED'"
          class="dash_icon"
          :src="PartnerSentSvg"
      ></ion-icon>
      <div class="align_checkmark">
        <div class="chat_timestamp">
          {{ msg.createdAt.getHours() }}:{{ mins }}
        </div>
        <ion-icon
            v-if="msg._direction === 'SENT' && msg._state != 'sending'"
            class="checkmark_color"
            :icon="checkmarkDoneOutline"
        >
        </ion-icon>
        <ion-spinner
            v-if="msg._state === 'sending'"
            name="lines-small"
            style="margin-bottom: -7px"
            color="medium"
        ></ion-spinner>
      </div>
    </div>
  </div>

  <!-- buttons below chat bubble depending on request/transaction status -->
  <ion-row
      v-if="
      msg.data.request &&
      msg._direction === 'RECEIVED' &&
      getRequestByReplyToId(msg.id.toString())?.data.request !== 'accept' &&
      getRequestByReplyToId(msg.id.toString())?.data.request !== 'decline'
    "
      class="ion-no-wrap"
  >
    <ion-chip class="decline" @click="declineRequest"
    ><ion-label class="decline_text">Decline</ion-label></ion-chip
    >
    <ion-chip class="accept" @click="showViewRequestModal(true)"
    ><ion-label class="accept_text">View</ion-label>
    </ion-chip>
  </ion-row>
  <ion-modal
      :is-open="isViewRequestModalOpen"
      @didDismiss="showViewRequestModal(false)"
  >
    <ViewRequestModal
        v-if="!isReply"
        :friendOwnerId="friendOwnerId"
        @declineRequest="declineRequest"
        :msg="msg"
    ></ViewRequestModal>
  </ion-modal>

  <ion-row
      v-if="
      msg.data.request &&
      msg._direction === 'SENT' &&
      getRequestByReplyToId(msg.id.toString())?.data.request !== 'accept' &&
      getRequestByReplyToId(msg.id.toString())?.data.request !== 'decline'
    "
      class="ion-nowrap"
      style="float: right"
  >
    <div class="flex ion-nowrap">
      <ion-chip class="decline"
      ><ion-label class="decline_text">Cancel</ion-label></ion-chip
      >
      <ion-chip class="accept" @click="showViewRequestModal(true)"
      ><ion-label class="accept_text">View</ion-label>
      </ion-chip>
    </div>
  </ion-row>
  <ion-modal
      :is-open="isViewRequestModalOpen"
      @didDismiss="showViewRequestModal(false)"
  >
    <ViewRequestModal
        v-if="!isReply"
        :friendOwnerId="friendOwnerId"
        @declineRequest="declineRequest"
        :msg="msg"
    ></ViewRequestModal>
  </ion-modal>
</template>

<style scoped>
.chatbubble_txn_big {
  min-height: 77px;
  width: 222px;
}
.title {
  font-style: normal;
  font-weight: 600;
  font-size: 10px;
  line-height: 12px;
  text-align: center;
}
.transaction_title {
  color: #6a67fb;
}
.request_title {
  color: #999999;
}
.request_accepted_user {
  background: #ffffff;
  filter: drop-shadow(0px 2px 4px rgba(54, 191, 172, 0.3)); /* green shadow */
}
.request_accepted_partner {
  background: #ffffff;
  box-shadow: 0px 2px 4px rgba(106, 103, 251, 0.3);
}
.request_declined {
  background: #f5f5f7;
  opacity: 0.55;
  box-shadow: 0px 0px 0px;
}
.amount {
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px; /* identical to box height */
  display: flex;
  justify-content: center;
  letter-spacing: -0.003em;
  color: #000000;
  margin-top: 3px;
}
.usd_amount {
  font-style: normal;
  font-weight: normal;
  line-height: 12px;
  font-weight: 500;
  font-size: 9px;
  line-height: 11px;
  display: flex;
  justify-content: center;
  letter-spacing: -0.002em;
  color: rgba(0, 0, 0, 0.4);
  margin-top: 2px;
}

.text {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 15px;
  text-align: center;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 4px;
}
.justify {
  display: flex;
  justify-content: space-between;
}
.dash_icon {
  width: 27px;
  height: 27px;
  margin-bottom: -5px;
  margin-left: -7px;
}

ion-chip {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 116px;
  height: 36px;
  /* TODO: check if need these properties for requests received: */
  /* width: 106px; */
  /* margin: 8px 12px 8px 0px; */
  margin: 8px 0px 8px 0px;
  border-radius: 10px;
}
.decline {
  --background: #f2f4ff;
  margin-right: 12px;
}
.decline_text {
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 18px;
  color: #6a67fb;
}
.decline_icon {
  --ionicon-stroke-width: 55px;
  color: #6a67fb;
}
.accept {
  --background: linear-gradient(40.37deg, #6a67fb 0.15%, #8d71ff 100%);
  /* border: f2f4ff solid 1px; */
}
.accept_text {
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 18px;
  color: #ffffff;
}
.accept_icon {
  height: 11px;
  width: 11px;
}
.nofloat {
  float: none;
}
</style>
