<template>
  <Container>
    <div class="release-slot">
      <div class="mb-4 w-100">
        <img src="@/assets/icons/closing_block_icon.svg" alt="closing_block_icon"
          class="float-right mt-3 mr-3 cursor-pointer" @click="moveToHome()" />
        <div class="px-4 py-3">
          <div class="checkmark-circle">
            <div class="background"></div>
            <div class="checkmark-check draw"></div>
          </div>
          <div class="gold-initiated text-center">
            <h2 class="my-3 bold-font text-center">
              {{ hasRescheduleSlotBooking
                  ? 'Gold Delivery Slot Changed'
                  : 'Gold Delivery Initiated'
              }}
            </h2>
            <div v-if="!hasRescheduleSlotBooking"
              class="inter-font-family">
              <p class="medium-font-weight">
                Amount Paid
              </p>
              <h2 class="bold-font amount">
                {{formatRupeeAmount(totalPaidAmount)}}
              </h2>
              <p class="small medium-font-weight my-2">
                Paid on <span>{{moment(paymentDate).format('DD MMM YYYY')}}</span>
              </p>
              <p class="medium-font-weight">
                Reference ID: <span>{{paymentReferenceId}}</span>
              </p>
            </div>
            <div v-else>
              <p>You have sucessfully changed the Delivery address</p>
            </div>
          </div>
        </div>
      </div>
      <div class="bo"></div>
      <div class="py-4 sm:px-3 md:px-8">
        <h3 class="bold-font mb-3">
          {{ hasRescheduleSlotBooking
              ? 'Delivery Slot Details' : 'Gold Delivery Details'
          }}
        </h3>
        <div class="white-background w-100 border-box mb-4"
          v-for="(order, index) in  goldDeliveryDetails" :key="index">
          <div class="box-bg p-4">
            <div v-if="order.relatedLoan" class="d-flex align-items-center">
              <img src="@/assets/icons/call_icon.svg" alt="call_icon" />
              <h3 class="ml-3 bold-font">
                Gold Delivery Status
              </h3>
            </div>
            <div v-else-if="!order.relatedLoan
              && (order.releaseDeliveryStatus === releaseDeliveryStatus.SLOT_UNAVAILABLE
              || order.releaseDeliveryStatus === releaseDeliveryStatus.PAYMENT_SUCCESSFUL)">
              <h3 class="bold-font">Please Book a slot for Gold Delivery</h3>
            </div>
            <div class="d-flex align-items-center"
              v-else-if="order.releaseDeliveryStatus === releaseDeliveryStatus.SLOT_PENDING">
              <img src="@/assets/icons/call_icon.svg" alt="call_icon" />
              <h3 class="ml-3 bold-font">
                {{ _.get(getSlotPincodeUnserviceable, 'content.message') }}
              </h3>
            </div>
            <div v-else-if="order.releaseDeliveryStatus !== releaseDeliveryStatus.SLOT_UNAVAILABLE"
              class="d-flex align-items-center">
              <img src="@/assets/calendar_check.svg" alt="calendar_check" />
              <div class="ml-3">
                <p class="arrival-text text-uppercase normal-font">
                  {{order.jewelsList.length}} GOLD JEWELS ARRIVING AT
                </p>
                <h3 class="bold-font" v-if="order.customerreachingtime">
                  {{getTimeSlots(order)}}
                  {{getDate(order.slotend)}}
                </h3>
                <h3 v-else class="bold-font">
                  No Slot Booked
                </h3>
              </div>
            </div>
          </div>
          <div v-if="order.relatedLoan">
            <p class="px-4 my-3 medium-font-weight related-loan-message">
              {{ _.get(getRelatedLoanInfo, 'content.message') }}
            </p>
          </div>
          <ul class="timeline inter-font-family">
            <li class="completed">Payment <br />Successful</li>
            <li :class="{'completed': slotBookinCompleted.includes(order.releaseDeliveryStatus)
              , 'slot-unavailable':
                order.releaseDeliveryStatus === releaseDeliveryStatus.SLOT_UNAVAILABLE}">
              Slot<br />Booked
            </li>
            <li :class="{'completed': deliveryInitiated.includes(order.releaseDeliveryStatus)}">
              Gold Delivery <br />Intiated
            </li>
            <li :class="{'completed':
              order.releaseDeliveryStatus === releaseDeliveryStatus.DELIVERY_COMPLETED}">
              Gold <br />Delivered
            </li>
          </ul>
          <div class="mx-3 mt-4 mb-3">
          <DeliveryAddress
            :deliveryAddress="{displayText: order.releaseAddress}"
            :hasSlotBookingScreen="false"
            v-if="slotBookinCompleted.includes(order.releaseDeliveryStatus)"
          />
          </div>
          <div class="text-center pb-4 pt-2"
            v-if="order.releaseDeliveryStatus !== releaseDeliveryStatus.SLOT_PENDING
              && !order.relatedLoan">
            <button class="btn btn-primary-rupeek d-w-50 mx-auto"
              @click="trackyourGold(
                order.releaseDeliveryStatus === releaseDeliveryStatus.SLOT_UNAVAILABLE,
                order.orderId)">
              {{
                order.releaseDeliveryStatus === releaseDeliveryStatus.SLOT_UNAVAILABLE
                ? 'Book Slot for Delivery' : 'Track your Gold'
              }}
            </button>
          </div>
        </div>
      </div>
      <div class="d-flex bg-info sm:px-3 md:px-8 py-4" v-if="!hasRescheduleSlotBooking">
        <img src="@/assets/icons/info_icon.svg" alt="into_icon" class="mr-2" width="24px" />
        <p class="medium-font-weight inter-font-family">
          {{ _.get(getSlotInstructionInfo, 'content.message') }}
          <span class="btn-transparent" @click="scrollToElement">
            Read more
          </span>
        </p>
      </div>
      <div class="sm:px-3 sm:py-3 md:p-8" v-if="!hasRescheduleSlotBooking">
        <h4 class="bold-font mb-3">
          Gold for Delivery
        </h4>
        <div class="mb-4" v-for="(jewelsinfo, index) in goldDeliveryDetails" :key="index">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <p class="medium-font-weight" v-if="jewelsinfo.customerreachingtime">
              {{getTimeSlots(jewelsinfo)}}
              {{getDate(jewelsinfo.slotend)}}
            </p>
            <p class="medium-font-weight" v-else>
              No Slot Booked
            </p>
            <div class="flex">
              <img src="@/assets/icons/jewels_icon.svg" alt="jewels_icon">
              <span class="ml-2 medium-font-weight fnt-12">
                {{jewelsinfo.jewelsList.length}} Gold <br />Jewels
              </span>
            </div>
          </div>
          <JewelsCarousel :jewelsList="jewelsinfo.jewelsList" :index="index"
            class="margin-top" />
        </div>
      </div>
      <div class="sm:px-3 sm:py-3 md:p-8 closed-loans"
        v-if="!hasRescheduleSlotBooking">
        <h4 class="text-lg mb-3 font-bold">
          Closed Loans ({{loanDetails.length}})
        </h4>
        <ClosureLoanDetails
          :loanDetails="getLoanDetails"
          v-if="loanDetails.length"
        />
      </div>
      <div class="sm:px-3 sm:py-3 md:p-8 bg-info" id="important-info"
        v-if="!hasRescheduleSlotBooking">
        <SlotInstruction
          :slotInstruction="getSlotInstruction"
        />
      </div>
    </div>
  </Container>
