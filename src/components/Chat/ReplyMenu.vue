<script lang="ts">
import {
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  popoverController,
} from "@ionic/vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import ReplySvg from '../../../public/assets/icons/reply.svg'
import CopySvg from '../../../public/assets/icons/copy.svg'

export default {
  name: "ReplyMenu",
  props: ["msg", "friendOwnerId"],
  components: {
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
  },
  data() {
      return {
        ReplySvg,
        CopySvg,
      }
  },
  setup(props: any) {
    const store = useStore();
    const router = useRouter();

    const setReplyToId = () => {
      store.commit("setActiveReplyToId", {
        friendOwnerId: props.friendOwnerId,
        replyToId: props.msg.id.toString(),
        msgOwnerId: props.msg.ownerId.toString(),
      });
    };

    function copyToClipboard() {
      navigator.clipboard.writeText(props.msg.data.text).then(
        function () {
          store.dispatch("showToast", {
            text: "Copied message text",
            type: "copiedtoast",
            icon: "copyIcon",
          });
          console.log(
            "Copying to clipboard was successful! Message: ",
            props.msg.data.text
          );
        },
        function (err) {
          console.error("Could not copy text: ", err);
        }
      );
    }

    return {
      router,
      store,
      popoverController,
      setReplyToId,
      copyToClipboard,
    };
  },
};
</script>

<template>
  <ion-list>
    <ion-item
        button
        @click="popoverController.dismiss() && setReplyToId()"
        lines="none"
        class="height"
    >
      <ion-icon
          slot="start"
          :src="ReplySvg"
          class="reply"
      ></ion-icon>
      <ion-label>Reply</ion-label>
    </ion-item>
    <ion-item
        button
        @click="popoverController.dismiss() && copyToClipboard()"
        lines="none"
        class="height"
    >
      <ion-icon
          slot="start"
          :src="CopySvg"
          class="copy"
      ></ion-icon>
      <ion-label>Copy</ion-label>
    </ion-item>
  </ion-list>
</template>

<style scoped>
.reply {
  width: 28px;
  height: 28px;
}
.copy {
  width: 28px;
  height: 28px;
}
.height {
  height: 40px;
  padding-top: 10px;
  padding-bottom: 10px;
  display: flex;
  align-items: center;
}
</style>
