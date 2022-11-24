<template>
  <footer class="block">
    <div class="block py-10">
      <div class="container">
        <div class="footer-links-wrapper d-flex items-center flex-direction-column-mobile">
          <div class="google-play-store-icon d-block">
            <a href="https://play.google.com/store/apps/details?id=com.rupeek.customer"
              target="_blank" alt="google-play-store-icon">
              <div class="icon-play-store-bg public-icon"></div>
            </a>
          </div>
          <div class="footer-links">
            <ul>
              <li>
                <a :href="`${rupeekURL}/about`">About </a>
              </li>
              <li>
                <a :href="`${rupeekURL}/about/faq/core`"> FAQs </a>
              </li>
              <li>
                <a :href="`${rupeekURL}/contact`"> Contact </a>
              </li>
              <li>
                <a :href="`${rupeekURL}/signin`"> Sign In</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="copyright-wrapper block footer-links py-8 text-center">
      <div class="container">
        <ul>
          <li>&copy; 2015-{{ new Date().getFullYear() }} Rupeek Fintech Pvt Ltd.</li>
          <li>
            <a :href="`${rupeekURL}/about/privacy`"> Privacy </a>
          </li>
          <li>
            <a :href="`${rupeekURL}/about/terms#rbi-disclaimer`"> Terms </a>
          </li>
          <li>
            <a :href="`${rupeekURL}/about/press/`"> Press</a>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>
<script>
import getEnv from '@/utils/env';

export default {
  name: 'publicFooter',
  data() {
    return {
      rupeekURL: getEnv('VUE_APP_BETA_URL'),
    };
  },
};
</script>
<style lang="scss" scoped>
    @import "@/scss/footer/footer.scss";
</style>
