<template>
  <Container>
    <div class="gold-delivery-status w-100">
      <div class="block white-background status">
        <div class="mb-3 d-flex flex-align-center justify-content-between">
          <h3>
            Track your Gold
            <span class="font-success text-xs ml-1 success-bg px-2 py-1"
              v-if="progressValue !== 100">
              Live
            </span>
          </h3>
          <div v-if="_.get(firstReleaseGoldInfo, 'releaseSlotStart')
            || _.get(firstReleaseGoldInfo, 'releaseSlotEnd')">
            <p class="delivery-date" v-if="progressValue !== 100">
              {{getEstimatedArrivalTime(firstReleaseGoldInfo)}}
              {{getEstimatedArrivalDay(firstReleaseGoldInfo)}}
            </p>
            <p v-else class="font-success text-xs font-semibold success-bg px-2 py-1">
              Successful
            </p>
          </div>
        </div>
        <b-progress :value="progressValue"
          variant="success"></b-progress>
        <div class="mt-3">
          <p class="text-sm">
            {{deliveryStatusMessage}}
          </p>
          <div class="d-flex align-items-end justify-content-between"
            v-if="progressValue !== 100">
            <p class="text-xs inter-font-family mt-2 w-75">
              <span class="tertiary-color">
                Last updated:
              </span>
              <span class="ml-1 primary-color">
                {{lastUpdateTime}}
              </span>
            </p>
            <button class="btn btn-text p-0 w-25"
              @click="movetToTrackYourGold(
                firstReleaseGoldInfo,
                isHomeScreen=true,
                slotBookingLaunched=false
              )">
              View More
            </button>
          </div>
        </div>
      </div>
      <div class="more-loans-tracking flex items-center justify-between cursor-pointer"
        v-if="releaseLoans.length > 1" @click="showStatusCard()">
        <p>You have {{ releaseLoans.length - 1 }} more deliveries in progress</p>
        <img src="@/assets/arrows/right-arrow-grey.svg" alt="right-arrow" />
      </div>
    </div>
  </Container>
</template>
<script>
import moment from 'moment';
import _ from 'lodash';
import ReleaseSlotBookingMixins from '@/mixins/ReleaseSlotBookingMixins';
import Container from '@/components/CommonComponents/Container.vue';
import events from '@/utils/clevertap/eventconstants';
import { sendEvent } from '@/utils/clevertap/EventTracker';

export default {
  name: 'goldDeliveryStatus',
  data() {
    return {
      firstReleaseGoldInfo: {},
      progressValue: 5,
    };
  },
  components: {
    Container,
  },
  props: {
    releaseLoans: {
      type: Array,
    },
    deliveryStatusMessage: {
      type: String,
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
  methods: {
    moment: (date) => moment(date),
    showStatusCard() {
      const orderIds = [];
      this.releaseLoans.forEach((element) => {
        orderIds.push(element.id);
      });
      const eventProperties = {
        [events.EVENT_NAME]:
         events.CLICKED_ON_YOU_HAVE_N_MORE_DELIVERIES_IN_PROGRESS_FROM_STATUS_CARD,
        [events.NUMBEROFDELIVERIES]: this.releaseLoans.length,
        [events.PAYMENT_ORDER_ID]: orderIds.join(','),
      };
      sendEvent(events.screen.DASHBOARD, events.category.PAYMENT, eventProperties);
      this.$emit('showStatusCard');
    },
  },
  mounted() {
    const sortReleaseLoans = this.releaseLoans.sort((fLoan, nLoan) => +nLoan.id - +fLoan.id);
    [this.firstReleaseGoldInfo] = sortReleaseLoans;
    if (!this.deliveryStatusMessage) {
      this.$emit('getDeliveryStatusMessage', _.get(this.firstReleaseGoldInfo, 'progress.staticKey'));
    }
    this.timer = setInterval(() => {
      this.progressValue = _.get(this.firstReleaseGoldInfo, 'progress.value');
    }, 2000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
    this.timer = null;
  },
};
</script>
<style lang='scss' scoped>
.gold-delivery-status {
  .status {
    padding: 16px;
    box-shadow: 0px -1px 2px rgba(0, 0, 0, 0.08), 0px -4px 12px rgba(0, 0, 0, 0.08);
  }
  h3 {
    font-weight: 600;
    font-size: 16px;
    letter-spacing: -0.0001em;
    color: #1E2D4B;
  }
  .delivery-date {
    background: #FDEEE8;
    border-radius: 4px;
    padding: 4px;
    font-size: 12px;
    font-weight: 700;
    color: #1E2D4B;
  }
  .btn-text {
    border: none;
    text-decoration: underline;
    color: #EA5518;
    text-transform: uppercase;
    font-weight: 600;
    font-size: 14px;
    @media screen and (max-width: 600px) {
      width: 55%;
      text-align: right;
      font-size: 12px;
    }
  }
  .more-loans-tracking {
    padding: 16px;
    background: #F2F2F2;
    p {
      font-weight: 600;
      font-size: 14px;
      color: #4B576F;
    }
  }
  .btn:focus, .btn.focus {
    -webkit-box-shadow: none;
    box-shadow: none;
  }
}
.primary-color {
  color: #1E2D4B;
}
.tertiary-color {
  color: #788193;
}
</style>
