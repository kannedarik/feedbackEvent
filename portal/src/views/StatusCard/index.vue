<template>
  <div>
    <Container>
      <div id="status-card-container">
        <div class="header-main sm:px-4 sm:py-4 p-6">
          <div class="md:flex md:items-center">
            <div>
              <img src="@/assets/icons/left_arrow.svg" alt="back_arrows"
                class="cursor-pointer" @click="closeStatusCardPopup"/>
            </div>
            <div class="sm:mt-3 md:mt-0 md:ml-3">
              <h2 class="font-semibold text-lg">
                Pending Actions
              </h2>
            </div>
          </div>
        </div>
        <StatusCard
          v-for="(pendingLoan, index) in repledgedLoans" :key="index"
          :pendingLoan="pendingLoan"
          :featureFlag="featureFlag"
          :pincodeMessage="pincodeMessage"
          v-on:toSigningMethods="toSigningMethods($event)"
        />
        <div class="payment-options-wrapper-back-drop" v-if="showAckFlag"
          @click="showAckFlag = !showAckFlag">
        </div>
      </div>
    </Container>
    <transition
      name="custom-classes-transition"
      enter-active-class="animated slideInUp"
      leave-active-class="animated slideOutDown">
      <ackComponent
        :orderId='orderId'
        :statusCards='true'
        :from='"statuscard"'
        :paymentStatus='paymentStatus'
        v-if="showAckFlag"
        v-on:closedocVerificationModal="showAckFlag = false">
      </ackComponent>
    </transition>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import Container from '@/components/CommonComponents/Container.vue';
import StatusCard from '@/components/statusCard/index.vue';
import ackComponent from '@/components/RenewalSummary/AckOfPledge.vue';
import ReleaseSlotBookingMixins from '@/mixins/ReleaseSlotBookingMixins';
import events from '@/utils/clevertap/eventconstants';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import constants from '@/constant';

export default {
  name: 'statusCardComponent',
  data() {
    return {
      showAckFlag: false,
      orderId: '',
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
      identifier: 'release_slot_pincode_unserviceable',
      pincodeMessage: {},
      slotPendingOrders: [],
    };
  },
  mixins: [ReleaseSlotBookingMixins],
  watch: {
    staticMessage(value) {
      if (this.slotPendingOrders.length) {
        this.pincodeMessage = value[this.identifier];
      }
    },
    repledgedLoans(value) {
      if (!value) {
        this.closeStatusCardPopup();
      }
    },
  },
  components: {
    Container,
    StatusCard,
    ackComponent,
  },
  computed: {
    ...mapGetters({
      featureFlag: 'loans/partReleaseFeatureFlag',
      repledgedLoans: 'loans/statusCardOrders',
    }),
  },
  methods: {
    // emit close status card component method
    closeStatusCardPopup() {
      this.$router.push('/dashboard');
    },
    toSigningMethods(event) {
      this.showAckFlag = event.showAckFlag;
      this.orderId = event.orderId;
      this.paymentStatus = event.paymentStatus;
    },
  },
  activated() {
    if (!this.featureFlag && !this.repledgedLoans) {
      this.closeStatusCardPopup();
    }
    this.repledgedLoans.forEach((order) => {
      if (order.releaseDeliveryStatus === this.releaseDeliveryStatus.SLOT_PENDING) {
        this.slotPendingOrders.push(order.id);
      }
    });
    if (this.slotPendingOrders.length) {
      this.getStaticMessages('status_card');
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_STATUS_CARD_PINCODE_NOT_SERVICEABLE,
        [events.PAYMENT_ORDER_ID]: this.slotPendingOrders.join(','),
      };
      sendEvent(events.screen.STATUS_CARDS, events.category.PAYMENT, properties);
    }
  },
};
</script>
<style lang='scss'>
@import '@/scss/common/_mixins.scss';
@import '@/scss/desktop/dashboard.scss';
#status-card-container {
  header {
    padding: 20px 15px;
    background-color: $white-color;
    .back-arrow {
      font-size: 0.812rem;
      color: $tertiary-color;
    }
  }
  .renewal-card {
    border-radius: 7px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
    background-color: $white-color;
    .renewal-status {
      padding: 12px 0;
      border-radius: 7px 7px 0 0;
      p {
        font-size: 13px;
        line-height: 1;
      }
    }
    .incomplete {
      opacity: 0.9;
      background-color: #f8dfdf;
      p {
        color: #d1281e;
      }
    }
    .processing {
      background-color: #fff8ef;
      p {
        color: #fca942;
      }
    }
    .lender-details-section{
      padding: 16px 20px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      p {
        font-size: 13px;
        color: $primary-color;
      }
    }
    .renewal-loan-details {
      padding: 11px 20px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      background-color: #ffffff;
      span {
        font-size: 12px;
        color: $primary-color;
      }
      .label-span{
        font-size: 10px;
        color: $secondary-color;
      }
    }
    .renewal-current-status {
      padding: 16px 33px;
      .circle {
        width: 14px;
      }
      .status-img {
        width: 14px;
        height: 14px;
      }
      .status-img-not-intiated {
        width: 14px;
        height: 14px;
        border: solid 1px #707070;
        border-radius: 50%;
        display: inline-block;
      }
      .bar {
        display: inline-block;
        background: #fff;
        border-bottom: 1px dashed #d5d5da;
        width: calc(100% - 56px);
        height: 1px;
        margin-top: 7px;
      }
      .title {
        margin-left:-13px;
        font-size: 0.75rem;
        color: $secondary-color;
        text-align: center;
        display: inline-block;;
      }
    }
    .retry-renewal {
      box-shadow: 0 -1px 2px 0 rgba(0, 0, 0, 0.04);
      padding: 17px;
      p {
        color: $light-blue-color;
        font-size: 14px;
        margin-right: 4px;
      }
    }
  }
}
.gold-delivery-status {
  .gold-info {
    color: #788193;
    font-size: 12px;
    span {
      font-weight: 600;
      font-size: 14px;
      color: #1E2D4B;
    }
  }
}
.timeline {
  position: relative;
  &::after {
    content: "";
    clear: both;
    display: table;
  }
  &.three-slots {
    li {
      width: 33.33%;
    }
  }
  &.five-slots {
    li {
      width: 20%;
    }
  }
  li {
    list-style: none;
    float: left;
    width: 25%;
    font-size: 0.75rem;
    position: relative;
    text-align: center;
    color: #788193;
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
        background: url('../../assets/statusIcons/completed_icon.svg');
        background-position: center;
      }
      &::after {
        background: #a0d94d;
      }
    }
     &.in-process {
      &::before {
        background: transparent;
        border: 2px solid #FCA942;
      }
      &::after {
        background: #FCA942;
      }
    }
    &.slot-not-booked {
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
}
.slot-pending {
  color: #1E2D4B;
  font-weight: 600;
  font-size: 14px;
}
</style>
