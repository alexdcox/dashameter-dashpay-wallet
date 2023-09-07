<script>
import {
  IonContent,
  IonFooter,
  IonChip,
  IonIcon,
  modalController,
} from "@ionic/vue";
import useWallet from "@/composables/wallet";
import useRates from "@/composables/rates";
import SendSvg from '../../../public/assets/icons/send.svg'
import ReceiveSvg from '../../../public/assets/icons/receive.svg'
export default {
  emits: ["showSendDashModal", "showRequestDashModal"],
  components: {
    IonContent,
    IonFooter,
    IonChip,
    IonIcon,
  },
  data() {
    return {
      SendSvg,
      ReceiveSvg,
    }
  },
  setup(_, { emit }) {
    const { myDashBalance, myFiatBalance } = useWallet();
    const { getFiatSymbol } = useRates();

    const showSendDashModal = async () => {
      emit("showSendDashModal", { state: true, direction: "send" });
      modalController.dismiss();
    };

    const showRequestDashModal = async () => {
      emit("showRequestDashModal", { state: true, direction: "request" });
      modalController.dismiss();
    };

    return {
      myDashBalance,
      myFiatBalance,
      getFiatSymbol,
      modalController,
      showRequestDashModal,
      showSendDashModal,
    };
  },
};
</script>

<template>
  <ion-content class="ion-padding-top">
    <div class="flex ion-justify-content-center headername">Balance</div>
    <div class="dbalance">{{ myDashBalance }} Dash</div>
    <div class="fbalance">{{ myFiatBalance }} {{ getFiatSymbol }}</div>
  </ion-content>
  <ion-footer
      class="ion-padding ion-justify-content-center ion-no-border justify"
  >
    <ion-chip class="buttons inflow" @click="showRequestDashModal()">
      <div style="margin-top: 8px">
        <ion-icon class="popupicon" :src="ReceiveSvg"></ion-icon>
        <div class="popupfont">Request</div>
      </div>
    </ion-chip>
    <ion-chip class="buttons outflow" @click="showSendDashModal()">
      <div style="margin-top: 8px">
        <ion-icon class="popupicon" :src="SendSvg"></ion-icon>
        <div class="popupfont">Send</div>
      </div>
    </ion-chip>
  </ion-footer>
</template>

<style scoped>
.dbalance {
  font-style: normal;
  font-weight: 600;
  font-size: 21px;
  line-height: 25px;
  text-align: center;
  color: #000000;
  margin-top: 16px;
  margin-bottom: 4px;
}
.fbalance {
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 15px;
  color: #818c99;
  text-align: center;
}
.buttons {
  width: 156px;
  height: 78px;
  border-radius: 10px;
  display: inline-block;
  text-align: center;
  align-items: center;
}
.popupicon {
  height: 30px;
  width: 30px;
  margin: auto;
}
.popupfont {
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
  letter-spacing: -0.003em;
  color: #000000;
  margin-top: 6px;
  /* margin: 0px auto; */
  display: block;
}
</style>