<template>
  <div
    class="chatbubble chatbubble_txn_big"
    :class="{
      user: msg._direction === 'SENT',
      chat_partner_txn: msg._direction === 'RECEIVED' && !msg.data.request,
      request: msg.data.request,
    }"
  >
    <div
      class="title"
      :class="{
        transfer_title: !msg.data.request,
        request_title: msg.data.request,
      }"
    >
      {{ title }}
    </div>
    <div class="amount">{{ msg.data.amount }} Dash</div>
    <div class="usd_amount">~{{ msg.data.amount * 175 }} USD</div>
    <div class="text">{{ msg.data.text }}</div>
    <div class="justify">
      <ion-icon
        v-if="msg.data.request"
        class="dash_icon"
        :src="require('/public/assets/icons/dashRequest.svg')"
      ></ion-icon>
      <ion-icon
        v-else-if="msg._direction === 'SENT'"
        class="dash_icon"
        :src="require('/public/assets/icons/userSent.svg')"
      ></ion-icon>
      <ion-icon
        v-else-if="msg._direction === 'RECEIVED'"
        class="dash_icon"
        :src="require('/public/assets/icons/partnerSent.svg')"
      ></ion-icon>
      <div class="align_checkmark">
        <div class="chat_timestamp">
          {{ msg.createdAt.getHours() }}:{{ msg.createdAt.getMinutes() }}
        </div>
        <ion-icon :icon="checkmarkDoneOutline" class="checkmark_color">
        </ion-icon>
      </div>
    </div>
  </div>
</template>

<script>
import { IonIcon } from "@ionic/vue";
import { checkmarkDoneOutline } from "ionicons/icons";
import { computed } from "vue";

export default {
  props: ["msg", "friendOwnerId"],
  components: {
    IonIcon,
  },
  setup(props) {
    const title = computed(() => {
      if (props.msg.data.request) {
        return "Requested";
      } else if (props.msg._direction === "SENT" && !props.msg.data.request) {
        return "You Sent";
      } else if (
        props.msg._direction === "RECEIVED" &&
        !props.msg.data.request
      ) {
        return props.friendOwnerId + "Sent";
      } else {
        return "";
      }
    });

    // 1. plain chat text no txn
    // 2. plain text wth txn
    // 3. txn with no text
    // 4. open a request
    // 5. reject a request
    // 6. pay a request

    return {
      checkmarkDoneOutline,
      title,
    };
  },
};
</script>

<style scoped>
.chatbubble_txn_big {
  min-height: 77px;
  width: 174px;
  box-shadow: 0px 2px 4px rgba(106, 103, 251, 0.3);
}
.title {
  /* font-family: Inter; */
  font-style: normal;
  font-weight: 600;
  font-size: 10px;
  line-height: 12px;
  text-align: center;
}
.transfer_title {
  color: #6a67fb;
}
.request_title {
  color: #999999;
}
.amount {
  /* font-family: Inter; */
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  /* identical to box height */

  display: flex;
  justify-content: center;
  letter-spacing: -0.003em;

  color: #000000;
  margin-top: 3px;
}
.usd_amount {
  /* font-family: Inter; */
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
  /* font-family: Inter; */
  display: flex;
  wrap: wrap;
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
  margin-bottom: -6px;
  margin-left: -10px;
}
</style>