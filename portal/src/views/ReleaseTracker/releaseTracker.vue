<template>
  <Container>
    <div class="leadform z-index-999" v-if="rescheduleSlotBooking"></div>
    <div class="gold-release-tracker white-background">
      <div class="d-flex flex-wrap align-content-between" v-if="isComponentLoaded">
        <template v-if="currentStatusCode < 7">
          <div class="p-2 defult-bg w-100"></div>
          <div class="white-background d-flex align-items-center p-3 header w-100">
            <img src="@/assets/icons/left_arrow.svg" alt="left_arrow"
              @click="moveToHome()" class="cursor-pointer" />
            <h1 class="font-semibold text-lg ml-3">
              Track your Gold
            </h1>
          </div>
          <ReleaseOTP v-if="releaseOtp && releaseOtp.length"
            :releaseOTP="releaseOtp" />
          <VideoBanner
            v-else-if="(6.5 > currentStatusCode && assets.length)"
            :assets="getAssets"
            :eventDetails="eventDetails" />
          <DeliveryDetails
            :deliveryDetails="deliveryDetails"
            :messagesInfo="staticMessage"
            :slotBookingLaunched="slotBookingLaunched"
            :lastUpdateTime="lastUpdatedDate"
            v-on:rescheduleSlot="rescheduleSlot($event)"
            v-on:refresh="refresh()"
            v-if="!hasRefresh"
          />
          <div class="sm:px-3 md:px-8 w-100" v-if="hasRefresh">
            <div class="border border-blue-300 rounded-md w-full mx-auto">
              <div class="animate-pulse">
                <div class="h-28 bg-slate-200 w-full"></div>
                <div class="h-12 bg-slate-500 w-full"></div>
                <div class="space-y-3 p-3">
                  <div class="h-3 bg-slate-500 rounded"></div>
                  <div class="h-5 bg-slate-500 rounded w-full"></div>
                  <p>{{`We’re fetching your delivery status`}}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="loan-manager-info d-flex align-items-center p-3 w-100 inter-font-family"
            v-if="(_.get(deliveryDetails, 'progressInfo.staticKey' || '') === 'release_start')
              && _.isEmpty(this.loanManagerInfo.header)">
            <img src="@/assets/icons/loan_manager_Info.svg" alt="lm_info" />
            <p class="ml-3">{{loanManagerInfoMessage}}</p>
          </div>
          <SlotInstruction
            :slotInstruction="getSlotInstruction"
            :loanManagerInfo="loanManagerInfo"
            class="border-box"
          />
          <div class="p-4 w-100 d-flex align-items-center justify-content-center info-text">
            <div class="d-flex align-items-center">
              <img src="@/assets/shield_check.svg" alt="shield_check" />
              <span class="ml-2 text-bg inter-font-family">
                Secure Gold Delivery
              </span>
            </div>
            <div class="d-flex align-items-center ml-5">
              <img src="@/assets/circle_wavy_check.svg" alt="circle_wavy_check" />
              <span class="ml-2 text-bg inter-font-family">
                100% Insured
              </span>
            </div>
          </div>
        </template>
        <template v-else>
          <GoldDeliverySuccessful />
        </template>
        <JewelsList :jewelsList="releaseJewelsList" :currentStatusCode="currentStatusCode"/>
      </div>
    </div>
    <transition
      name="custom-classes-transition"
      enter-active-class="animated slideInUp"
      leave-active-class="animated slideOutDown">
      <CustomerAddressJewels
        :hasChangeAddress="true"
        :addressDetails="addressDetails"
        :currentOrderId="this.$route.params.id"
        :hasUpdateSelectedAddress="false"
        v-on:closeOnboarding="closeOnboarding($event)"
        v-if="rescheduleSlotBooking" />
    </transition>
  </Container>
</template>

<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import store from '@/store';
import { getPartReleaseFeatureFlagAPI } from '@/api/partRelease.api';
import Container from '@/components/CommonComponents/Container.vue';
import ReleaseOTP from '@/components/ReleaseTracker/releaseOTP.vue';
import VideoBanner from '@/components/ReleaseTracker/videoBanner.vue';
import DeliveryDetails from '@/components/ReleaseTracker/deliveryDetails.vue';
import SlotInstruction from '@/components/CommonComponents/SlotInstruction.vue';
import GoldDeliverySuccessful from '@/components/ReleaseTracker/goldDeliverySuccessful.vue';
import JewelsList from '@/components/ReleaseTracker/jewelsList.vue';
import CustomerAddressJewels from '@/components/CommonComponents/CustomerAddressJewelsInfo.vue';
import ReleaseSlotBookingMixins from '@/mixins/ReleaseSlotBookingMixins';
import assetsFromFirebase from '@/mixins/assetsFromFirebase';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';

