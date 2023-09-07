<script>
import { IonIcon } from "@ionic/vue";
import { checkmarkDoneOutline } from "ionicons/icons";
import UserSentSvg from '../../../public/assets/icons/userSent.svg'
import PartnerSentSvg from '../../../public/assets/icons/partnerSent.svg'

// import { reactive } from "vue";

export default {
  props: ["direction", "amount"],
  components: {
    IonIcon,
  },
  data() {
    return {
      UserSentSvg,
      PartnerSentSvg,
    }
  },
  setup() {
    return {
      checkmarkDoneOutline,
    };
  },
};
</script>

<template>
  <div
      class="chatbubble_txn_small"
      style=""
      :class="{
      user: direction.toUpperCase() === 'SENT',
      chat_partner_txn: direction.toUpperCase() === 'RECEIVED',
    }"
  >
    <div class="sameline">
      <ion-icon
          v-if="direction.toUpperCase() === 'SENT'"
          class="dash_icon_small"
          :src="UserSentSvg"
      ></ion-icon>
      <ion-icon
          v-else-if="direction.toUpperCase() === 'RECEIVED'"
          class="dash_icon_small"
          :src="PartnerSentSvg"
      ></ion-icon>

      <div class="leftpadding">
        <div class="amount">{{ amount }} Dash</div>
        <div class="usdamount">~{{ (amount * 175).toFixed(2) }} USD</div>
      </div>
    </div>
    <div class="alignrow">
      <div class="chat_timestamp">
        {{ new Date().getHours() }}:{{ new Date().getMinutes(2) }}
        <!-- {{ msg.createdAt.getHours() }}:{{ msg.createdAt.getMinutes() }} -->
      </div>
      <ion-icon
          class="align_checkmark checkmark_color"
          :icon="checkmarkDoneOutline"
      >
      </ion-icon>
    </div>
  </div>
</template>

<style scoped>
.chatbubble_txn_small {
  display: flex;
  flex-wrap: nowrap;
  margin: 6px 0px;
  padding-bottom: 3px;
  padding-top: 3px;
  padding-right: 13px;
  min-width: 181px;
  height: 34px;
  justify-content: space-between;
  box-shadow: 0px 2px 4px rgba(106, 103, 251, 0.3);
  border-radius: 100px;
}
.sameline {
  display: flex;
  wrap: nowrap;
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
  /* font-family: Inter; */
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 15px;
  /* identical to box height */

  letter-spacing: -0.003em;

  color: #000000;
}

.usdamount {
  /* font-family: Inter; */
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  font-style: normal;
  font-weight: 500;
  font-size: 9px;
  line-height: 11px;
  /* identical to box height */

  letter-spacing: -0.004em;

  color: rgba(0, 0, 0, 0.4);
}
.alignrow {
  display: flex;
  wrap: nowrap;
  align-items: flex-end;
}
</style>