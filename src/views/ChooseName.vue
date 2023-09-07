<script setup lang="ts">
import Illustration from '../../public/assets/icons/illustration.svg'
import {computed, onMounted, reactive, ref,} from "vue";

import {
  IonButtons,
  IonChip,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";

import Dash from "@/lib/Dash";

import {arrowBack, banOutline, checkmarkOutline, ellipsisHorizontal,} from "ionicons/icons";

import {useRouter} from "vue-router";
import {useStore} from "vuex";
import {debounce} from "@/lib/Util";

interface NameConstraint {
  isAvailable: undefined | boolean;
  isThreeCharsLong: undefined | boolean;
  isValidRegexp: undefined | boolean;
}

const router = useRouter();
const store = useStore();

const nameConstraints = reactive({
  isAvailable: undefined,
  isThreeCharsLong: undefined,
  isValidRegexp: undefined,
} as NameConstraint);

const nameConstraintIcons = reactive({
  isAvailable: ellipsisHorizontal,
  isThreeCharsLong: ellipsisHorizontal,
  isValidRegexp: ellipsisHorizontal,
});

const hasClient = ref(false);
const formName = ref("");
const isCheckingName = ref(false);
const mostRecentCheckTimestamp = ref(0);
const focusInput = ref(null);

// onBeforeUnmount(() => {
//   formName.value = "";
// });

//  TODO: adc: Have an account selection here if needed...

onMounted(() => {
  Dash.client().then(() => hasClient.value = true)
})

const pickName = () => {
  router.push("/choosepassword");
};

const constraintColor = (value: boolean | undefined) => {
  let color = "";
  if (value === true) color = "success";
  if (value === false) color = "danger";
  return color;
};

const nameIsCorrectLengthText = computed(() => {
  return formName.value.length < 64
      ? "Minimum 3 characters"
      : "Maximum 63 characters";
});

const checkIsNameThreeCharsLong = () => {
  // Nothing to check without a username present
  if (formName.value === "") {
    nameConstraints.isThreeCharsLong = undefined;
    nameConstraintIcons.isThreeCharsLong = ellipsisHorizontal;
    return nameConstraints.isThreeCharsLong;
  }

  if (formName.value.length >= 3 && formName.value.length <= 64) {
    nameConstraints.isThreeCharsLong = true;
    nameConstraintIcons.isThreeCharsLong = checkmarkOutline;
  } else {
    nameConstraints.isThreeCharsLong = false;
    nameConstraintIcons.isThreeCharsLong = banOutline;
  }

  return nameConstraints.isThreeCharsLong;
};

const checkIsNameValidRegexp = () => {
  // Nothing to check with no or too short username
  if (formName.value === "") {
    nameConstraints.isValidRegexp = undefined;
    nameConstraintIcons.isValidRegexp = ellipsisHorizontal;
    return nameConstraints.isValidRegexp;
  }

  const pattern = new RegExp("^((?!-)[a-zA-Z0-9-]{1,62}[a-zA-Z0-9])$");
  if (pattern.test(formName.value)) {
    nameConstraints.isValidRegexp = true;
    nameConstraintIcons.isValidRegexp = checkmarkOutline;
  } else {
    nameConstraints.isValidRegexp = false;
    nameConstraintIcons.isValidRegexp = banOutline;
  }

  return nameConstraints.isValidRegexp;
};

const checkIsNameAvailable = async () => {
  nameConstraintIcons.isAvailable = ellipsisHorizontal;
  nameConstraints.isAvailable = undefined;
  if (![checkIsNameThreeCharsLong(), checkIsNameValidRegexp()].every(x => x)) {
    return
  }
  isCheckingName.value = true;
  sendDpnsRequest()
}

const sendDpnsRequest = debounce(async () => {
  console.log("Sending DPNS name check for", formName.value);
  const client = await Dash.client()
  const dpnsDoc = await client.platform.names.resolve(`${formName.value}.dash`);
  console.log("Check dpns result (null means available): ", dpnsDoc);
  if (dpnsDoc === null) {
    store.commit("setWishName", formName.value);
    nameConstraints.isAvailable = true;
    nameConstraintIcons.isAvailable = checkmarkOutline;
  } else {
    nameConstraints.isAvailable = false;
    nameConstraintIcons.isAvailable = banOutline;
  }
  isCheckingName.value = false;
}, 500)

</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-icon
              class="back"
              :icon="arrowBack"
              @click="router.push('/chooseaccount')"/>
        </ion-buttons>
        <ion-title class="headername">Choose your Dash username</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="flex ion-justify-content-center">
        <ion-icon :src="Illustration" class="illustration"/>
      </div>
      <ion-list>
        <ion-item class="ion-margin-top" lines="none">
          <ion-input
              ref="focusInput"
              v-model="formName"
              enterkeyhint="next"
              placeholder="username"
              show-clear-button="never"
              @ionInput="checkIsNameAvailable"
              @keyup.enter="pickName()">
          </ion-input>
        </ion-item>
        <ion-list>
          <ion-item class="char" lines="none">
            <ion-icon
                slot="start"
                :icon="nameConstraintIcons.isThreeCharsLong"
                :color="constraintColor(nameConstraints.isThreeCharsLong)"/>
            <ion-label :color="constraintColor(nameConstraints.isThreeCharsLong)">
              {{ nameIsCorrectLengthText }}
            </ion-label>
          </ion-item>
          <ion-item class="char" lines="none">
            <ion-icon
                slot="start"
                :icon="nameConstraintIcons.isValidRegexp"
                :color="constraintColor(nameConstraints.isValidRegexp)"/>
            <ion-label :color="constraintColor(nameConstraints.isValidRegexp)">
              Letters, numbers and hyphen only
            </ion-label>
          </ion-item>
          <ion-item class="char" lines="none">
            <ion-icon
                v-if="!isCheckingName"
                slot="start"
                :icon="nameConstraintIcons.isAvailable"
                :color="constraintColor(nameConstraints.isAvailable)"/>
            <ion-spinner v-else name="dots" color="tertiary"/>
            <ion-label :color=" isCheckingName ? 'tertiary' : constraintColor(nameConstraints.isAvailable)">
              Username available
            </ion-label>
          </ion-item>
        </ion-list>
      </ion-list>
    </ion-content>
    <ion-footer class="ion-no-border">
      <ion-toolbar>
        <ion-chip
            class="ion-padding-horizontal nextbutton next-color"
            :disabled="!(hasClient && nameConstraints.isAvailable && !isCheckingName)"
            expand="block"
            @click="pickName()">
          <div class="next-text" style="display: inline-block">Next</div>
        </ion-chip>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<style scoped>
.back {
  margin-left: 16px;
  width: 22px;
  height: 22px;
  color: #6c69fc;
}

:host {
  --min-height: 0px;
  --background: white;
}

ion-spinner {
  width: 24px;
  height: 24px;
  margin-right: 32px;
}

.illustration {
  /* position: absolute; */
  /* left: 56px;
  top: 83px; */
  /* margin: auto; */
  width: 248px;
  height: 233px;
  display: flex;
  justify-content: center;
  text-align: center;
}

.char {
  height: 30px;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 22px;
  color: #68717b;
  margin: 0;
}

ion-icon {
  font-size: 12px;
  margin: 9px 9px 9px 0px;
}

ion-input {
  --padding-start: 12px; /* did not work, so used css class below */
  width: 328px;
  --background: #f5f5f7;
  border: 0.5px solid rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
  border-radius: 10px;
  color: black;
}

ion-item.sc-ion-input-md-h:not(.item-label),
ion-item:not(.item-label) .sc-ion-input-md-h {
  --padding-start: 12px;
}

ion-label {
  margin: 0px 0px;
}

.item-native {
  --min-height: 0px;
}

</style>
