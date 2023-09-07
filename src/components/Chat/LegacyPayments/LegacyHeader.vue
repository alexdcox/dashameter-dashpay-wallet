<template>
  <ion-buttons slot="start">
    <ion-icon
        @click="router.push('/home')"
        class="back"
        :icon="arrowBack"
    ></ion-icon>
    <!-- <ion-back-button default-href="/home" :icon="arrowBack"></ion-back-button> -->
  </ion-buttons>
  <ion-avatar slot="start" class="useravatar">
    <img class="squareborder" :src="DashPng" />
  </ion-avatar>
  <div class="username">Legacy Payments</div>
  <ion-buttons slot="end">
    <ion-button
    >
      <ion-icon :icon="ellipsisVertical" class="ellipsis_color"></ion-icon
      >
    </ion-button>
  </ion-buttons>
</template>

<script>
import {
  IonAvatar,
  IonButtons,
  IonButton,
  IonIcon,
  // IonBackButton,
} from "@ionic/vue";
import DashPng from '../../../../public/assets/avatars/dash.png'
import {arrowBack, ellipsisVertical} from "ionicons/icons";
import {useRouter} from "vue-router";

export default {
  props: ["friendOwnerId"],
  components: {
    IonAvatar,
    IonButtons,
    IonButton,
    IonIcon,
    // IonBackButton,
    // chats,
  },
  data() {
    return {DashPng}
  },
  setup() {
    const router = useRouter();
    return {
      arrowBack,
      ellipsisVertical,
      router,
    };
  },
};
</script>

<style scoped>
/* ion-back-button {
  color: rgba(0, 0, 0, 0.5);
  font-weight: 100;
  --ionicon-stroke-width: 10px;
} */

.back {
  margin-left: 16px;
  width: 22px;
  height: 22px;
  color: #6c69fc;
}

.useravatar {
  display: flex;
  align-items: center;
  justify-content: left;
  border-radius: 10px;
}

.squareborder {
  border-radius: 10px;
  margin-left: 16px;
}

.useravatar > img {
  height: 30px;
  width: 30px;
}

.username {
  font-style: normal;
  font-size: 16px;
  font-weight: 600;
  line-height: 19px;
  color: #000000;
  margin-left: -6px;
}

.ellipsis_color {
  color: rgba(0, 0, 0, 0.61);
}
</style>
