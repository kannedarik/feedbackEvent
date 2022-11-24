<template>
  <div class="renewal-card sm:mx-3 md:mx-8 my-4">
    <div v-on="pendingLoan.type === 'part-release'
      ? { click: () => goToSummarySceen(pendingLoan.id) } : {}"
      :class="{'cursor-pointer': pendingLoan.type === 'part-release'}">
      <div class="renewal-status"
        :class="(checkIncompleteStatus(pendingLoan) && pendingLoan.type === 'renewal')
          ? 'incomplete': 'processing'">
        <p class="medium-font-weight text-center">
          {{ getStatusCardTitel(pendingLoan) }}
        </p>
      </div>
      <div class="lender-details-section lender-interest-tenure flex">
        <div v-for="lender in pendingLoan.lenders" :key="lender"
          class="icon icon-small">
          <img :src="lendersConfig[lender].iconLink" :alt="lender"/>
        </div>
        <p class="bold-font">
          {{
            _.join(_.map(pendingLoan.lenders, (lender) => lendersConfig[lender].name), ' & ')
          }}
        </p>
      </div>
      <div>
        <LoanDetails v-for="(loan, loanIndex) in getLoanDetails(pendingLoan)"
          :key="loanIndex"
          :loanDetails="loan"
        />
      </div>
      <div class="gold-delivery-status p-4"
        v-if="pendingLoan.type === 'release'
        && (pendingLoan.releaseDeliveryStatus === releaseDeliveryStatus.PAYMENT_SUCCESSFUL
        || pendingLoan.releaseDeliveryStatus === releaseDeliveryStatus.SLOT_PENDING
        || (pendingLoan.releaseDeliveryStatus === releaseDeliveryStatus.DELIVERY_INITIATED
        || pendingLoan.releaseDeliveryStatus === releaseDeliveryStatus.SLOT_BOOKED)
        || pendingLoan.releaseDeliveryStatus === releaseDeliveryStatus.DELIVERY_COMPLETED)">
        <div class="gold-info mb-4">
          <p v-if="pendingLoan.releaseDeliveryStatus === releaseDeliveryStatus.PAYMENT_SUCCESSFUL">
            Gold Delivery Status
          </p>
          <p class="slot-pending"
            v-if="pendingLoan.releaseDeliveryStatus === releaseDeliveryStatus.SLOT_PENDING">
            {{ _.get(pincodeMessage, 'content.message') }}
          </p>
          <p v-if="pendingLoan.releaseDeliveryStatus === releaseDeliveryStatus.DELIVERY_INITIATED
            || pendingLoan.releaseDeliveryStatus === releaseDeliveryStatus.SLOT_BOOKED">
            Estimated Arrival:
            <span>
              {{ getEstimatedArrivalTime(pendingLoan) }}
            </span>
            <span>
              {{ getEstimatedArrivalDay(pendingLoan) }}
            </span>
          </p>
          <p v-if="pendingLoan.releaseDeliveryStatus === releaseDeliveryStatus.DELIVERY_COMPLETED">
            Gold Delivery Successful
          </p>
        </div>
      </div>
      <ul class="timeline py-4"
        :class="{
          'five-slots':  getTimeLine(pendingLoan).length === 5
          ,'three-slots': getTimeLine(pendingLoan).length === 3
        }">
        <li v-for="(loanStatus, index) in getTimeLine(pendingLoan)" :key="index"
          :class="loanStatus.status" v-html="loanStatus.text">
        </li>
      </ul>
      <div class="text-center" v-if="pendingLoan.type === 'renewal'
        && pendingLoan.signingstatus !== 'success' && !pendingLoan.locksign">
        <button class="btn btn-primary-rupeek w-10/12 md:w-1/2 mb-3"
          @click="toSigningMethods(pendingLoan.id, pendingLoan.paymentstatus)">
          Acknowledge Pledge card
        </button>
      </div>
      <div class="text-center" v-else-if="pendingLoan.type === 'renewal'
        && pendingLoan.signingstatus === 'success' && pendingLoan.hasLoanEnhancementLoans
        && pendingLoan.bankAccount && pendingLoan.bankAccount.verificationStatus
        && pendingLoan.bankAccount.verificationStatus !== 'verification_successful'
        && !pendingLoan.bankAccount.verificationLock">
         <button class="btn btn-primary-rupeek w-10/12 md:w-1/2 mb-3"
          @click="toBankAccount(pendingLoan.id)">
          Verify bank account
         </button>
      </div>
      <div class="text-center" v-else-if="pendingLoan.type === 'renewal'
        && (pendingLoan.signingstatus === 'success' && !pendingLoan.hasLoanEnhancementLoans)
        || (pendingLoan.signingstatus === 'success' && pendingLoan.bankAccount
            && pendingLoan.bankAccount.verificationStatus
            && pendingLoan.bankAccount.verificationStatus === 'verification_successful')
        || (pendingLoan.signingstatus === 'success' && pendingLoan.bankAccount
            && pendingLoan.bankAccount.verificationLock)">
        <button class="btn btn-primary-rupeek w-10/12 md:w-1/2 mb-3"
          @click="toSummary(pendingLoan.id)">
          Download Pledge card
        </button>
      </div>
      <div class="text-center" v-else-if="pendingLoan.type === 'release'">
        <button class="btn btn-primary-rupeek w-10/12 md:w-1/2 mb-3"
          @click="movetToTrackYourGold(pendingLoan, isHomeScreen=false, getSlotBookingLaunched)"
          v-if="pendingLoan.releaseDeliveryStatus !== releaseDeliveryStatus.SLOT_PENDING">
          {{
            ((pendingLoan.releaseDeliveryStatus === releaseDeliveryStatus.SLOT_UNAVAILABLE
              || pendingLoan.releaseDeliveryStatus === releaseDeliveryStatus.PAYMENT_SUCCESSFUL)
              && !pendingLoan.relatedLoan
            )
              ? 'Book Slot for Delivery' : 'Track your Gold'
          }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import moment from 'moment';
import _ from 'lodash';
import { mapGetters } from 'vuex';
import ReleaseSlotBookingMixins from '@/mixins/ReleaseSlotBookingMixins';
import events from '@/utils/clevertap/eventconstants';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import constants from '@/constant';
import LoanDetails from './loanDetails.vue';

export default {
  name: 'statusCardComponent',
  data() {
    return {
      // for storing the selected repledged loans
      selectedRepledgedLoans: [],
      paymentStatus: false,
      releaseDeliveryStatus: constants.releaseDeliveryStatus,
      slotNotBooked: [
        constants.releaseDeliveryStatus.SLOT_UNAVAILABLE,
        constants.releaseDeliveryStatus.SLOT_PENDING,
        constants.releaseDeliveryStatus.PAYMENT_SUCCESSFUL,
      ],
      slotBookinCompleted: [
        constants.releaseDeliveryStatus.DELIVERY_COMPLETED,
        constants.releaseDeliveryStatus.SLOT_BOOKED,
        constants.releaseDeliveryStatus.DELIVERY_INITIATED,
      ],
    };
  },
  mixins: [ReleaseSlotBookingMixins],
  computed: {
    ...mapGetters({
      lendersConfig: 'loans/lendersConfig',
    }),
    _() {
      return _;
    },
    getSlotBookingLaunched() {
      return this.featureFlag['release-slot-booking-launched'];
    },
  },
  components: {
    LoanDetails,
  },
  props: {
    // recieving props data from parent
    pendingLoan: {
      type: Object,
    },
    featureFlag: {
      type: Object,
    },
    pincodeMessage: {
      type: Object,
    },
  },
  methods: {
    moment: (date) => moment(date),
    // emit close status card component method
    closeStatusCardPopup() {
      this.$router.push({ path: '/dashboard' });
    },
    checkIncompleteStatus(pendingLoan) {
      let isIncomplete = false;
      if ((pendingLoan.signingstatus !== 'success' && !pendingLoan.locksign)
        || (pendingLoan.signingstatus === 'success' && pendingLoan.bankAccount
        && pendingLoan.bankAccount.verificationStatus
        && pendingLoan.bankAccount.verificationStatus.toLowerCase() !== 'verification_successful'
        && !pendingLoan.bankAccount.verificationLock)) {
        isIncomplete = true;
      }
      return isIncomplete;
    },
    getStatusCardTitel(pendingLoan) {
      let statusCardTitel = '';
      if (pendingLoan.type === 'renewal') {
        statusCardTitel = this.checkIncompleteStatus(pendingLoan)
          ? '! Renewal Incomplete' : 'Renewal Under Processing';
      } else if (pendingLoan.type === 'part-release') {
        statusCardTitel = 'Part Release Under Processing';
      } else if (pendingLoan.type === 'release') {
        if (pendingLoan.releaseDeliveryStatus === this.releaseDeliveryStatus.PAYMENT_SUCCESSFUL) {
          statusCardTitel = 'Closure Request Received';
        } else {
          statusCardTitel = pendingLoan.releaseDeliveryStatus
            === this.releaseDeliveryStatus.DELIVERY_INITIATED
            ? 'Closure in Progress' : 'Closure Completed';
        }
      }
      return statusCardTitel;
    },
    // redirects to esign page
    toSigningMethods(orderId, paymentStatus) {
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_ACKNOWLEDGE_PC_STATUS_CARD_CLICKED,
      };
      sendEvent(events.screen.STATUS_CARDS, events.category.PAYMENT, properties);
      const signingMethods = {
        showAckFlag: true,
        orderId,
        paymentStatus: paymentStatus === 'success',
      };
      this.$emit('toSigningMethods', signingMethods);
    },
    // to renewal summary page
    toSummary(orderId) {
      this.$router.push({ path: `/payment-status/${orderId}` });
    },
    goToSummarySceen(orderId) {
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_PART_RELEASE_STATUS_CARD_CLICK,
      };
      sendEvent(events.screen.STATUS_CARDS, events.category.PAYMENT, properties);
      this.$router.push({
        path: `/new-payment-status?orderId=${orderId}&success=false`,
      });
    },
    // to bank account details page
    toBankAccount(orderId) {
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_VERIFY_BANK_ACCOUNT_STATUS_CARD_CLICKED,
      };
      sendEvent(events.screen.STATUS_CARDS, events.category.PAYMENT, properties);
      this.$router.push({ path: `/bank-details/${orderId}` });
    },
    getLoanDetails(pendingLoan) {
      return _.get(pendingLoan, 'loanDetails')
        ? _.get(pendingLoan, 'loanDetails') : _.get(pendingLoan, 'loans');
    },
    getPledgeCardStatus(status) {
      let className = '';
      if (status.signingstatus !== 'success' && status.locksign && status.type === 'renewal') {
        className = 'in-process';
      } else if (status.signingstatus === 'success'
        || this.slotBookinCompleted.includes(status.releaseDeliveryStatus)) {
        className = 'completed';
      } else if (status.type === 'renewal'
        || (this.slotNotBooked.includes(status.releaseDeliveryStatus) && !status.relatedLoan)) {
        className = 'slot-not-booked';
      }
      return className;
    },
    getVerifyBankAccountStatus(status) {
      let className = '';
      if (_.get(status, 'bankAccount.verificationStatus') !== 'verification_successful') {
        className = _.get(status, 'bankAccount.verificationLock')
          ? 'in-process' : 'slot-not-booked';
      } else {
        className = 'completed';
      }
      return className;
    },
    getRenewalInProcessStatus(status) {
      let className = '';
      if ((status.signingstatus === 'success' && status.hasLoanEnhancementLoans
          && _.get(status, 'bankAccount.verificationStatus') === 'verification_successful')
          || (status.signingstatus === 'success' && !status.hasLoanEnhancementLoans)) {
        className = 'in-process';
      } else if (_.get(status, 'bankAccount.verificationStatus') !== 'verification_successful'
        && status.signingstatus !== 'success') {
        className = 'slot-not-booked';
      } else {
        className = 'completed';
      }
      return className;
    },
    getGoldDeliveryStatus(status) {
      let className = '';
      if (status.type === 'part-release') {
        className = 'in-process';
      } else if (status.releaseDeliveryStatus === this.releaseDeliveryStatus.DELIVERY_INITIATED
        || status.releaseDeliveryStatus === this.releaseDeliveryStatus.DELIVERY_COMPLETED) {
        className = 'completed';
      }
      return className;
    },
    goldDelivered(status) {
      let className = '';
      if (status.releaseDeliveryStatus === this.releaseDeliveryStatus.DELIVERY_COMPLETED) {
        className = 'completed';
      }
      return className;
    },
    checkRenewalInProcessStatus(status) {
      return status.type === 'renewal'
        ? this.getRenewalInProcessStatus(status) : this.getGoldDeliveryStatus(status);
    },
    checkRenewalSuccessful(status) {
      let className = '';
      if (status.type === 'renewal') {
        className = status.signingstatus === 'success' ? 'completed' : '';
      } else {
        className = this.goldDelivered(status);
      }
      return className;
    },
    getTimeLine(pendingLoan) {
      let timeLineArray = [];
      if (pendingLoan.hasLoanEnhancementLoans && pendingLoan.type === 'renewal') {
        timeLineArray = [
          {
            status: 'completed',
            text: 'Payment <br />Successful',
          },
          {
            status: this.getPledgeCardStatus(pendingLoan),
            text: 'Acknowledge<br />Pledge Card',
          },
          {
            status: this.getPledgeCardStatus(pendingLoan) === 'completed'
              ? this.getVerifyBankAccountStatus(pendingLoan) : '',
            text: 'Verify Bank <br />Account',
          },
          {
            status: this.getVerifyBankAccountStatus(pendingLoan) === 'completed'
              ? this.getRenewalInProcessStatus(pendingLoan) : '',
            text: 'Renewal <br />in Process',
          },
          {
            status: this.getRenewalInProcessStatus(pendingLoan) === 'completed'
              && pendingLoan.signingstatus === 'success' ? 'completed' : '',
            text: 'Renewal <br />Successful',
          },
        ];
      } else if (pendingLoan.type === 'part-release'
        || (!this.getSlotBookingLaunched && pendingLoan.type === 'release')) {
        timeLineArray = [
          {
            status: 'completed',
            text: 'Payment <br />Successful',
          },
          {
            status: this.getGoldDeliveryStatus(pendingLoan),
            text: pendingLoan.type === 'part-release'
              ? 'Under <br /> Processing' : 'Gold Delivery <br />Initiated',
          },
          {
            status: this.goldDelivered(pendingLoan),
            text: pendingLoan.type === 'part-release' ? 'Complete' : 'Gold <br />Delivered',
          },
        ];
      } else {
        timeLineArray = [
          {
            status: 'completed',
            text: 'Payment <br />Successful',
          },
          {
            status: this.getPledgeCardStatus(pendingLoan),
            text: pendingLoan.type === 'renewal'
              ? 'Acknowledge<br />Pledge Card' : 'Slot<br />Booked',
          },
          {
            status: this.getPledgeCardStatus(pendingLoan) === 'completed'
              ? this.checkRenewalInProcessStatus(pendingLoan) : '',
            text: pendingLoan.type === 'renewal'
              ? 'Renewal <br />in Process' : 'Gold Delivery <br />Initiated',
          },
          {
            status: this.checkRenewalInProcessStatus(pendingLoan) === 'completed'
              ? this.checkRenewalSuccessful(pendingLoan) : '',
            text: pendingLoan.type === 'renewal'
              ? 'Renewal <br />Successful' : 'Gold <br />Delivered',
          },
        ];
      }
      return timeLineArray;
    },
  },
};
</script>
