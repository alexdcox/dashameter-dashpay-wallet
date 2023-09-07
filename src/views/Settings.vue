<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="app-header headername">
        <ion-buttons slot="start"
          ><ion-back-button
            default-href="/home"
            :icon="arrowBack"
            color="tertiary"
          ></ion-back-button
        ></ion-buttons>
        Settings
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-item class="ion-margin-horizontal ion-no-padding line" lines="none">
        <ion-avatar slot="start">
          <img :src="getUserAvatar(store.state.accountDPNS?.$ownerId)" />
        </ion-avatar>
        <ion-label class="ion-nowrap contentlabel">
          <div>
            <h2 class="accountname">
              {{ getUserLabel(store.state.accountDPNS?.$ownerId) }}
              <!-- {{ getUserLabel(store.state.accountDPNS?.$ownerId) }} -->
            </h2>
            <h3 class="displayname">
              {{ getUserDisplayName(store.state.accountDPNS?.$ownerId) }}
            </h3>
          </div>
          <ion-icon class="qr" :icon="qrCodeOutline"></ion-icon>
        </ion-label>
      </ion-item>

      <ion-list>
        <ion-list-header>
          <ion-label class="account">Account</ion-label>
        </ion-list-header>
        <ion-item @click="showChooseCurrencyModal(true)">
          <ion-icon :icon="cash" color="tertiary" class="format"></ion-icon>
          <ion-label class="currency">Payment Currency</ion-label>
          <ion-button fill="clear" color="tertiary" class="options">{{
            fiatSymbol
          }}</ion-button>
        </ion-item>
        <ion-item>
          <ion-icon :icon="flag" color="tertiary" class="format"></ion-icon>
          <ion-label>Language</ion-label>
          <ion-button fill="clear" color="tertiary" class="options"
            >English</ion-button
          >
        </ion-item>
        <ion-item>
          <ion-icon :icon="build" color="tertiary" class="format"></ion-icon>
          <ion-label>Theme</ion-label>
          <ion-button fill="clear" color="tertiary" class="options"
            >light</ion-button
          >
        </ion-item>
      </ion-list>
    </ion-content>
    <ion-modal
      :is-open="isChooseCurrencyModalOpen"
      @didDismiss="showChooseCurrencyModal(false)"
    >
      <ChooseCurrencyModal
        @chooseCurrency="chooseCurrency"
      ></ChooseCurrencyModal>
    </ion-modal>
  </ion-page>
</template>

<script lang="ts">
import {
  IonList,
  IonItem,
  IonLabel,
  IonListHeader,
  IonHeader,
  IonContent,
  IonPage,
  IonButtons,
  IonBackButton,
  IonToolbar,
  IonButton,
  IonIcon,
  IonModal,
} from "@ionic/vue";
import { Preferences } from "@capacitor/preferences";

import { arrowBack, qrCodeOutline, cash, build, flag } from "ionicons/icons";
import { useStore } from "vuex";
import { ref } from "vue";

import ChooseCurrencyModal from "@/components/Settings/ChooseCurrencyModal.vue";

import useRates from "@/composables/rates";
import useContacts from "@/composables/contacts";

export default {
  name: "Settings",
  components: {
    IonList,
    IonItem,
    IonLabel,
    IonButtons,
    IonBackButton,
    IonToolbar,
    IonListHeader,
    IonButton,
    IonHeader,
    IonContent,
    IonPage,
    ChooseCurrencyModal,
    IonIcon,
    IonModal,
  },

  setup() {
    const { commit, getters } = useStore();
    const store = useStore();
    const { refreshRate, getFiatSymbol } = useRates();

    const { getUserDisplayName, getUserAvatar, getUserLabel } = useContacts();

    const isChooseCurrencyModalOpen = ref(false);

    const fiatSymbol = ref(getFiatSymbol.value);

    const chooseCurrency = async (symbol: string) => {
      fiatSymbol.value = symbol;
      commit("setFiatSymbol", symbol);
      const writeResult = await Preferences.set({
        key: `fiatSymbol_${getters.myLabel}`,
        value: getFiatSymbol.value,
      });
      console.log("writeResult fiatSymbol :>> ", writeResult);
      refreshRate();
    };

    const showChooseCurrencyModal = (state: boolean) => {
      isChooseCurrencyModalOpen.value = state;
    };

    return {
      arrowBack,
      isChooseCurrencyModalOpen,
      showChooseCurrencyModal,
      chooseCurrency,
      fiatSymbol,
      // accountLabel,
      // accountDisplayName,
      getUserAvatar,
      getUserDisplayName,
      getUserLabel,
      store,
      qrCodeOutline,
      cash,
      build,
      flag,
    };
  },
};
</script>

<style scoped>
ion-toolbar {
  padding-left: 0px;
}
ion-avatar {
  height: 58px;
  width: 58px;
}
.accountname {
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 18px;
  color: #000000;
}
.displayname {
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 15px;
  color: #929598;
}
.qr {
  height: 35px;
  width: 35px;
  color: #6c69fc;
  position: absolute;
  right: 0px;
  margin-right: 2px;
}
.contentlabel {
  display: flex;
  align-items: center;
}
.line {
  border-bottom: 1px solid #e6e6e6;
}
.account {
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 17px;
  color: #68717b;
}
.currency {
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 20px;
  letter-spacing: -0.002em;
  color: #000000;
}
.format {
  margin-right: 12px;
  height: 18px;
  width: 18px;
}
.options {
  font-size: 13px;
}
</style>
