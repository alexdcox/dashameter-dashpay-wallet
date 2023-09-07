<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Create Wallet</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-item>
        <ion-label position="floating">Your mnemonic</ion-label>
        <ion-textarea readonly auto-grow :value="mnemonic"></ion-textarea>
      </ion-item>
      <ion-card style="margin-top: 40px">
        <ion-item> Your balance is: {{ balance }}</ion-item>
      </ion-card>
    </ion-content>
    <ion-footer class="ion-no-border">
      <ion-toolbar>
        <ion-button color="primary" expand="block" router-link="/redeeminvite"
          >Redeem Invite</ion-button
        >
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonCard,
  IonFooter,
  IonLabel,
  IonTextarea,
} from "@ionic/vue";

import DashClient from "@/lib/Dash";
import { Client } from "dash";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default {
  name: "CreateWallet",
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonTextarea,
    IonPage,
    IonButton,
    IonItem,
    IonCard,
    IonFooter,
    IonLabel,
  },
  setup() {
    let client: InstanceType<typeof Client>;
    const mnemonic = ref("");
    const balance = ref<number>();

    onMounted(async () => {
      // await sleep(450); // Don't block the viewport
      client = await DashClient.client()
      mnemonic.value = client.wallet!.exportWallet().toString();
      balance.value = client.account!.getTotalBalance();
    });

    return { mnemonic, balance };
  },
};
</script>
