<template>
  <div>
    <div v-if="paymentSummaryInfo.length || errorOnSuccess">
      <ReleaseSucessful v-if="!errorOnSuccess"
        :paymentSuccess="paymentInfo"
        :paymentSummaryInfo="paymentSummaryInfo"
        :paymentMessages="successFailureDescription"
        :securedLoanClosed="securedLoanClosed"
        :slotBookingLaunched="slotBookingLaunched"
      />
      <PaymentFailure v-else
        :paymentFailureMessage="paymentFailureMessage"
        :slotBookingLaunched="slotBookingLaunched"
        :paymentMessages="successFailureDescription"
        :paymentSuccess="paymentInfo"
        :hasUnsecuredLoanClosed="hasUnsecuredLoanClosed"
      />
    </div>
    <div v-else-if="hasShowErrorScreen">
      <Container>
        <div class="py-2 px-4 md:p-7 text-center my-48">
          <h2 class="mb-4">
            {{$t('something_went_wrong')}}
          </h2>
          <button class="btn btn-primary-rupeek text-base rounded-full px-5 py-3"
            @click="backToHome()">
            Go Back to Home
          </button>
        </div>
      </Container>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import moment from 'moment';
import store from '@/store';
import {
  fetchPartReleaseOrdersAPI,
  getStaticMessageAPI,
  getPartReleaseFeatureFlagAPI,
} from '@/api/partRelease.api';
import {
  getpaymentFinalStatus,
  getOrderId,
  getorderStatus,
  getLoanDetailForRequestId,
} from '@/api/paymentStatus.api';
import PaymentFailure from '@/components/paymentStatus/PaymentFailure.vue';
import ReleaseSucessful from '@/components/ReleaseSucessful/ReleaseSucessful.vue';
import Container from '@/components/CommonComponents/Container.vue';
import { sendEvent, mapCleverTapProperty } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';
import getPaymentOption from '@/utils/getPaymentOption';
import { formatRupeeAmount } from '@/utils/string';