export default {
  components: {
    Container,
    ReleaseOTP,
    VideoBanner,
    DeliveryDetails,
    SlotInstruction,
    GoldDeliverySuccessful,
    JewelsList,
    CustomerAddressJewels,
  },
  data() {
    return {
      // Boolean is used to store the total component is loaded are not
      isComponentLoaded: false,
      // Array is used to store the release jewels details
      releaseJewelsList: [],
      // Array is used to store the OTP number in array
      releaseOtp: [],
      // Object is used to store the jewels delivery details
      deliveryDetails: {},
      // Object is used to store the loan manager details and release instruction
      loanManagerInfo: {},
      // Object is used to store the loan manager details
      loanManager: {},
      // String is used to store the loan manager info message
      loanManagerInfoMessage: '',
      // Variable is used to store the current status code
      currentStatusCode: 0,
      eventDetails: {
        relatedLoan: [],
      },
      rescheduleSlotBooking: false,
      lenderInfo: [],
      slotBookingLaunched: false,
      hasRefresh: false,
    };
  },
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
    ...mapGetters({
      addressDetails: 'releaseSlotBooking/addressDetails',
      resetslotBooking: 'releaseSlotBooking/resetslotBooking',
    }),
  },
  watch: {
    staticMessages(message) {
      if (!_.isEmpty(this.loanManager)) {
        this.loanManagerInfo = {
          header: this.loanManager,
        };
      }
      message.forEach((messageList) => {
        if ((messageList.identifier === 'loan_manager_arrival_message')
            && !_.isEmpty(this.loanManagerInfo.header)
            && _.get(this.deliveryDetails, 'progressInfo.staticKey' || '') === 'release_start') {
          this.loanManagerInfo.header.message = messageList.content.message;
        }
        if (messageList.identifier === 'loan_manager_default_message') {
          this.loanManagerInfoMessage = messageList.content.message;
        }
      });
    },
    resetslotBooking(value) {
      if (value.resetReleaseTracker) {
        this.getOrdersList({ orderId: this.$route.params.id }, 'release-status');
      }
    },
  },
  mixins: [ReleaseSlotBookingMixins, assetsFromFirebase],
  methods: {
    getOrdersDetails(orders, jewelsList) {
      this.hasRefresh = false;
      this.getPartReleaseFeatureFlag();
      const jewelSelectedId = [];
      if (orders.length) {
        orders.forEach((order) => {
          this.eventDetails.staticKey = order.progress.staticKey;
          this.eventDetails.relatedLoan.push(order.relatedLoan);
          this.currentStatusCode = +order.statusCode;
          this.releaseOtp = order.releaseOtp && (order.releaseOtp.toString()).split('');
          this.deliveryDetails = {
            progressInfo: order.progress,
            releaseSlotStart: order.releaseSlotStart,
            releaseSlotEnd: order.releaseSlotEnd,
            releaseAddress: order.releaseAddress,
            canReschedule: order.canReschedule,
            orderID: order.id,
            orderStatus: order.releaseDeliveryStatus,
            relatedLoan: order.relatedLoan,
          };
          if (order.loanManager) {
            this.loanManager = order.loanManager;
          }
          store.dispatch('releaseSlotBooking/orderCityInfo', {
            cityName: _.capitalize(order.cityName),
            cityId: +order.cityId,
          });
          order.orderItems.forEach((orderItem) => {
            orderItem.loanDetails.map((loan) => this.lenderInfo.push(loan.lender));
            orderItem.jewelSelected.map((jewels) => jewelSelectedId.push(jewels));
          });
        });
        this.lenderInfo = [...new Set(this.lenderInfo)];
        jewelSelectedId.forEach((selectedJewel) => {
          this.releaseJewelsList.push(jewelsList[selectedJewel]);
        });
      }
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_VISITED_STATUS_CARD_DETAILS,
        [events.PAYMENT_STATIC_KEY]: this.eventDetails.staticKey,
        [events.PAYMENT_ORDER_ID]: this.$route.params.id,
        [events.PAYMENT_RELATEDLOAN]: this.eventDetails.relatedLoan.join(','),
      };
      sendEvent(events.screen.PAYMENT_STATUS_CARD_DETAILS, events.category.PAYMENT, properties);
      if (this.releaseOtp && this.releaseOtp.length) {
        properties[events.EVENT_NAME] = events.PAYMENT_VIEWED_OTP_DETAILS;
        sendEvent(events.screen.PAYMENT_STATUS_CARD_DETAILS, events.category.PAYMENT, properties);
      }
      if (this.currentStatusCode < 7) {
        properties[events.EVENT_NAME] = events.PAYMENT_VIEWED_GOLD_DELIVERY_SUCCESSFUL_STATUS;
        sendEvent(events.screen.PAYMENT_STATUS_CARD_DETAILS, events.category.PAYMENT, properties);
      }
      this.isComponentLoaded = true;
    },
    rescheduleSlot(event) {
      if (!this.addressDetails) {
        this.getCustomerAddressInfo();
      }
      this.rescheduleSlotBooking = event;
    },
    closeOnboarding(event) {
      this.rescheduleSlotBooking = false;
      if (event === 'confirm-address') {
        store.dispatch('releaseSlotBooking/setRescheduleSlotBooking', true);
        this.$router.push(`/release-slot-booking?orderId=${this.$route.params.id}`);
      }
    },
    // API call to get feature flag based on this flag display the Partial Release option
    getPartReleaseFeatureFlag() {
      getPartReleaseFeatureFlagAPI()
        .then((response) => {
          this.slotBookingLaunched = response.data.data.flags['release-slot-booking-launched'];
        })
        .catch((error) => {
          this.$noty.error(error.message);
        });
    },
    refresh() {
      this.hasRefresh = true;
      this.getOrdersList({ orderId: this.$route.params.id }, 'release-status');
    },
  },
  mounted() {
    this.getAssetsFromFirebase('gold_track_doorstep');
    this.getOrdersList({ orderId: this.$route.params.id }, 'release-status');
  },
};
</script>
<style lang="scss">
@import "@/scss/releaseTracker/releaseTracker.scss";
.address {
  background: rgba(251, 196, 65, 0.45);
  backdrop-filter: blur(8px);
}
.tertiary-color {
  color: #788193 !important;
}
</style>
