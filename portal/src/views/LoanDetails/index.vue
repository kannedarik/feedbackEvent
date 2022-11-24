<template>
  <div ref="loanDetails">
    <Container>
      <div>
        <LoanInDetails
          :loansArray="loansArray"
          :lendersConfig="lendersConfig"
        />
      </div>
    </Container>
  </div>
</template>
<script>
import Container from '@/components/CommonComponents/Container.vue';
import LoanInDetails from '@/components/LoanDetails/LoanDetails.vue';

export default {
  name: 'LoanDetails',
  data() {
    return {};
  },
  components: {
    Container,
    LoanInDetails,
  },
  props: {
    loansArray: {
      type: Array,
    },
    lendersConfig: {
      type: Object,
    },
  },
  watch: {
    loansArray(value) {
      this.$refs.loanDetails.scrollIntoView();
      if (!value) {
        this.$router.push('/dashboard');
      }
    },
  },
  mounted() {
    if (!this.loansArray) {
      this.$router.push('/dashboard');
    }
    this.$refs.loanDetails.scrollIntoView();
  },
};
</script>
