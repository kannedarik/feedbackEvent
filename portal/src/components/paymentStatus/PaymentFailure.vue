<template>
  <div>
    <div class="payments-body">
      <Container>
        <div class="p-6 mt-2 md:text-center bg-white">
          <!-- <img src="@/assets/img/payment_status_icons/failure_icon.svg"
            alt="success_icon" class="md:m-auto" /> -->
          <div class="checkmark-circle">
            <div class="background error"></div>
            <div class="crossmark draw"></div>
          </div>
          <h4 class="leading-loose mt-3 title font-bold">
            {{ $t(`${paymentSuccess.title}`) }}!
          </h4>
        </div>
        <div class="rounded-b-md px-6 pb-6 md:pb-8 text-center">
          <InfoMessageWithTitle v-for="(message, index) in paymentMessages" :key="index"
            :infoMessage="message"
            class="text-left info-message w-75 mx-auto"
            :class="{'mt-4': index !== 0 }"
          />
        </div>
        <div class="rounded-b-md p-6 md:py-8"
          v-if="paymentSuccess.type === 'closing' && slotBookingLaunched
            && !hasUnsecuredLoanClosed">
          <p class="inter-font-family" v-if="_.get(paymentFailureMessage, 'content.message')">
            {{_.get(paymentFailureMessage, 'content.message')}}!
          </p>
        </div>
      </Container>
    </div>
    <div class="footer-new">
      <Container>
        <div class="py-2 px-4 md:p-7 flex justify-between">
          <button class="btn-rounded-secondary text-base px-4"
            @click="backToHome()">
            Back to Home
          </button>
          <button class="btn-primary-rupeek text-base rounded-full px-4"
            @click="tryAgain">
            Try Again
          </button>
        </div>
      </Container>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import store from '@/store';
import { getOrderId } from '@/api/paymentStatus.api';
import { getLoanDetailForRequestId } from '@/api/paymentGateways.api';
import { fetchPartReleaseOrdersAPI } from '@/api/partRelease.api';
import Container from '@/components/CommonComponents/Container.vue';
import InfoMessageWithTitle from '@/components/InfoMessagesBoxs/InfoMessageWithTitle.vue';
import { getPaymentMethodsBasedOnLoansLender, makePartReleasePay } from '@/utils/getPaymentMethods';
import getSelectedLoans from '@/utils/getSelectedLoans';
import { sendEvent, mapCleverTapProperty } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';

export default {
  name: 'PaymentFailure',
  components: {
    Container,
    InfoMessageWithTitle,
  },
  props: {
    paymentSuccess: {
      type: Object,
      required: true,
    },
    paymentMessages: {
      type: Array,
      required: false,
    },
    paymentFailureMessage: {
      type: Object,
      required: false,
    },
    slotBookingLaunched: {
      type: Boolean,
      required: false,
    },
    hasUnsecuredLoanClosed: {
      type: Boolean,
      required: false,
    },
  },
  data() {
    return {
      paymentType: '',
      hasAllowFlow: true,
    };
  },
  computed: {
    ...mapGetters({
      selectedLoans: 'loans/selectedLoans',
      paymentOption: 'loans/paymentOption',
    }),
    _() {
      return _;
    },
  },
  watch: {
    selectedLoans(value) {
      if (value.length && this.hasAllowFlow) {
        store.dispatch('loans/populateLoanAmount', value);
        if (this.paymentType !== 'part-release') {
          getPaymentMethodsBasedOnLoansLender(value, this.paymentOption, false);
        } else {
          this.fetchPartReleaseOrderDetails();
        }
      }
    },
  },
  methods: {
    backToHome() {
      this.hasAllowFlow = false;
      store.dispatch('loans/setPaymentOption', null);
      store.dispatch('loans/partPaymentAmount', null);
      store.dispatch('loans/partPaymentInfo', []);
      this.$router.push('/dashboard');
    },
    tryAgain() {
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_TRY_AGAIN_CLICKED,
        [events.PAYMENT_ACTION]:
          mapCleverTapProperty(this.paymentSuccess.type).action,
      };
      sendEvent(events.screen.PAYMENT_SUCCESS, events.category.PAYMENT, properties);
      if (this.paymentSuccess.type === 'repledge') {
        getOrderId(this.$route.query.requestid)
          .then((response) => {
            this.$router.push(`/payment-options/${response.data.orderId}`);
          })
          .catch((error) => {
            this.$noty.error(error.message);
          });
      } else {
        this.fetchPaymentData();
      }
    },
    fetchPaymentData() {
      getLoanDetailForRequestId(this.$route.query.requestid)
        .then((response) => {
          const { data } = response.data.response;
          this.paymentType = data.type;
          const selectedLoansCoreid = [];
          data.loandata.map((loan) => selectedLoansCoreid.push(loan.loan.coreid));
          getSelectedLoans(selectedLoansCoreid);
          store.dispatch('loans/populateLoanAmount', this.selectedLoans);
        })
        .catch((error) => {
          this.$noty.error(error.message);
        });
    },
    fetchPartReleaseOrderDetails() {
      const tempObj = {
        process: 'PART_RELEASE',
        referenceId: this.$route.query.requestid,
        paymentStatus: 'FAILURE',
      };
      fetchPartReleaseOrdersAPI(tempObj)
        .then((responses) => {
          let partReleaseOrderId = null;
          responses.data.orders.forEach((order) => {
            partReleaseOrderId = order.id;
          });
          store.dispatch('jewels/orderId', partReleaseOrderId);
          makePartReleasePay(partReleaseOrderId);
        })
        .catch((error) => {
          this.$noty.error(error.message);
        });
    },
  },
  mounted() {
    this.hasAllowFlow = true;
  },
};
</script>
<style scoped lang='scss'>
@import '@/scss/payment-success/payment-success.scss';
.title {
  font-size: 24px;
  color: #F70000;
}
.footer-new {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
}
</style>