</template>

<script>
import _ from 'lodash';
import moment from 'moment';
import { mapGetters } from 'vuex';
import store from '@/store';
import Container from '@/components/CommonComponents/Container.vue';
import DeliveryAddress from '@/components/CommonComponents/DeliveryAddress.vue';
import JewelsCarousel from '@/components/ReleaseTracker/jewelsCarousel.vue';
import SlotInstruction from '@/components/CommonComponents/SlotInstruction.vue';
import ClosureLoanDetails from '@/components/CommonComponents/closureLoanDetails.vue';
import ReleaseSlotBookingMixins from '@/mixins/ReleaseSlotBookingMixins';
import { formatRupeeAmount } from '@/utils/string';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';
import constants from '@/constant';

export default {
  name: 'ReleaseConfirmation',
  data() {
    return {
      releaseDeliveryStatus: constants.releaseDeliveryStatus,
      totalPaidAmount: 0,
      paymentDate: null,
      paymentReferenceId: null,
      goldDeliveryDetails: [],
      settings: constants.closedLoansCarouselSettings,
      currentOrderId: [],
      orderIdStatusCode: [],
      lenderInfo: [],
      slotBookinCompleted: [
        constants.releaseDeliveryStatus.DELIVERY_COMPLETED,
        constants.releaseDeliveryStatus.SLOT_BOOKED,
        constants.releaseDeliveryStatus.DELIVERY_INITIATED,
      ],
      deliveryInitiated: [
        constants.releaseDeliveryStatus.DELIVERY_COMPLETED,
        constants.releaseDeliveryStatus.DELIVERY_INITIATED,
      ],
      loanDetails: [],
    };
  },
  components: {
    Container,
    ClosureLoanDetails,
    DeliveryAddress,
    JewelsCarousel,
    SlotInstruction,
  },
  mixins: [ReleaseSlotBookingMixins],
  computed: {
    _() {
      return _;
    },
    getSlotInstruction() {
      let staticMessages = {};
      if (!_.isEmpty(this.staticMessage)) {
        staticMessages = this.lenderInfo.includes('icici')
          ? this.staticMessage.release_slot_instruction_icici
          : this.staticMessage.release_slot_instruction;
      }
      return staticMessages;
    },
    getSlotInstructionInfo() {
      return !_.isEmpty(this.staticMessage) ? this.staticMessage.release_slot_instruction_info : {};
    },
    getSlotPincodeUnserviceable() {
      return !_.isEmpty(this.staticMessage)
        ? this.staticMessage.release_slot_pincode_unserviceable : {};
    },
    getRelatedLoanInfo() {
      return !_.isEmpty(this.staticMessage)
        ? this.staticMessage.release_slot_related_loan : {};
    },
    ...mapGetters({
      hasRescheduleSlotBooking: 'releaseSlotBooking/hasRescheduleSlotBooking',
      lendersConfig: 'loans/lendersConfig',
    }),
    getLoanDetails() {
      const loansInfo = [];
      this.loanDetails.forEach((loan) => {
        loansInfo.push({
          payableAmount: this.getTotalAmount(loan.loanDetails, 'payableAmount'),
          lendersInfo: this.lendersInfo(loan.loanDetails),
          loanId: this.getLoanId(loan.loanDetails).loanId,
          loanDate: this.getLoanId(loan.loanDetails).loanDate,
          loanAmount: this.getTotalAmount(loan.loanDetails, 'loanAmount'),
          jewelsList: this.getOrnamentList(loan.jewelsList),
        });
      });
      return loansInfo;
    },
  },
  methods: {
    formatRupeeAmount,
    moment: (date) => moment(date),
    getLoanId(loanDetails) {
      const secureLoan = loanDetails.filter((loan) => loan.type === 'secure');
      return secureLoan[0];
    },
    getTotalAmount(loan, type) {
      return loan && _.sumBy(loan, (key) => key[type]);
    },
    getOrdersDetails(orders, jewelsList) {
      if (orders.length) {
        orders.forEach((order) => {
          const jewelSelectedId = [];
          this.totalPaidAmount += order.payableAmount;
          this.paymentDate = order.paymentDate;
          this.paymentReferenceId = order.paymentReferenceId;
          const goldDeliveryDetails = {
            relatedLoan: order.relatedLoan,
            payableAmount: order.payableAmount,
            orderId: order.id,
            releaseDeliveryStatus: order.releaseDeliveryStatus,
            releaseAddress: order.releaseAddress ? order.releaseAddress : '',
            customerreachingtime: _.get(order, 'releaseSlotStart'),
            slotend: _.get(order, 'releaseSlotEnd'),
            jewelsList: [],
          };
          this.lenderInfo = [...order.lenders, ...this.lenderInfo];
          this.currentOrderId.push(order.id);
          this.orderIdStatusCode.push(`${order.id}-${order.releaseDeliveryStatus}`);
          order.orderItems.forEach((orderItem) => {
            const tempObj = {
              jewelsList: [],
            };
            orderItem.jewelSelected.forEach((jewels) => {
              tempObj.jewelsList.push(jewelsList[jewels]);
              jewelSelectedId.push(jewels);
            });
            tempObj.loanDetails = orderItem.loanDetails;
            tempObj.loanDetails = tempObj.loanDetails.map((loansInfo) => {
              const loanData = loansInfo;
              loanData.lenders = [];
              loanData.lenders.push(loanData.lender);
              if (_.get(loanData, 'clmLoans', []).length) {
                loanData.clmLoans.forEach((clmloan) => loanData.lenders.push(clmloan.lender));
              }
              loanData.lenders = [...new Set(loanData.lenders)];
              return loanData;
            });
            this.loanDetails.push(tempObj);
          });
          jewelSelectedId.forEach((selectedJewel) => {
            goldDeliveryDetails.jewelsList.push(jewelsList[selectedJewel]);
          });
          this.goldDeliveryDetails.push(goldDeliveryDetails);
        });
        this.lenderInfo = [...new Set(this.lenderInfo)];
      }
    },
    scrollToElement() {
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_READ_MORE_CLICKED,
        [events.RPK_ID]: this.paymentReferenceId,
        [events.PAYMENT_ACTION]: 'release',
        [events.PAYMENT_ORDER_STATUS]: this.orderIdStatusCode.join(','),
      };
      sendEvent(events.screen.RELEASE_CONFIRMATION, events.category.PAYMENT, properties);
      const element = document.getElementById('important-info');
      element.scrollIntoView({ behavior: 'smooth', block: 'end' });
    },
    trackyourGold(slotUnavailable, orderId) {
      let properties = {
        [events.PAYMENT_ACTION]: 'release',
        [events.PAYMENT_ORDER_ID]: this.currentOrderId.join(','),
      };
      if (slotUnavailable) {
        properties = {
          [events.EVENT_NAME]: events.PAYMENT_TRACK_YOUR_GOLD_CLICKED,
        };
        store.dispatch('releaseSlotBooking/setResetslotBooking',
          { reset: true, resetAll: false, resetReleaseTracker: false });
        this.$router.push({ path: 'release-slot-booking', query: this.$route.query });
      } else {
        properties = {
          [events.EVENT_NAME]: events.PAYMENT_BOOK_GOLD_DELIVERY_SLOT_CLICKED,
        };
        store.dispatch('releaseSlotBooking/setResetslotBooking',
          { reset: false, resetAll: false, resetReleaseTracker: true });
        this.$router.push(`/release-tracker/${orderId}`);
      }
      sendEvent(events.screen.RELEASE_CONFIRMATION, events.category.PAYMENT, properties);
    },
    getOrnamentList(jewelsList) {
      const result = Object.values(jewelsList.reduce((jewels, { ornamentType, noOfItems }) => {
        const data = jewels;
        const key = ornamentType;
        data[key] = data[key] || { ornamentType, ornamentCount: 0 };
        data[key].ornamentCount += noOfItems;
        return data;
      }, {}));
      return result;
    },
    checkRescheduleStatus() {
      let properties = {
        [events.PAYMENT_ACTION]: 'release',
      };
      if (this.hasRescheduleSlotBooking) {
        properties = {
          [events.EVENT_NAME]: events.PAYMENT_RESCHEDULE_SLOT_VISITED,
          [events.PAYMENT_ORDER_ID]: this.currentOrderId.join(','),
        };
      } else {
        properties = {
          [events.EVENT_NAME]: events.PAYMENT_RELEASE_CONFIRMATION_SCREEN_VISITED,
          [events.RPK_ID]: this.paymentReferenceId,
          [events.PAYMENT_ORDER_STATUS]: this.orderIdStatusCode.join(','),
        };
      }
      sendEvent(events.screen.RELEASE_CONFIRMATION, events.category.PAYMENT, properties);
    },
    lendersInfo(loansData) {
      const lenders = [];
      loansData.forEach((loan) => _.map(loan.lenders, (lender) => lenders.push(lender)));
      return [...new Set(lenders)];
    },
  },
  mounted() {
    store.dispatch('releaseSlotBooking/setResetslotBooking',
      { reset: false, resetAll: false, resetReleaseTracker: false });
    document.title = `Rupeek Payments | ${this.hasRescheduleSlotBooking
      ? 'Gold Delivery Slot Changed' : 'Gold Delivery Initiated'}`;
    store.dispatch('releaseSlotBooking/orderIdsList', []);
    store.dispatch('releaseSlotBooking/setSelectedAddress', {});
    this.checkRescheduleStatus();
    this.getOrdersList(this.$route.query, 'release_slot_confirmation_page');
  },
};
</script>
<style lang="scss">
@import "../../scss/common/mixins";
.gold-initiated {
  color: #1E2D4B;
  .amount {
    color: #5DA513;
  }
  p {
    color: #788193;
    font-size: 14px;
    span {
      color: #1E2D4B;
    }
    &.small {
      font-size: 12px;
    }
  }
}
.border-box {
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
  border-radius: 12px;
  .box-bg {
    background: linear-gradient(93.1deg, #FBC441 9.06%, rgba(251, 196, 65, 0.74) 85.96%);
    border-radius: 12px 12px 0px 0px;
  }
  @media screen and (max-width: 600px) {
    .p-4 {
      padding: 1rem !important;
    }
  }
}
.checkmark-circle {
  width: 80px;
  height: 80px;
  position: relative;
  display: inline-block;
  vertical-align: top;
  margin: 28px 0;
  left: 50%;
  @include transform(translateX(-50%));
  .background {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #76C11B;
    position: absolute;
    animation: animate 1700ms linear infinite;
  }
  .checkmark-check {
    border-radius: 5px;
    &.draw:after {
      @include animation-delay(100ms);
      @include animation-duration(1200ms);
      @include animation-timing-function(ease);
      @include animation-name(checkmark);
      @include transform(scaleX(-1) rotate(180deg + -45deg));
      @include animation-fill-mode(forwards);
    }
    &:after {
      opacity: 0;
      height: 0;
      width: 0;
      @include transform-origin(left, top);
      border-right: 8px solid #FFFFFF;
      border-top: 8px solid #FFFFFF;
      border-radius: 2px;
      content: "";
      left: 16px;
      top: 44px;
      position: absolute;
    }
  }
}

@include keyframes(checkmark) {
  0% { height: 0; width: 0; opacity: 1; }
  50% { height: 0; width: 24px; opacity: 1; }
  100% { height: 46px; width: 24px; opacity: 1; }
}

@include keyframes(animate) {
  0% { box-shadow: 0 0 0 0 #91cd49ed, 0 0 0 0  #91cd49d4; }
  40% { box-shadow: 0 0 0 20px #91cd4908, 0 0 0 10px #91cd49d4; }
  80% { box-shadow: 0 0 0 40px #91cd4908, 0 0 0 20px #91cd4908; }
  100% { box-shadow: 0 0 0 60px #91cd4901, 0 0 0 40px  #91cd4901; }
}
.bo {
  border: 6px solid #F2F2F2;
}
.related-loan-message {
  font-size: 14px;
  color: #4B576F;
}
.timeline {
  margin: 25px 0;
  position: relative;
  &:after {
    content: "";
    display: table;
    clear: both;
  }
}
li  {
  list-style: none;
  float: left;
  width: 25%;
  position: relative;
  text-align: center;
  color: #788193;
  font-size: 12px;
  &::before {
    content: '';
    width: 16px;
    height: 16px;
    background: #adadad;
    border-radius: 50%;
    display: block;
    text-align: center;
    line-height: 50px;
    margin: 0 auto 10px auto;
    transition: all ease-in-out .3s;
    cursor: pointer;
  }
  &::after {
    content: "";
    position: absolute;
    width: 65%;
    height: 2px;
    background: #adadad;
    border-radius: 2px;
    top: 8px;
    left: -32%;
    transition: all ease-in-out .3s;
  }
  &:first-child::after{
    content: none;
  }
  &.completed {
    color: #1E2D4B;
    &::before {
      background: url('../../assets/icons/completed_icon.svg');
      background-position: center;
    }
    &::after {
      background: #a0d94d;
    }
  }
  &.slot-unavailable {
    color: #D0243C;
    &::before {
      background: transparent;
      border: 2px solid #D0243C;
    }
    &::after {
      background: #D0243C;
    }
  }
}
.loan-card {
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.16), 0px 4px 16px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  border: none;
  width: 240px !important;
  .card-header {
    background: #FDEEE8;
    padding: 16px;
    border-radius: calc(0.75rem - 1px) calc(0.75rem - 1px) 0 0;
    border-bottom: none;
  }
  .card-body {
    padding: 0;
  }
  @media screen and (max-width: 600px) {
    width: 230px !important;
  }
}
</style>