export default {
  name: 'paymentSuccess',
  components: {
    Container,
    ReleaseSucessful,
    PaymentFailure,
  },
  data() {
    return {
      paymentInfo: {},
      currentRequestId: '',
      errorOnSuccess: false,
      successFailureDescription: [],
      paymentSummaryInfo: [],
      documentTitle: 'Payment status loading...',
      slotBookingLaunched: false,
      releasePaymentFailure: 'release_payment_failure',
      paymentFailureMessage: {},
      staticMessages: [],
      hasShowErrorScreen: false,
      hasUnsecuredLoanClosed: false,
      securedLoanClosed: false,
    };
  },
  computed: {
    ...mapGetters({
      lendersConfig: 'loans/lendersConfig',
    }),
  },
  watch: {
    documentTitle(value) {
      document.title = value;
    },
    paymentInfo(value) {
      if (value.type === 'closing') {
        this.getStaticMessages(this.releasePaymentFailure);
      }
    },
    releaseSlotBookingLaunched(value) {
      if (value) {
        this.getStaticMessages(this.releasePaymentFailure);
      }
    },
    staticMessages(value) {
      if (this.paymentInfo && this.paymentInfo.type === 'closing' && this.slotBookingLaunched) {
        this.paymentFailureMessage = this.getIdentifier(value, this.releasePaymentFailure);
      }
    },
  },
  methods: {
    backToHome() {
      this.$router.push('/dashboard');
    },
    checkFinalStatus() {
      if (this.$route.query.requestid) {
        this.currentRequestId = this.$route.query.requestid;
        this.getFinalStatus();
        this.getPartReleaseFeatureFlag();
      } else if (this.$route.query.orderId) {
        this.paymentInfo = {
          type: 'part-release',
        };
        this.fetchPartReleaseOrderDetails();
      } else {
        this.hasShowErrorScreen = true;
      }
    },
    // API call to get feature flag based on this flag navigated to release Slot Booking screen
    getPartReleaseFeatureFlag() {
      getPartReleaseFeatureFlagAPI()
        .then((response) => {
          this.slotBookingLaunched = response.data.data.flags['release-slot-booking-launched'];
        })
        .catch((error) => {
          this.$noty.error(error);
        });
    },
    // function to get the final payment status (both for success as well as failure)
    getFinalStatus() {
      if (this.$route.query.success) {
        document.title = 'Payment Success';
      } else {
        document.title = 'Payment Failure';
      }
      // Call the API
      getpaymentFinalStatus(this.$route.query.requestid)
        .then((response) => {
          if (response.status === 200) {
            this.paymentInfo = response.data.response.data;
            this.paymentInfo.type = response.data.response.data.type;
            this.documentTitle = `Payment Success | paidAmount: ${this.paymentInfo.amount}
              | transactionId: ${this.paymentInfo.transactionid}`;
            this.securedLoanClosed = this.paymentInfo.securedLoanClosed;
            if (this.paymentInfo.type !== 'repledge' && !this.paymentInfo.transactionid) {
              this.paymentInfo = null;
              this.errorOnSuccess = true;
              this.successFailureDescription = [
                {
                  message: 'Contact customer support for further assistance.',
                },
              ];
              this.documentTitle = 'Payment Failure';
            }
            if (this.paymentInfo.type === 'repledge') {
              this.paymentInfo.title = 'repledge_successful';
              if ((this.paymentInfo.loandata[0].loan.lenderid === 'yogakshemam'
                || this.paymentInfo.loandata[0].loan.lenderid === 'rupeek')
                && this.paymentInfo.loandata[0].loan.netweight > 0) {
                this.successFailureDescription = [
                  {
                    message: 'You will get the new pledge card via SMS.',
                  },
                ];
              } else {
                this.fetchOrderId(this.$route.query.requestid);
              }
            } else if (this.paymentInfo.type === 'part-release') {
              this.fetchPartReleaseOrderDetails();
            }
            this.paymentInfo.title = getPaymentOption(this.paymentInfo.type, true);
            this.paymentSummaryInfo = [
              {
                type: 'amount_paid',
                value: this.paymentInfo.amount,
                paymentOption: this.paymentInfo.type,
                hasNotAmount: !this.paymentInfo.amount,
              },
              {
                type: 'paid_on',
                value: moment(this.paymentInfo.recordedon).format('DD MMM YY'),
                paymentOption: this.paymentInfo.type,
                hasNotAmount: true,
              },
              {
                type: 'reference_id',
                value: this.paymentInfo.transactionid,
                paymentOption: this.paymentInfo.type,
                hasNotAmount: true,
              },
            ];
            this.sendPaymentSuccessOrFailureEvent(this.currentRequestId, true);
          }
        })
        .catch((error) => {
          this.errorOnSuccess = true;
          if (error.response.data.error) {
            const errorData = error.response.data.response;
            const { type } = errorData.data;
            this.paymentInfo = error.response.data.error;
            this.paymentInfo.type = errorData.data.type;
            this.documentTitle = 'Payment Failed';
            if (this.paymentInfo.type === 'part-release' && !errorData.data.amount) {
              this.errorOnSuccess = false;
              this.paymentInfo = null;
              this.paymentInfo = { type };
              this.fetchPartReleaseOrderDetails();
            }
            this.paymentInfo.title = getPaymentOption(this.paymentInfo.type, false);
            this.successFailureDescription = [
              errorData.mesg && { message: errorData.mesg },
              errorData.mesg_secondary && { message: errorData.mesg_secondary },
            ];
            if (error.response.data.error.error_message) {
              this.$noty.error(error.response.data.error.error_message);
            }
            this.sendPaymentSuccessOrFailureEvent(this.currentRequestId, false);
          }
        });
    },
    fetchPartReleaseOrderDetails() {
      const tempObj = {
        process: 'PART_RELEASE',
        pageNumber: 0,
        ...(this.currentRequestId && { referenceId: this.currentRequestId }),
        ...(this.$route.query.orderId && { orderId: this.$route.query.orderId }),
      };
      this.paymentSummaryInfo = [];
      fetchPartReleaseOrdersAPI(tempObj)
        .then((responses) => {
          let partReleasePayableAmount = 0;
          let selectedJewelsCount = 0;
          let selectedJewelsGrossWeight = 0;
          responses.data.orders.map((order) => {
            partReleasePayableAmount += order.payableAmount;
            this.paymentInfo.title = order.paymentStatus
              && order.paymentStatus.toLowerCase() === 'success'
              ? 'part_release_successful' : 'part_release_pending';
            this.currentRequestId = _.get(order, 'paymentReferenceId')
              ? _.get(order, 'paymentReferenceId') : this.currentRequestId;
            order.orderItems.map((item) => {
              selectedJewelsCount += item.jewelSelected.length;
              selectedJewelsGrossWeight += item.jewelsSelectedGrossWeight;
              return true;
            });
            return true;
          });
          this.paymentSummaryInfo = [
            {
              type: 'amount_paid',
              value: partReleasePayableAmount !== 0 ? partReleasePayableAmount : 'No Cost',
              paymentOption: this.paymentInfo.type,
              hasNotAmount: !partReleasePayableAmount,
            },
            {
              type: 'paid_on',
              value: moment(this.paymentInfo.recordedon).format('DD MMM YY'),
              paymentOption: this.paymentInfo.type,
              hasNotAmount: true,
            },
            {
              type: 'reference_id',
              value: this.currentRequestId,
              paymentOption: this.paymentInfo.type,
              hasNotAmount: true,
            },
            {
              type: 'jewels_released',
              value: selectedJewelsCount,
              paymentOption: this.paymentInfo.type,
              hasNotAmount: true,
            },
            {
              type: 'jewel_weight',
              value: `${selectedJewelsGrossWeight} gms`,
              paymentOption: this.paymentInfo.type,
              hasNotAmount: true,
            },
          ];
        })
        .catch((error) => {
          this.$noty.error(error.response.data.error.error_message);
        });
    },
    // for fetching orderid from rpk id
    fetchOrderId(rpkid) {
      getOrderId(rpkid)
        .then((response) => {
          this.fetchOrderDetails(response.data && response.data.orderId, rpkid);
        })
        .catch((error) => {
          this.$noty.error(error.response.data.error.error_message);
        });
    },
    fetchOrderDetails(orderid, rpkid) {
      getorderStatus(orderid)
        .then((response) => {
          if (response.data.order.signingmethod.name === 'esign') {
            this.$router.push(`/esign-status/${orderid}`);
          // eslint-disable-next-line no-mixed-operators
          } else if ((_.get(response, 'data.order.signingmethod')
            && ((_.get(response, 'data.order.signingmethod.name') === 'digital'
            && _.get(response, 'data.order.signingstatus') === 'pending')))
            || (_.get(response, 'data.order.signingmethod.name') === 'offline')
          ) {
            this.$router.push(`/payment-status/${orderid}`);
          } else {
            this.$router.push(`/order-status/${orderid}/${rpkid}`);
          }
        })
        .catch((error) => {
          this.$noty.error(error.response.data.error.error_message);
        });
    },
    sendPaymentSuccessOrFailureEvent(requestId, success) {
      getLoanDetailForRequestId(requestId)
        .then((response) => {
          const eventData = response.data.response.data;
          const coreIds = [];
          const lenders = [];
          if (eventData.loandata) {
            const loanDetails = [];
            eventData.loandata.forEach((loanData) => {
              const loansInfo = {
                partPaymentAmount: loanData.paidamount,
                partPaymentCashback: loanData.loan.cashbackamount,
                loanId: loanData.loan.coreid,
              };
              loanDetails.push(loansInfo);
            });
            store.dispatch('loans/partPaymentAmount', eventData.amount);
            store.dispatch('loans/partPaymentInfo', loanDetails);
            eventData.loandata.sort((componentA, componentB) => {
              const data = componentB.loan.netweight - componentA.loan.netweight;
              return data;
            });
            let loanDetailsInfo = [];
            eventData.loandata.forEach((loanComponent) => {
              loanDetailsInfo.push(!loanComponent.loan.netweight);
              coreIds.push(loanComponent.loan.coreid);
              lenders.push(this.lendersConfig[loanComponent.loan.lenderid].name);
            });
            loanDetailsInfo = [...new Set(loanDetailsInfo)];
            this.hasUnsecuredLoanClosed = loanDetailsInfo.includes(true)
              && loanDetailsInfo.length === 1;
          }
          const properties = {
            [events.PAYMENT_ACTION]:
              mapCleverTapProperty(eventData.type === 'part-release'
                ? 'partRelease' : eventData.type).action,
            [events.PAYMENT_CORE_ID]: coreIds.join(','),
            [events.PAYMENT_AMOUNT]: formatRupeeAmount(eventData.amount),
            [events.PAYMENT_LENDER_ID]: _.uniq(lenders).join(' & '),
            [events.PAYMENT_RPK_ID]: this.currentRequestId,
          };
          const eventCategory = success
            ? events.category.PAYMENT_SUCCESSFUL : events.category.PAYMENT_UNSUCCESSFUL;
          sendEvent(events.screen.PAYMENT_SUCCESS, eventCategory, properties);
          properties[events.EVENT_NAME] = success
            ? events.PAYMENT_SUCCESSFUL : events.PAYMENT_UNSUCCESSFUL;
          sendEvent(events.screen.PAYMENT_SUCCESS, events.category.PAYMENT, properties);
        })
        .catch((error) => {
          this.$noty.error(error.response.data.error.error_message);
        });
    },
    getStaticMessages(identifierType) {
      getStaticMessageAPI(identifierType)
        .then((responses) => {
          this.staticMessages = responses.data.data;
        })
        .catch((error) => {
          this.$noty.error(error);
        });
    },
    getIdentifier(staticMessages, identifierType) {
      let staticMessagesObject = {};
      staticMessages.forEach((order) => {
        if (identifierType === order.identifier) {
          staticMessagesObject = order;
        }
      });
      return staticMessagesObject;
    },
  },
  mounted() {
    this.checkFinalStatus();
  },
};
</script>
