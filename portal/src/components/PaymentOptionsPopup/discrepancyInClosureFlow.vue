<template>
  <div>
    <transition name="payment-options-wrapper">
      <section class="block payment-options-wrapper bg-white">
        <div class="header block position-relative">
          <div class="p-3">
            <InfoMessageWithTitle
              :infoMessage="infoMessage"
            />
          </div>
          <div class="new-close-icon cursor-pointer"
            @click="$emit('hidePaymentOptions')">
          </div>
        </div>
        <div class="w-100 px-3">
          <h4 class="text-lg my-3 font-bold">
            Loan with Discrepancy
            <span class="number px-2 py-1 ml-2">
              {{closeInfoDetails.loanDetails.length}}
            </span>
          </h4>
          <ClosureLoanDetails
            v-if="_.get(closeInfoDetails, 'loanDetails', []).length"
            :loanDetails="_.get(closeInfoDetails, 'loanDetails', [])"
          />
          <div class="pt-4 pb-3 flex items-center justify-between">
            <button class="btn-rounded-secondary rounded-full w-40"
              @click="goBack()">
              Go Back
            </button>
            <button class="btn-primary-rupeek rounded-full w-40"
              @click="moveToCloseLoan()">
              Close {{closeInfoDetails.nonDiscrepancyoanCount}} Loans
            </button>
          </div>
        </div>
      </section>
    </transition>
  </div>
</template>

<script>
import _ from 'lodash';
import ClosureLoanDetails from '@/components/CommonComponents/closureLoanDetails.vue';
import InfoMessageWithTitle from '@/components/InfoMessagesBoxs/InfoMessageWithTitle.vue';
import infoIcon from '@/assets/icons/info_icon.svg';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';

export default {
  data() {
    return {
      infoMessage: {
        infoIcon,
        title: 'We are facing some issues in getting latest values from Bank',
        message: 'Contact customer care to close the below loans',
        size: 'big',
      },
    };
  },
  props: {
    closeInfoDetails: Object,
  },
  components: {
    InfoMessageWithTitle,
    ClosureLoanDetails,
  },
  computed: {
    _() {
      return _;
    },
  },
  methods: {
    goBack() {
      this.sendEventDetails(events.GO_BACK_CLICKED_CLOSURE_DISCREPANCY);
      this.$emit('hidePaymentOptions');
    },
    moveToCloseLoan() {
      this.sendEventDetails(events.CLOSE_LOAN_CLICKED_CLOSURE_DISCREPANCY);
      this.$emit('moveToCloseLoan');
    },
    sendEventDetails(data) {
      const properties = {
        [events.EVENT_NAME]: data,
      };
      sendEvent(events.screen.CLOSURE_DISCREPANCY_SCREEN, events.category.PAYMENT, properties);
    },
  },
  mounted() {
    this.sendEventDetails(events.CLOSURE_DISCREPANCY_POPUP_VISITED);
  },
};
</script>
<style>
.number {
  background: #FBDDD1;
  border-radius: 6px;
}
</style>
