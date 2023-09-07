<script lang="ts">
import {
  IonPage,
  IonContent,
  IonIcon,
  IonChip,
  IonFooter,
  IonToolbar,
  IonicSlides,
} from "@ionic/vue";

import DashdPurpleSvg from '../../public/assets/icons/dashd-purple.svg'
import FindfriendsSvg from '../../public/assets/icons/findfriends.svg'
import SharevalueSvg from '../../public/assets/icons/sharevalue.svg'
import {defineComponent, onMounted} from "vue";
import 'swiper/css';
import '@ionic/vue/css/ionic-swiper.css';
import {useRouter} from "vue-router";
import {Swiper, SwiperSlide} from 'swiper/vue';
import AccountStorage from "@/lib/helpers/AccountStorage";

export default defineComponent({
  components: {
    IonFooter,
    IonToolbar,
    IonPage,
    IonContent,
    IonIcon,
    IonChip,
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      DashdPurpleSvg,
      FindfriendsSvg,
      SharevalueSvg,
    }
  },
  setup() {
    const router = useRouter();
    const slideOpts = { initialSlide: 1, speed: 400, };
    onMounted(async () => {
      const accounts = await AccountStorage.list()
      if (accounts.length) router.replace("/chooseaccount");
    });
    return {slideOpts, modules: [IonicSlides],};
  },
});
</script>

<template>
  <ion-page>
    <ion-content class="ion-padding" scroll-y="false">

      <!--      <swiper>-->
      <!--        <swiper-slide>-->
      <!--          Testing-->
      <!--          <div class="div" style="background: white; width: 200px; height: 600px;">-->
      <!--            YESLAWD-->
      <!--          </div>-->
      <!--        </swiper-slide>-->
      <!--        <swiper-slide>-->
      <!--          Testing2-->
      <!--          <div class="div" style="background: white; width: 200px; height: 600px;">-->
      <!--            YESLAWD2-->
      <!--          </div>-->
      <!--        </swiper-slide>-->
      <!--      </swiper>-->

      <swiper>
        <swiper-slide>
          <div class="slide">
            <ion-icon
                :src="DashdPurpleSvg"
                class="welcome"/>
            <div>
              <ion-icon
                  :src="FindfriendsSvg"
                  class="friends"/>
            </div>
            <h2 class="find flex ion-justify-content-center">Find Friends</h2>
            <p class="instant flex ion-justify-content-center">
              Claim your DashPay Identity today and connect with anyone,
              anywhere.
            </p>
          </div>
        </swiper-slide>

        <swiper-slide>
          <ion-icon
              :src="DashdPurpleSvg"
              class="welcome"
          ></ion-icon>
          <div>
            <ion-icon
                :src="SharevalueSvg"
                class="friends"
            ></ion-icon>
          </div>
          <h2 class="find flex ion-justify-content-center">Share Value</h2>
          <p class="instant flex ion-justify-content-center">
            Instant, global, borderless money. Send to anyone, anywhere
          </p>
          <!-- <img src="/dash-d.png" />
          <h2>Pay with ease</h2>
          <p>Pay and get paid instantly with easy to use payment flows.</p> -->
        </swiper-slide>

        <swiper-slide>
          <ion-icon
              :src="DashdPurpleSvg"
              class="welcome"
          ></ion-icon>
          <div>
            <ion-icon
                :src="SharevalueSvg"
                class="friends"
            ></ion-icon>
          </div>
          <h2 class="find flex ion-justify-content-center">Discover</h2>
          <p class="instant flex ion-justify-content-center">
            Traverse the global Dash Dapp ecosystem and the decentralized web.
            <!-- Have complete control and customize your wallet based on your needs. -->
          </p>
          <ion-footer
              class="ion-no-border ion-justify-content-center"
              style="margin-top: 30px"
          >
            <ion-toolbar class="ion-justify-content-center">
              <ion-chip
                  expand="block"
                  class="capitalize text register"
                  router-link="/choosename"
              >Register
              </ion-chip
              >

              <!-- <br /><br /> -->
              <ion-chip
                  expand="block"
                  class="capitalize text login"
                  router-link="/recoverwallet"
              >Login
              </ion-chip
              >
            </ion-toolbar>
          </ion-footer>
        </swiper-slide>
      </swiper>

    </ion-content>
  </ion-page>
</template>

<style scoped>
.welcome {
  width: 25px;
  height: 20px;
  margin-top: 20px;
}

.find {
  font-style: normal;
  font-weight: bold;
  font-size: 21px;
  line-height: 25px;
  display: flex;
  text-align: center;
  letter-spacing: -0.005em;
  margin-top: 20px;
}

.friends {
  width: 334px;
  height: 184px;
  margin-top: 75px;
}

.instant {
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 19px;
  text-align: center;
  letter-spacing: -0.004em;
  color: #68717b;
}

.swiper {
  height: 100%;
}

.text {
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  /* identical to box height */

  text-align: center;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  /* padding: 13px 148px; */

  width: 324px;
  height: 44px;
  margin: auto;

  border-radius: 10px;
}

.register {
  background: linear-gradient(40.37deg, #6a67fb 0.15%, #8d71ff 100%);
  color: #ffffff;
}

.login {
  background: #f2f4ff;
  color: #6c69fc;
}

.swiper-slide {
  display: block;
}

.swiper-slide h2 {
  margin-top: 2.8rem;
}

.swiper-slide img {
  max-height: 50%;
  max-width: 80%;
  margin: 60px 0 40px;
  pointer-events: none;
}

b {
  font-weight: 500;
}

p {
  padding: 0 40px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--ion-color-step-600, #60646b);
}

p b {
  color: var(--ion-text-color, #000000);
}

.swiper {
  --bullet-background-active: #6c69fc;
}
</style>
