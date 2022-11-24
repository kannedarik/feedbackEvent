<template>
  <header class="block py-2 bg-white">
    <div
      class="container d-flex flex-align-center
        flex-justify-content-space-between">
      <div class="logo-wrapper display-flex">
        <div class="rupeek-logo-wrapper">
          <router-link to="/" class="display-inline-block">
            <img src="@/assets/rupeek_logo.svg" class="img-responsive" alt="logo" />
          </router-link>
        </div>
      </div>
      <div
        class="hamburger-menu-wrapper cursor-pointer hamburger-menu_js"
        :class="{ active: showMenu }"
        @click="showMenu = !showMenu"
      >
        <div class="hamburger-bar-1"></div>
        <div class="hamburger-bar-2"></div>
        <div class="hamburger-bar-3"></div>
      </div>
      <nav class="main-menu transition">
        <ul>
          <li>
            <a :href="`${rupeekURL}/about`" class="transition">About</a>
          </li>
          <li>
            <a :href="`${rupeekURL}/schemes`" class="transition">Schemes</a>
          </li>
          <li>
            <a :href="`${rupeekURL}/loan-transfer`" class="transition"
              >Loan Transfer</a
            >
          </li>
          <li>
            <a :href="`${rupeekURL}/about/careers/`" class="transition"
              >Careers</a
            >
          </li>
          <li>
            <a :href="`${rupeekURL}/contact`" class="transition">Contact</a>
          </li>
          <li>
            <router-link class="btn-primary-rupeek" to="/"
              >Repay Your Loan</router-link
            >
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
<script>
import getEnv from '@/utils/env';

export default {
  name: 'publicHeader',
  data() {
    return {
      showMenu: false,
      rupeekURL: getEnv('VUE_APP_BETA_URL'),
    };
  },
};
</script>

<style lang="scss" scoped>
  @import "@/scss/header/publicHeader.scss";
</style>
