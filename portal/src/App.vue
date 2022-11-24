<template>
  <div id="app" class="app-wrapper">
    <loader></loader>
    <headerComponent
      v-if="(($resize && $mq.above(992) && !hasLoginScreen) || hasHomeScreen)
      && !hasHideHeader"
    />
    <div class="block position-relative">
      <keep-alive max="5">
        <router-view />
      </keep-alive>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import clevertap from 'clevertap-web-sdk';
import { mapActions, mapGetters } from 'vuex';
import i18n from '@/plugins/i18n';
import { getLenderPartners } from '@/api/lenderConfiguration.api';
import defaultLenderLogo from '@/assets/default_lender_logo.svg';
import headerComponent from './components/header/header.vue';
import loader from './components/Loader/Loader.vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'vuejs-noty/dist/vuejs-noty.css';
import 'vue-slick-carousel/dist/vue-slick-carousel-theme.css';
import 'vue-slick-carousel/dist/vue-slick-carousel.css';

export default {
  name: 'app',
  data() {
    return {
      hasHomeScreen: false,
      hasLoginScreen: true,
      hasHideHeader: false,
    };
  },
  computed: {
    ...mapGetters({
      userObj: 'auth/loggedInUser',
      token: 'auth/authToken',
      lendersConfig: 'loans/lendersConfig',
    }),
  },
  components: { headerComponent, loader },
  watch: {
    $route(to) {
      this.hasHideHeader = to.name === 'NotFound';
      this.hasHomeScreen = to.path === '/dashboard';
      this.hasLoginScreen = to.path === '/login';
    },
    hasLoginScreen(value) {
      if (_.isEmpty(this.lendersConfig) && !value && !this.hasHideHeader) {
        this.getLenderPartners();
      }
    },
  },
  methods: {
    ...mapActions({
      tempLogin: 'auth/tempLogin',
      setLendersConfig: 'loans/setLendersConfig',
    }),
    setUserIdentification() {
      // each of the below mentioned fields are optional
      // with the exception of one of Identity, Email, or FBID
      const userObj = { ...this.userObj };
      const {
        firstname: Name, refid: Identity, email: Email, phone,
      } = userObj;
      const Phone = `+91${phone}`;
      clevertap.onUserLogin.push({
        Site: {
          Name,
          Identity,
          Email,
          Phone,
          // optional fields. controls whether the user will be sent email, push etc.
          'MSG-email': true, // Disable email notifications
          'MSG-push': true, // Enable push notifications
          'MSG-sms': true, // Enable sms notifications
          'MSG-whatsapp': true, // Enable WhatsApp notification
        },
      });
    },
    getLenderPartners() {
      getLenderPartners()
        .then((response) => {
          const lenderObj = {};
          response.data.data.forEach((lender) => {
            const iconObj = lender.logo.find((icon) => icon.type === 'payments-web');
            const link = iconObj ? `${iconObj.url}/${iconObj.image}-${iconObj.type}${iconObj.extension}` : defaultLenderLogo;
            const slug = lender.slug !== 'icici-bank' ? lender.slug : 'icici';
            lenderObj[slug] = {
              name: lender.displayNames.shortName,
              iconLink: link,
            };
          });
          this.setLendersConfig(lenderObj);
        });
    },
  },
  mounted() {
    i18n.locale = 'es';
    if (this.userObj) {
      this.setUserIdentification();
    } else if (this.token) {
      this.tempLogin();
    }
  },
};
</script>

<style lang='scss'>
  @import 'src/scss/common/_base.scss';
  @import 'src/scss/common/_normalize.scss';
  .app-wrapper {
    min-height: 100vh;
    max-height: 100vh;
    overflow: hidden;
    overflow-y: scroll;
    scroll-behavior: smooth;
  }
</style>
