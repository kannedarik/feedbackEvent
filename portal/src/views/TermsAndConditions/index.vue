<template>
  <Container :screenType="'body-bg'">
    <div class="bg-white sm:px-4 sm:py-3 md:px-8 md:py-6 my-3">
      <div class="md:flex md:items-center">
        <div>
          <img src="@/assets/icons/left_arrow.svg" alt="back_arrows"
            class="cursor-pointer" @click="goBackPreviousScreen()"/>
        </div>
        <div class="sm:mt-3 md:mt-0 md:ml-3">
          <h2 class="font-semibold text-lg">
            Terms & Conditions
          </h2>
        </div>
      </div>
    </div>
    <termsAndConditions :terms="terms" />
  </Container>
</template>
<script>
import Container from '@/components/CommonComponents/Container.vue';
import termsAndConditions from '@/components/RenewalSummary/termsAndConditions.vue';

export default {
  name: 'RenewalSummary',
  components: {
    termsAndConditions,
    Container,
  },
  props: {
    terms: {
      type: Object,
      required: false,
    },
  },
  watch: {
    terms(value) {
      if (!value) {
        this.$router.push('/dashboard');
      }
    },
  },
  methods: {
    goBackPreviousScreen() {
      this.$router.go(-1);
    },
  },
};
</script>
