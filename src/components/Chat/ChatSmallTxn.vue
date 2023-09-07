<script lang="ts">
import { IonIcon, IonModal, IonSpinner } from "@ionic/vue";
import { checkmarkDoneOutline } from "ionicons/icons";
import { ref, computed } from "vue";
import { useStore } from "vuex";
import useRates from "@/composables/rates";
import ReplyPopover from "@/components/Chat/ReplyPopover.vue";
import ViewRequestModal from "@/components/TransactionModals/ViewRequestModal.vue";
import UserSentSvg from '../../../public/assets/icons/userSent.svg'
import PartnerSentSvg from '../../../public/assets/icons/partnerSent.svg'

export default {
  props: ["msg", "friendOwnerId", "isReply"],
  components: {
    IonIcon,
    IonModal,
    ReplyPopover,
    ViewRequestModal,
    IonSpinner,
  },
  data() {
    return {
      UserSentSvg,
      PartnerSentSvg,
    }
  },
  setup(props: any) {
    const { duffsInDash, duffsInFiatString, getFiatSymbol } = useRates();
    const hover = ref(false);
    const store = useStore();

    const isViewRequestModalOpen = ref(false);

    const showViewRequestModal = async (state: boolean) => {
      isViewRequestModalOpen.value = state;
    };

    const hours = computed(() => props.msg.createdAt.getHours());

    const mins = computed(() =>
      ("0" + props.msg.createdAt.getMinutes()).slice(-2)
    );

    return {
      checkmarkDoneOutline,
      showViewRequestModal,
      isViewRequestModalOpen,
      duffsInDash,
      duffsInFiatString,
      getFiatSymbol,
      hover,
      store,
      hours,
      mins,
    };
  },
};
</script>

<template>
  <div
      class="chatbubble_txn_small"
      style="position: relative"
      :class="{
      user: msg._direction?.toUpperCase() === 'SENT',
      chat_partner_txn: msg._direction?.toUpperCase() === 'RECEIVED',
      user_txn: msg._direction?.toUpperCase() === 'SENT',
    }"
      @mouseover="hover = true"
      @mouseleave="hover = false"
      @click="showViewRequestModal(true)"
  >
    <div class="flex ion-nowrap">
      <ion-icon
          v-if="msg._direction?.toUpperCase() === 'SENT'"
          class="dash_icon_small"
          :src="UserSentSvg"
      ></ion-icon>
      <ion-icon
          v-else-if="msg._direction?.toUpperCase() === 'RECEIVED'"
          class="dash_icon_small"
          :src="PartnerSentSvg"
      ></ion-icon>

      <div class="leftpadding">
        <div class="amount">{{ duffsInDash(msg.data.amount) }} Dash</div>
        <div class="usdamount">
          ~{{ msg.data.fiatAmount?.toFixed(2) }} {{ msg.data.fiatSymbol }}
        </div>
      </div>
    </div>
    <div class="alignrow">
      <div class="chat_timestamp">{{ hours }}:{{ mins }}</div>
      <!-- prop passed from LegacyPaymentContent, show checkmark if transaction is instant locked -->
      <ion-icon
          v-if="
          (msg._direction === 'SENT' && msg._state != 'sending') ||
          msg._state != 'false'
        "
          class="align_checkmark checkmark_color"
          :icon="checkmarkDoneOutline"
      >
      </ion-icon>
      <ReplyPopover
          style="margin-bottom: 25px"
          v-if="!isReply"
          :hover="hover"
          :msg="msg"
          :friendOwnerId="friendOwnerId"
      ></ReplyPopover>
      <ion-spinner
          v-if="msg._state === 'sending'"
          name="lines-small"
          color="medium"
      ></ion-spinner>
    </div>

    <ion-modal
        :is-open="isViewRequestModalOpen"
        @didDismiss="showViewRequestModal(false)"
    >
      <ViewRequestModal
          v-if="!isReply"
          :friendOwnerId="friendOwnerId"
          :msg="msg"
      ></ViewRequestModal>
    </ion-modal>
  </div>
</template>

<style scoped>
.chatbubble_txn_small {
  display: flex;
  /* display: inline-block; */
  flex-wrap: nowrap;
  padding-bottom: 3px;
  padding-top: 3px;
  padding-right: 13px;
  margin-bottom: 6px;
  width: 174px;
  justify-content: space-between;
  border-radius: 100px;
}
.dash_icon_small {
  width: 27px;
  height: 27px;
  margin-left: 4px;
}
.leftpadding {
  padding-left: 7px;
}

.amount {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-weight: 600;
  font-style: normal;
  font-size: 12px;
  line-height: 15px; /* identical to box height */
  letter-spacing: -0.003em;
  color: #000000;
}

.usdamount {
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  font-style: normal;
  font-weight: 500;
  font-size: 9px;
  line-height: 11px; /* identical to box height */
  letter-spacing: -0.004em;
  color: rgba(0, 0, 0, 0.4);
}
.alignrow {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-end;
}
</style>
