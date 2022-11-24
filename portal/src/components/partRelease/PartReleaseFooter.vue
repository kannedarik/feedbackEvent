<template>
  <div class="footer-new">
    <Container>
      <div class="py-2 sm:px-4 md:p-7 flex items-center">
        <div class="flex-1 loan-selection-info-wrapper" v-if="selectedJewelsCount">
          <span>Release:</span>
          <h4 class="d-block">
            {{selectedJewelsCount}} Jewels
          </h4>
        </div>
        <div class="flex-1 text-right">
          <button class="float-right btn btn-primary-rupeek w-full
            w-1/2 mx-auto rounded-full"
            :class="[
            disabledContinueBtn ? 'opacity-50 d-flex justify-center items-center': '',
            selectedJewelsCount ? 'md:w-4/6' : 'md:w-2/6']"
            :disabled="!selectedJewelsCount"
            @click="partRelease">
            <img src="@/assets/img/info_icons/info_white_icon.svg" alt="info"
              v-if="disabledContinueBtn">
            <span :class="{'ml-2 mt-1': disabledContinueBtn}">
              {{ $t('continue')}}
            </span>
          </button>
        </div>
      </div>
     </Container>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import store from '@/store';
import Container from '@/components/CommonComponents/Container.vue';
import { getSelectedJewels, closeLoanPartRelease } from '@/utils/partRelease';

export default {
  name: 'PartReleaseFooter',
  computed: {
    ...mapGetters({
      selectedJewelsCount: 'jewels/selectedJewelsCount',
      disabledContinueBtn: 'jewels/disabledContinueBtn',
    }),
  },
  components: {
    Container,
  },
  methods: {
    partRelease() {
      if (this.disabledContinueBtn) {
        store.dispatch('jewels/showErrorMessageModal', true);
        store.dispatch('jewels/unselectLastSeletedJewel', false);
        store.dispatch('jewels/selectedAddLoanClosure', false);
      } else {
        const loans = getSelectedJewels();
        if (loans.every((loan) => loan.closing)) {
          closeLoanPartRelease({ type: 'CloseLoan' });
        } else {
          closeLoanPartRelease({ type: 'PartRelease' });
        }
      }
    },
  },
};
</script>
<style lang='scss'>
.repay-btn {
  span{
    font-size: 1.25rem;
  }
  &.disabled {
    pointer-events: none;
    opacity: .5;
  }
}
.footer-new {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 9999;
  .repay-btn {
    background: linear-gradient(0.07deg, #1287e5 0.06%, #6CB9F5 99.94%);
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    color: #FFFFFF;
    &:hover {
      border-color: #1287e5;
    }
  }
}
</style>
