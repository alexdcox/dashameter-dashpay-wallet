<script lang="ts">
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonIcon,
  modalController,
  IonSearchbar,
  IonButtons,
  IonButton,
  IonList,
} from "@ionic/vue";
import { defineComponent, ref, onMounted, computed } from "vue";
import useRates from "@/composables/rates";
import { closeOutline } from "ionicons/icons";
import { useStore } from "vuex";
import { Preferences } from "@capacitor/preferences";
import AccountSvg from '../../../public/assets/icons/account.svg'
export default defineComponent({
  name: "ViewRequestModal",
  emits: ["chooseCurrency"],
  props: ["symbol"],
  components: {
    IonItem,
    IonButtons,
    IonIcon,
    IonLabel,
    IonContent,
    IonButton,
    IonList,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSearchbar,
  },
  data() {
    return {
      AccountSvg
    }
  },
  setup(props, { emit }) {
    const { refreshRate, fetchPairs, getFiatSymbol } = useRates();

    const { commit, getters } = useStore();
    const pairs = ref([]);

    const choose = async (fiatSymbol: string) => {
      emit("chooseCurrency", fiatSymbol);
      commit("setFiatSymbol", fiatSymbol);
      const writeResult = await Preferences.set({
        key: `fiatSymbol_${getters.myLabel}`,
        value: getFiatSymbol.value,
      });
      console.log("writeResult fiatSymbol :>> ", writeResult);
      modalController.dismiss();
      refreshRate();
    };

    const searchString = ref("");

    const filteredPairs = computed(() =>
      pairs.value.filter((pair: any) => {
        return pair.fiatSymbol
          .toLowerCase()
          .includes(searchString.value.toLowerCase());
      })
    );

    onMounted(async () => {
      pairs.value = await fetchPairs();
      console.log("pairs :>> ", pairs);
      console.log("fiat", props.symbol);
    });

    return {
      modalController,
      closeOutline,
      pairs,
      choose,
      searchString,
      filteredPairs,
      getFiatSymbol,
    };
  },
});
</script>

<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start"
      ><ion-button @click="modalController.dismiss()"
      ><ion-icon :icon="closeOutline" class="close"></ion-icon></ion-button
      ></ion-buttons>
      <ion-title class="headername centerheader">Currency </ion-title>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-toolbar style="margin-top: -16px">
      <ion-searchbar v-model="searchString"></ion-searchbar>
    </ion-toolbar>
    <!-- <ion-list class="noindent"> -->
    <ion-list>
      <ion-item
          lines="none"
          v-for="pair in filteredPairs"
          :key="pair.pair"
          button
          @click="choose(pair.fiatSymbol)"
          class="ion-justify-content-center"
      >
        <div
            :class="`currency-flag currency-flag-${pair.fiatSymbol.toLowerCase()}`"
        ></div>
        <ion-label class="ion-padding-start">
          {{ pair.fiatSymbol }}
          <ion-icon
              v-if="pair.fiatSymbol === getFiatSymbol"
              :src="AccountSvg"
              class="active"
          ></ion-icon>
        </ion-label>
      </ion-item>
    </ion-list>
  </ion-content>
</template>

<style scoped>
ion-searchbar {
  --background: #f3f3f3;
  --border-radius: 8px;
  --box-shadow: 0;
  --icon-color: #9c9c9c;
  --placeholder-color: #9c9c9c;
  width: 100%;
  /* width: 334px; width in mobile with padding */
  height: 31px;
  padding-left: 0px;
  padding-right: 0px;
}

.active {
  float: right;
  display: flex;
  height: 23px;
  width: 23px;
  position: absolute;
  top: 50%;
  right: 0px;
  transform: translate(0%, -50%);
}
.noindent {
  margin-left: -14px;
}
</style>