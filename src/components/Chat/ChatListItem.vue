<template>
  <ion-item>
    <ion-avatar slot="start" class="avatar">
      <img :src="store.getters.getUserAvatar(chatListItem.friendOwnerId)" />
    </ion-avatar>
    <ion-label
      :class="{
        messagebold: chatListItem.direction === 'RECEIVED',
      }"
    >
      <h1>
        <ion-icon
          v-if="chatListItem.friendshipState === 'UNLINKED'"
          :src="unlink"
        ></ion-icon>
        {{ getUserLabel(chatListItem.friendOwnerId) }}

        <div class="message-time">
          {{ chatListItem.lastMessage.createdAt.getHours() }}:{{
            chatListItem.lastMessage.createdAt.getMinutes()
          }}
        </div>
      </h1>
      <p>
        {{ chatListItem.lastMessage.data.text }}
        <ion-chip
          v-if="true"
          :class="{
            received: true,
            sent: false,
          }"
          >{{ chatListItem.amount }} Dash
          <ion-icon
            class="sent-receive-icon"
            v-if="true"
            :src="require('/public/assets/icons/receiveDash.svg')"
          />
          <ion-icon
            v-if="false"
            class="sent-receive-icon"
            :src="require('/public/assets/icons/sendDash.svg')"
          />
        </ion-chip>
        <ion-badge>1</ion-badge>
        <ion-icon
          v-if="true"
          class="dash-viewed"
          :src="require('/public/assets/icons/D.svg')"
        />
      </p>
    </ion-label>
  </ion-item>
</template>

<script>
import {
  IonItem,
  IonAvatar,
  IonChip,
  IonBadge,
  IonLabel,
  IonIcon,
} from "@ionic/vue";

import { unlink } from "ionicons/icons";

import { useStore } from "vuex";

export default {
  components: {
    IonItem,
    IonAvatar,
    IonChip,
    IonBadge,
    IonLabel,
    IonIcon,
  },
  props: ["chatListItem"],
  setup(props) {
    console.log("props :>> ", props);
    console.log("props :>> ", props.chatListItem);
    console.log("props :>> ", props.chatListItem.friendOwnerId);
    const store = useStore();
    const { getUserLabel, getUserAvatar } = store.getters;

    return {
      getUserLabel,
      getUserAvatar,
      unlink,
      store,
    };
  },
};
</script>

<style>
.avatar {
  width: 50px;
  height: 50px;
}

.sc-ion-label-md-s h1 {
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 17px;
  color: #000000;
}
.sc-ion-label-md-s p {
  /* font-family: Inter; */
  font-weight: 500;
  font-size: 13px important!;
  line-height: 18px; /* identical to box height, or 138% */
  letter-spacing: -0.003em;
  color: #919191;
}
.message-time {
  float: right;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 15px;

  letter-spacing: -0.003em;
  color: #858585;
}

.squareborder {
  border-radius: 10px;
}
.messagebold > p {
  font-weight: 500;
  color: #000000;
}

.sent-receive-icon {
  width: 8px;
  height: 10px;
}

.received {
  background: #eaf9f9;
  color: #36bfac;
  border-radius: 11.5px;
  display: flex no-wrap;
  justify-content: center;
  align-items: center;
  padding: 4px 11px;
  height: 23px;
  /* font-family: Inter; */
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: -0.003em;
}
.sent {
  background: #f2f4ff;
  color: #6a67fb;
  border-radius: 11.5px;
  display: flex no-wrap;
  justify-content: center;
  align-items: center;
  padding: 4px 11px;
  height: 23px;
  /* font-family: Inter; */
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: -0.003em;
}
.dash-viewed {
  width: 20px;
  height: 20px;
  float: right;
}
ion-badge {
  --background: linear-gradient(38.82deg, #6a67fb 12.59%, #8d71ff 92.59%);
  float: right;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  margin-left: 5px;
}
</style>