<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start"
        >
          <ion-back-button
              style="color: #6c69fc"
              :icon="arrowBack"
          ></ion-back-button
          >
        </ion-buttons>
        <ion-title class="headername">Redeem Invite</ion-title>
      </ion-toolbar>
    </ion-header>
    <!-- <ion-content :fullscreen="true"> </ion-content> -->
    <ion-content :fullscreen="true" center text-center class="align">
      <ion-grid>
        <ion-row>
          <ion-col>
            <h1 class="smalldescription">Your balance</h1>
            <h1 no-padding no-margin class="bigdescription">
              {{ myDashBalance }} Dash
            </h1>
            <h1
                v-if="myDashBalance < SIGNUP_FEE"
                text-uppercase
                no-padding
                no-margin
                class="mediumdescription"
            >
              Redeeming invite code...
            </h1>

            <h3 v-else no-padding no-margin class="mediumdescription">
              Success, we can now finish the registration.
            </h3>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
    <ion-footer class="ion-no-border">
      <ion-toolbar>
        <ion-chip
            expand="block"
            class="nextbutton next-color ion-padding-horizontal"
            :disabled="myDashBalance < SIGNUP_FEE"
            @click="() => router.push('/finishregistration')">
          <span class="next-text">Create Account</span>
        </ion-chip>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import useWallet from "@/composables/wallet";

import {onMounted, onUnmounted, ref} from "vue";
import {useRouter} from "vue-router";

import axios from "axios";

import {arrowBack} from "ionicons/icons";

import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonChip,
  IonGrid,
  IonCol,
  IonRow,
  IonFooter,
} from "@ionic/vue";

import Dash from "@/lib/Dash";

// import { Client } from "dash/dist/src/SDK/Client/index";

export default {
  name: "RedeemInvite",
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonBackButton,
    IonButtons,
    IonContent,
    IonPage,
    IonChip,
    IonGrid,
    IonCol,
    IonRow,
    IonFooter,
  },
  setup() {
    const SIGNUP_FEE = 0.01;
    const {myDashBalance, startRefreshWalletDataLoop, stopRefreshWalletDataLoop} = useWallet();
    startRefreshWalletDataLoop();
    const router = useRouter();
    const isRedeemed = ref(false);

    const redeemInvite = async () => {
      const account = await Dash.account()
      const address = account?.getUnusedAddress().address;
      console.log("Redeem invite to address: ", address);

      // TODO: There isn't any auto-faucet stuff any more.
      // Just display the address and wait for them to top it up...

      return
    };

    onMounted(async () => {
      await redeemInvite(); // TODO reenable
      isRedeemed.value = true;
    });

    onUnmounted(stopRefreshWalletDataLoop)

    return {
      myDashBalance,
      redeemInvite,
      router,
      isRedeemed,
      arrowBack,
      SIGNUP_FEE,
    };
  },
};
</script>

<style scoped>
.smalldescription {
  /* font-family: Inter; */
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: -0.003em;
  color: #818c99;
  text-align: center;

  flex: none;
  order: 0;
  flex-grow: 0;
  margin: 0px 4px;
}

.bigdescription {
  font-style: normal;
  font-weight: 600;
  font-size: 28px;
  line-height: 34px;
  color: #000000;
  margin: auto;
  text-align: center;
}

.create {
  text-transform: capitalize;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  text-align: center;
}

.align {
  display: flex;
  justify-content: center;
  position: absolute;
  top: 35%;
}
</style>
