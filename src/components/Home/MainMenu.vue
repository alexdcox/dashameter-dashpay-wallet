<script lang="ts">
import {
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  popoverController,
  modalController,
} from "@ionic/vue";
import { useRouter } from "vue-router";
import {
  qrCodeOutline,
  personAddOutline,
  personCircleOutline,
  newspaperOutline,
  settingsOutline,
} from "ionicons/icons";
import DashdPurpleSvg from '../../../public/assets/icons/dashd-purple.svg'
import ShowQRCode from "@/views/ShowQRCode.vue";
export default {
  name: "MainMenu",
  components: {
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
  },
  data() {
    return {
      DashdPurpleSvg,
    }
  },
  setup() {
    const router = useRouter();

    const openQRCodeModal = async () => {
      const modal = await modalController.create({
        component: ShowQRCode,
        cssClass: "viewrequest",
      });
      popoverController.dismiss();
      return modal.present();
    };

    return {
      router,
      popoverController,
      qrCodeOutline,
      personCircleOutline,
      personAddOutline,
      newspaperOutline,
      settingsOutline,
      openQRCodeModal,
    };
  },
};
</script>

<template>
  <div>
    <ion-list>
      <ion-item
          lines="none"
          button
          @click="popoverController.dismiss() && router.push('/editprofile')"
      >
        <ion-icon class="graphic" :icon="personCircleOutline"></ion-icon>
        <ion-label>Edit my Profile</ion-label>
      </ion-item>
      <ion-item lines="none" button @click="openQRCodeModal">
        <ion-icon class="graphic d" :icon="qrCodeOutline"></ion-icon>
        <ion-label>Show my QR code</ion-label>
      </ion-item>
      <ion-item lines="none">
        <ion-icon class="graphic d" :icon="personAddOutline"></ion-icon>
        <ion-label>Invite a friend</ion-label>
      </ion-item>
      <ion-item lines="none">
        <ion-icon
            class="graphic d"
            :src="DashdPurpleSvg"
        ></ion-icon>
        <ion-label>Transactions</ion-label>
      </ion-item>
      <ion-item lines="none">
        <ion-icon class="graphic d" :icon="newspaperOutline"></ion-icon>
        <ion-label>News & Updates</ion-label>
      </ion-item>
      <ion-item
          lines="none"
          button
          @click="popoverController.dismiss() && router.push('/settings')"
      >
        <ion-icon class="graphic d" :icon="settingsOutline"></ion-icon>
        <ion-label>Settings</ion-label>
      </ion-item>
    </ion-list>
  </div>
</template>

<style scoped>
.graphic {
  margin-right: 12px;
  color: #6c69fc;
}
.d {
  height: 18px;
  width: 18px;
  margin-left: 2px;
}
</style>
