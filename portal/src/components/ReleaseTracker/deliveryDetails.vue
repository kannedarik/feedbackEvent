<template>
  <div class="white-background w-100 border-box" v-if="!_.isEmpty(deliveryDetails)">
    <div class="box-bg p-4 d-flex justify-content-between">
      <div class="d-flex align-items-center">
        <img src="@/assets/calendar_check.svg" alt="calendar_check"
          v-if="!((_.get(deliveryDetails,
            'orderStatus') === releaseDeliveryStatus.SLOT_UNAVAILABLE
            || _.get(deliveryDetails,
              'orderStatus') === releaseDeliveryStatus.PAYMENT_SUCCESSFUL)
            && !_.get(deliveryDetails, 'relatedLoan'))"/>
        <div class="ml-3">
          <h3 class="bold-font"
            v-if="_.get(deliveryDetails, 'progressInfo.staticKey') === 'release_arrived'">
            Arrived at your location
          </h3>
          <div v-else-if="_.get(deliveryDetails, 'releaseSlotStart')">
            <p class="arrival-text text-uppercase normal-font">
              Estimated Arrival
            </p>
            <h3 class="bold-font">
              <span v-if="_.get(deliveryDetails, 'releaseSlotStart')
                && !_.get(deliveryDetails, 'releaseSlotEnd')">
                {{getReleaseTimeSlot(_.get(deliveryDetails, 'releaseSlotStart'))}},
              </span>
              <span v-if="_.get(deliveryDetails, 'releaseSlotStart')
                && _.get(deliveryDetails, 'releaseSlotEnd')">
                {{getReleaseTimeSlot(_.get(deliveryDetails, 'releaseSlotStart'))}}
                - {{getReleaseTimeSlot(_.get(deliveryDetails, 'releaseSlotEnd'))}},
              </span>
              {{
                getDate(_.get(deliveryDetails, 'releaseSlotEnd')
                ? _.get(deliveryDetails, 'releaseSlotEnd')
                : _.get(deliveryDetails, 'releaseSlotStart'))
              }}
            </h3>
          </div>
          <div v-else-if="
            (_.get(deliveryDetails, 'orderStatus') === releaseDeliveryStatus.SLOT_UNAVAILABLE
            || _.get(deliveryDetails, 'orderStatus') === releaseDeliveryStatus.PAYMENT_SUCCESSFUL)
            && !_.get(deliveryDetails, 'relatedLoan')">
            <h3 class="bold-font">Please Book a slot for Gold Delivery</h3>
          </div>
          <div v-else-if="
            _.get(deliveryDetails, 'orderStatus') === releaseDeliveryStatus.SLOT_PENDING">
            <h3 class="bold-font">
              {{ getDeliveryDetailsInfo(identifier)}}
            </h3>
          </div>
          <h3 v-else class="bold-font">Delivery Status</h3>
        </div>
      </div>
      <h4 class="bold-font reschedule-slot cursor-pointer" @click="rescheduleSlot()"
      v-if="_.get(deliveryDetails, 'canReschedule') && slotBookingLaunched">
        Change
      </h4>
    </div>
    <div class="address d-flex align-items-center p-3 inter-font-family">
      <img src="@/assets/icons/address_icon.svg" alt="location_icon"/>
      <p class="ml-3">{{_.get(deliveryDetails, 'releaseAddress')}}</p>
    </div>
    <div class="p-3">
      <b-progress :value="progressValue"
        variant="success" animated></b-progress>
    </div>
    <p class="px-3 mb-3 medium-font-weight inter-font-family">
      {{
        getDeliveryDetailsInfo(_.get(deliveryDetails, 'progressInfo.staticKey'))
      }}
    </p>
    <div class="text-xs inter-font-family px-3 mb-3 d-flex align-items-center">
      <p class="tertiary-color">Last updated:</p>
      <p class="ml-1">
        {{lastUpdateTime}}
      </p>
      <p class="ml-3 reschedule-slot cursor-pointer d-flex align-items-center"
      @click="refresh">
        Refresh
        <img src="@/assets/icons/arrow_counter_clock_wise.svg"
          alt="arrow_counter_clock_wise" class="ml-1"/>
      </p>
    </div>
    <div class="text-center pb-4 pt-2"
      v-if="(_.get(deliveryDetails, 'orderStatus') === 'SLOT_UNAVAILABLE'
      || _.get(deliveryDetails, 'orderStatus') === 'PAYMENT_SUCCESSFUL')
        && !_.get(deliveryDetails, 'relatedLoan') && slotBookingLaunched">
      <button class="btn-primary-rupeek d-w-50 mx-auto"
        @click="trackyourGold(
          _.get(deliveryDetails, 'orderID'),
          _.get(deliveryDetails, 'progressInfo.staticKey'),
        )">
        Book Slot for Delivery
      </button>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import moment from 'moment';
import ReleaseSlotBookingMixins from '@/mixins/ReleaseSlotBookingMixins';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';
import constants from '@/constant';

export default {
  name: 'deliveryDetailsCard',
  props: {
    deliveryDetails: {
      type: Object,
      required: true,
    },
    messagesInfo: {
      type: Object,
      required: true,
    },
    slotBookingLaunched: {
      type: Boolean,
    },
    lastUpdateTime: {
      type: String,
    },
  },
  mixins: [ReleaseSlotBookingMixins],
  computed: {
    _() {
      return _;
    },
  },
  data() {
    return {
      timer: null,
      progressValue: 5,
      releaseDeliveryStatus: constants.releaseDeliveryStatus,
      slotBookinCompleted: [
        constants.releaseDeliveryStatus.DELIVERY_COMPLETED,
        constants.releaseDeliveryStatus.SLOT_BOOKED,
        constants.releaseDeliveryStatus.DELIVERY_INITIATED,
      ],
      identifier: 'release_slot_pincode_unserviceable',
    };
  },
  methods: {
    moment: (date) => moment(date),
    getDeliveryDetailsInfo(key) {
      const staticMessage = !_.isEmpty(this.messagesInfo) ? this.messagesInfo[key] : {};
      const message = !_.isEmpty(staticMessage) ? staticMessage.content.message : '';
      return message;
    },
    rescheduleSlot() {
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_CHANGE_SLOT_CLICKED,
        [events.PAYMENT_ORDER_ID]: _.get(this.deliveryDetails, 'orderID'),
        [events.PAYMENT_STATIC_KEY]: _.get(this.deliveryDetails, 'progressInfo.staticKey'),
      };
      sendEvent(events.screen.PAYMENT_STATUS_CARD_DETAILS, events.category.PAYMENT, properties);
      this.$emit('rescheduleSlot', true);
    },
    trackyourGold(orderId, staticKey) {
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_BOOK_GOLD_DELIVERY_SLOT_CLICKED,
        [events.PAYMENT_ORDER_ID]: orderId,
        [events.PAYMENT_STATIC_KEY]: staticKey,
      };
      sendEvent(events.screen.PAYMENT_STATUS_CARD_DETAILS, events.category.PAYMENT, properties);
      this.$router.push(`/release-slot-booking?orderId=${orderId}`);
    },
    refresh() {
      this.$emit('refresh');
    },
  },
  mounted() {
    this.timer = setInterval(() => {
      this.progressValue = _.get(this.deliveryDetails, 'progressInfo.value');
    }, 2000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
    this.timer = null;
  },
};
</script>
