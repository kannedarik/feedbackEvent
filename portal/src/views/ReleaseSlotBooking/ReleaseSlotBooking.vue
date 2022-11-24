<template>
  <div>
    <div class="leadform z-index-999" v-if="hasShowAddressJewelsInfo"></div>
    <div class="payments-body">
      <Container>
        <div class="release-slot">
          <div class="d-flex flex-wrap align-content-between bg-white">
            <div class="p-2 defult-bg w-100"
              :class="{ 'top-position': hasShowAddressJewelsInfo }">
            </div>
            <!-- Release Slot Booking Screen Headers -->
            <div class="white-background d-flex align-items-center
              sm:px-3 md:px-8 py-4 header w-100"
              :class="{ 'top-position': hasShowAddressJewelsInfo}">
              <img src="@/assets/icons/left_arrow.svg" alt="left_arrow"
                @click="backToLastOrder()" class="cursor-pointer" />
              <h2 class="font-semibold text-lg ml-3" v-if="!hasRescheduleSlotBooking">
                Book Slot for Gold Delivery
              </h2>
              <h2 class="font-semibold text-lg ml-3" v-else>
                Change Slot for Gold Delivery
              </h2>
            </div>
            <!-- End Release Slot Booking Screen Headers -->
            <!-- Multiple Slots Info -->
            <div class="multiple-slots sm:px-3 md:px-8 py-3 w-100 inter-font-family"
              v-if="orderIdsList.length > 1">
              <p class="medium-font-weight flex items-end">
                Your gold will be delivered in {{ orderIdsList.length }} slots
                <img src="@/assets/icons/question_icon.svg" alt="into_icon"
                  id="multiple-slot" class="cursor-pointer ml-2" @click="showMultipleSlotInfo()" />
                <b-popover
                  target="multiple-slot"
                  triggers="click"
                  placement="bottom"
                  custom-class="info-tooltip">
                  <p class="white-color medium-font-weight">
                    Gold delivery for loans taken on different dates will be processed separately
                  </p>
                </b-popover>
              </p>
            </div>
            <!-- Ends multiple Slots Info -->
            <div class="white-background d-flex align-items-center justify-content-between
              p-3 w-100 border-box sm:mx-3 sm:my-3 md:m-8 delivery-jewels-info">
              <div>
                <p class="medium-font-weight inter-font-family">
                  Gold Jewels for Delivery:
                  <span>
                    {{
                      !_.isEmpty(getCurrentOrderIdJewels)
                      ? getCurrentOrderIdJewels.releaseJewelsList.length : 0
                    }}
                  </span>
                </p>
              </div>
              <div>
                <button
                  class="btn-transparent medium-font-weight"
                  @click="changesAddress('jewels')">
                  View details
                </button>
              </div>
            </div>
            <div class="sm:mx-3 md:mx-8 w-100">
              <div class="white-background d-flex align-items-center justify-content-between mb-3">
                <h5 class="bold-font">
                  Gold Delivery Address
                </h5>
                <button class="btn-outline" @click="changesAddress('address')">
                  Change
                </button>
              </div>
              <DeliveryAddress
                :deliveryAddress="selectedAddress"
                :hasSlotBookingScreen="true"
              />
            </div>
            <div class="sm:mx-3 sm:my-3 md:m-8 w-100" v-if="showCityIsNotServiceable
              && !_.isEmpty(slotPending)">
              <div class="d-flex slot-pending-info p-3 align-items-center">
                <div class="icon">
                  <img :src="slotPending.imageUrl" alt="left_arrow" />
                </div>
                <div class="pl-2 inter-font-family">
                  <h3>{{slotPending.title}}</h3>
                  <p>{{slotPending.description}}</p>
                </div>
              </div>
            </div>
            <div class="sm:mx-3 sm:my-3 md:m-8 w-100 mb-4" v-if="slotsDates.length">
              <SelectDateTimeSlot
                ref="resetDateTimeRef"
                :slotsDates="slotsDates"
                :currentOrderId="currentOrderId"
                :resetSeletedDateTimes="resetSeletedDateTimes"
                :showCityIsNotServiceable="showCityIsNotServiceable"
                v-on:setSlotInfo="setSlotInfo($event)"
                v-on:slotUnavailable="slotUnavailable($event)"
                v-on:selectedDate="selectedDate($event)"
                v-on:datehasSelected="datehasSelected()"
              />
            </div>
            <div class="sm:mx-3 md:mx-8 w-100 d-flex bg-info p-3 rounded mb-4"
              v-if="isSlotUnavailable">
              <img src="@/assets/icons/info_icon.svg" alt="into_icon" class="mr-2" width="28px" />
              <p class="inter-font-family">
                {{
                  staticMessage.release_slot_unavailable_info.content.message
                }}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
    <div class="bottom-footer">
      <Container>
        <div class="sm:px-3 md:px-8 py-3 bt box-shadow"
          :class="{'d-flex justify-content-between': hasRescheduleSlotBooking}">
          <button class="btn-transparent medium-font-weight"
            v-if="hasRescheduleSlotBooking" @click="moveToBack()">
            Back to Gold tracking
          </button>
          <button class="btn-rupeek" @click="confirmSlot()"
            :class="{
              'w-50': hasRescheduleSlotBooking,
              'disabled': showDisabledBtn,
            }">
            {{
              (showCityIsNotServiceable || isSlotUnavailable) && !hasRescheduleSlotBooking
                ? orderIdsList.length >= 2
                  ? `Proceed without Booking Slot (${bookedSlotsCount}/${orderIdsList.length})`
                  : 'Proceed without Booking Slot'
                : getConfirmSlotText()
            }}
          </button>
        </div>
      </Container>
    </div>
    <transition
      name="custom-classes-transition"
      enter-active-class="animated slideInUp"
      leave-active-class="animated slideOutDown">
      <CustomerAddressJewels
        :hasChangeAddress="hasChangeAddress"
        :addressDetails="addressDetails"
        :goldRelease="[getCurrentOrderIdJewels]"
        :hasUpdateSelectedAddress="!hasRescheduleSlotBooking"
        v-on:closeOnboarding="closeOnboarding($event)"
        v-on:addNewAdderss="addNewAdderss()"
        v-if="hasShowAddressJewelsInfo" />
    </transition>
    <b-modal id="exit-modal" no-close-on-esc no-close-on-backdrop
      v-model="showExitModal" size="sm" title="Note" centered>
      Do you want to exit?
      <template #modal-footer>
        <div class="d-flex justify-content-end">
          <button class="btn-rupeek rounded-pill py-1 px-5"
            @click="showExitModal=false">
            No
          </button>
          <button class="btn-outline ml-3 py-1 px-5" @click="moveToBack()">
            Yes
          </button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script>
import _ from 'lodash';
import moment from 'moment';
import { mapGetters } from 'vuex';
import store from '@/store';
import {
  getSlotsDatesAPI,
  confirmSlotAPI,
} from '@/api/releaseSlotBooking.api';
import { fetchOrdersDetailsAPI } from '@/api/goldRelease.api';
import Container from '@/components/CommonComponents/Container.vue';
import CustomerAddressJewels from '@/components/CommonComponents/CustomerAddressJewelsInfo.vue';
import DeliveryAddress from '@/components/CommonComponents/DeliveryAddress.vue';
import SelectDateTimeSlot from '@/components/SelectDateTimeSlot/SelectDateTimeSlot.vue';
import ReleaseSlotBookingMixins from '@/mixins/ReleaseSlotBookingMixins';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';

export default {
  data() {
    return {
      hasShowAddressJewelsInfo: false,
      hasChangeAddress: true,
      ordersList: [],
      slotsDates: [],
      showCityIsNotServiceable: false,
      slotInfo: {},
      slotsDateInfo: null,
      currentOrderId: '',
      relatedLoanList: [],
      bookedSlotsCount: 1,
      totalOrderIds: [],
      isSlotUnavailable: false,
      resetSeletedDateTimes: false,
      isShowMultipleSlotInfo: false,
      selectedDates: '',
      count: 0,
      showExitModal: false,
      ordersInfoDetails: {},
    };
  },
  mixins: [ReleaseSlotBookingMixins],
  components: {
    Container,
    CustomerAddressJewels,
    DeliveryAddress,
    SelectDateTimeSlot,
  },
  computed: {
    _() {
      return _;
    },
    ...mapGetters({
      addressDetails: 'releaseSlotBooking/addressDetails',
      orderIdsList: 'releaseSlotBooking/orderIdsList',
      selectedAddress: 'releaseSlotBooking/selectedAddress',
      useOrderID: 'releaseSlotBooking/useOrderID',
      hasRescheduleSlotBooking: 'releaseSlotBooking/hasRescheduleSlotBooking',
      resetslotBooking: 'releaseSlotBooking/resetslotBooking',
    }),
    slotPending() {
      const type = 'release_slot_pending_info';
      let message = {};
      if (this.staticMessage[type]) {
        message = this.staticMessage[type].content;
      }
      return message;
    },
    getOrderId() {
      const orderIds = this.orderIdsList.filter((order) => !order.isCompleted);
      return orderIds.length ? orderIds[0].orderId : '';
    },
    showDisabledBtn() {
      let hasDisable = false;
      if ((this.showCityIsNotServiceable || this.isSlotUnavailable)
        && !this.hasRescheduleSlotBooking) {
        hasDisable = false;
      } else if (!this.slotsDateInfo || _.isEmpty(this.slotInfo)
        || ((this.showCityIsNotServiceable || this.isSlotUnavailable)
        && this.hasRescheduleSlotBooking)) {
        hasDisable = true;
      }
      return hasDisable;
    },
    getCurrentOrderIdJewels() {
      return this.ordersInfoDetails && this.ordersInfoDetails[this.currentOrderId];
    },
  },
  watch: {
    slotsDates(value) {
      this.slotsDateInfo = value;
    },
    showCityIsNotServiceable(value) {
      this.resetSeletedDateTimes = value;
      if (value) this.isSlotUnavailable = false;
    },
    addressValidation(value) {
      this.showCityIsNotServiceable = !value.serviceable;
      if (!value.serviceable) {
        const properties = {
          [events.EVENT_NAME]: events.PAYMENT_PINCODE_NOT_SEVICEABLE_VISITED,
          [events.PAYMENT_ACTION]: 'release',
          [events.PAYMENT_ORDER_ID]: this.currentOrderId,
          [events.PAYMENT_PINCODE]: this.selectedAddress.pincode,
        };
        sendEvent(events.screen.RELEASE_SLOT_BOOKING, events.category.PAYMENT, properties);
      } else {
        if (!_.isEmpty(this.slotInfo)) {
          this.resetData();
          this.isSlotUnavailable = false;
        }
        this.getSlotsDates();
      }
    },
    currentOrderId(value) {
      store.dispatch('releaseSlotBooking/setCurrentOrderId', value);
      if (!this.showCityIsNotServiceable && _.isEmpty(this.slotInfo)
        && !_.isEmpty(this.selectedAddress)) {
        this.getSlotsDates();
      }
    },
    orderIdsList(value) {
      if (value.length >= 2) {
        const properties = {
          [events.EVENT_NAME]: events.PAYMENT_MULTIPLE_SLOT_BOOKING_VISITED,
          [events.PAYMENT_ACTION]: 'release',
          [events.PAYMENT_ORDER_ID]: this.totalOrderIds.join(','),
        };
        sendEvent(events.screen.RELEASE_SLOT_BOOKING, events.category.PAYMENT, properties);
      }
    },
    resetslotBooking(value) {
      if (value.reset) {
        this.resetData();
        this.isSlotUnavailable = false;
        this.customerAddressValidation(this.selectedAddress.pincode);
        if (value.resetAll) {
          this.getCustomerAddressInfo();
        }
        if (!this.orderIdsList.length) {
          this.getOrdersList(this.$route.query, 'book_slot_screen');
        }
      }
    },
  },
  methods: {
    resetData() {
      this.$refs.resetDateTimeRef.resetSeletedDataTime();
    },
    datehasSelected() {
      this.slotInfo = {};
    },
    moveToBack() {
      this.showExitModal = false;
      if (!this.hasRescheduleSlotBooking) {
        this.moveToHome();
      } else {
        this.$router.push(`/release-tracker/${this.currentOrderId}`);
      }
    },
    setSlotInfo(event) {
      this.slotInfo = event;
    },
    selectedDate(event) {
      this.selectedDates = event;
    },
    slotUnavailable(event) {
      this.isSlotUnavailable = event;
      if (event) {
        this.slotInfo = { slotStatus: 'unavailable' };
        const properties = {
          [events.EVENT_NAME]: events.PAYMENT_NO_SLOT_AVAILABLE_VISITED,
          [events.PAYMENT_ACTION]: 'release',
          [events.PAYMENT_ORDER_ID]: this.currentOrderId,
          [events.PAYMENT_DATE]: this.selectedDate,
        };
        sendEvent(events.screen.RELEASE_SLOT_BOOKING, events.category.PAYMENT, properties);
      }
    },
    getConfirmSlotText() {
      return this.orderIdsList.length >= 2
        ? `Confirm Slot (${this.bookedSlotsCount}/${this.orderIdsList.length})` : 'Confirm Slot';
    },
    changesAddress(type) {
      this.hasChangeAddress = type === 'address';
      this.hasShowAddressJewelsInfo = true;
      const properties = {
        [events.PAYMENT_ORDER_ID]: this.currentOrderId,
        [events.PAYMENT_ACTION]: 'release',
        [events.EVENT_NAME]: this.hasChangeAddress
          ? events.PAYMENT_CHANGE_ADDRESS_CLICKED : events.PAYMENT_VIEW_DETAILS_CLICKED,
      };
      sendEvent(events.screen.RELEASE_SLOT_BOOKING, events.category.PAYMENT, properties);
    },
    closeOnboarding(event) {
      this.hasShowAddressJewelsInfo = false;
      if (event !== 'close') {
        if (!_.isEmpty(this.slotInfo) || !_.isEmpty(this.selectedDates)) {
          this.resetData();
          this.isSlotUnavailable = false;
        }
        this.checkSelectedAddress();
      }
    },
    addNewAdderss() {
      this.hasShowAddressJewelsInfo = false;
    },
    checkSelectedAddress() {
      if (!_.isEmpty(this.selectedAddress)) {
        this.customerAddressValidation(this.selectedAddress.pincode);
      } else {
        this.hasShowAddressJewelsInfo = true;
      }
    },
    getOrdersDetails(orders, jewelsList) {
      const orderIdsList = [];
      const ordersInfoDetails = [];
      this.ordersList = orders;
      if (orders.length) {
        orders.forEach((order) => {
          const jewelSelectedId = [];
          this.relatedLoanList.push(order.relatedLoan);
          const ordersInfo = {
            totalLoanAmount: 0,
            orderId: order.id,
            releaseJewelsList: [],
            loanDate: null,
          };
          store.dispatch('releaseSlotBooking/orderCityInfo', {
            cityName: _.capitalize(order.cityName),
            cityId: +order.cityId,
          });
          if (!order.relatedLoan) {
            this.currentOrderId = _.get(order, 'id');
            orderIdsList.push({
              orderId: _.get(order, 'id'),
              isCompleted: _.get(order, 'relatedLoan'),
            });
            if (!_.isEmpty(order.releaseAddress) && !this.hasRescheduleSlotBooking) {
              const releaseAddress = {
                displayText: _.get(order, 'releaseAddress'),
                latitude: _.get(order, 'releaseLocation.x' || '--'),
                longitude: _.get(order, 'releaseLocation.y' || '--'),
                pincode: _.get(order, 'pinCode'),
                area: _.get(order, 'locality'),
              };
              store.dispatch('releaseSlotBooking/setSelectedAddress', releaseAddress);
              this.customerAddressValidation(releaseAddress.pincode);
            }
            this.totalOrderIds.push(order.id);
            order.orderItems.forEach((orderItem) => {
              ordersInfo.loanDate = orderItem.loanDetails[0].loanDate;
              const { loanDetails } = orderItem;
              ordersInfo.totalLoanAmount += _.sumBy(loanDetails, (key) => key.loanAmount);
              orderItem.jewelSelected.forEach((jewels) => {
                jewelSelectedId.push(jewels);
              });
            });
            jewelSelectedId.forEach((selectedJewel) => {
              ordersInfo.releaseJewelsList.push(jewelsList[selectedJewel]);
            });
            ordersInfoDetails.push(ordersInfo);
          }
        });
        this.ordersInfoDetails = Object.assign({},
          ...ordersInfoDetails.map((item) => ({ [item.orderId]: item })));
        store.dispatch('releaseSlotBooking/orderIdsList', orderIdsList);
        this.currentOrderId = !_.isEmpty(orderIdsList) ? this.getOrderId : this.currentOrderId;
      } else {
        this.moveToHome();
      }
      if (_.uniq(this.relatedLoanList).length === 1 && this.relatedLoanList.includes(true)) {
        this.moveToReleaseConfirm();
      } else if (!this.addressDetails && _.isEmpty(this.addressDetails)) {
        this.getCustomerAddressInfo();
        this.hasShowAddressJewelsInfo = _.isEmpty(this.selectedAddress);
      } else if (_.isEmpty(this.selectedAddress)) {
        this.hasShowAddressJewelsInfo = true;
      }
    },
    getSlotsDates() {
      if (this.currentOrderId && _.isEmpty(this.slotsDates)) {
        getSlotsDatesAPI(this.currentOrderId)
          .then((responses) => {
            this.slotsDates = responses.data.data;
          })
          .catch((error) => {
            this.$noty.error(error.message);
          });
      }
    },
    confirmSlot() {
      let data = {
        orderId: this.currentOrderId,
        releaseAddress: this.selectedAddress.displayText,
        releaseLocality: this.selectedAddress.area,
        pincode: this.selectedAddress.pincode,
        releaseLocation: {
          x: this.selectedAddress.latitude,
          y: this.selectedAddress.longitude,
        },
        tag: !this.hasRescheduleSlotBooking ? 'Customer Booked' : 'Customer ReBooked',
      };
      let properties = {
        [events.PAYMENT_ORDER_ID]: this.currentOrderId,
        [events.PAYMENT_ACTION]: 'release',
      };
      if (this.showCityIsNotServiceable) {
        data.slotStatus = 'pending';
      } else {
        data = { ...data, ...this.slotInfo };
      }
      if (this.data && this.data.slotStatus === 'pending') {
        properties = {
          [events.EVENT_NAME]: events.PAYMENT_PROCEED_WITHOUT_SLOT_BOOKING,
          [events.PAYMENT_PINCODE]: this.selectedAddress.pincode,
          [events.PINCODE_SERVICEABLE]: false,
        };
      } else if (this.data && this.data.slotStatus === 'unavailable') {
        properties = {
          [events.EVENT_NAME]: events.PAYMENT_PROCEED_WITHOUT_SLOT_BOOKING,
          [events.PAYMENT_DATE]: this.selectedDate,
          [events.SLOTS_AVAILABLE]: false,
        };
      } else {
        properties = {
          [events.EVENT_NAME]: events.PAYMENT_CONFIRM_SLOT_CLICKED,
          [events.PAYMENT_ORDER_ID]: this.currentOrderId,
          [events.PAYMENT_DATE]: this.selectedDate,
          [events.PAYMENT_TIME]: `${moment(this.slotInfo.slotstart).utc().format('hh:mm a')}
          - ${moment(this.slotInfo.slotend).utc().format('hh:mm a')}`,
        };
      }
      if (this.ordersList.length >= 2) {
        properties = {
          [events.ORDER_NUMBER]: this.bookedSlotsCount,
        };
      }
      sendEvent(events.screen.RELEASE_SLOT_BOOKING, events.category.PAYMENT, properties);
      confirmSlotAPI(data)
        .then((responses) => {
          if (responses.data.code === 200) {
            if (data.slotStatus === 'available') {
              this.ordersUpdated();
            } else {
              this.updateOrder();
            }
          }
        })
        .catch((error) => {
          this.$noty.error(error.message);
        });
    },
    ordersUpdated() {
      const tempObj = {
        process: 'RELEASE',
        pageNumber: 0,
        lightWeight: true,
        orderId: this.currentOrderId,
      };
      fetchOrdersDetailsAPI(tempObj)
        .then((responses) => {
          if (responses.data.orders[0].status === 'in-progress' && this.count < 2) {
            this.count += 1;
            setTimeout(() => { this.ordersUpdated(); }, 5000);
            store.dispatch('loader/setLoading', { esign: false, loader: true });
          } else if (responses.data.orders[0].status === 'completed') {
            this.updateOrder();
          } else {
            this.isSlotUnavailable = true;
            this.resetData();
          }
          if (this.count >= 3) {
            this.$noty.error(`Could not complete your request,
            Please try again after some time.`);
          }
        })
        .catch((error) => {
          this.$noty.error(error.message);
        });
    },
    updateOrder() {
      store.dispatch('releaseSlotBooking/updateOrderIdsList', this.currentOrderId);
      if (!this.getOrderId) {
        this.moveToReleaseConfirm();
      } else {
        this.resetData();
        this.showCityIsNotServiceable = false;
        this.isSlotUnavailable = false;
        this.bookedSlotsCount += 1;
        this.currentOrderId = this.getOrderId;
        this.getSlotsDates();
      }
    },
    moveToReleaseConfirm() {
      this.$router.push({ path: 'release-confirmation', query: this.$route.query });
    },
    backToLastOrder() {
      this.showExitModal = true;
      this.hasShowAddressJewelsInfo = false;
    },
    showMultipleSlotInfo() {
      this.isShowMultipleSlotInfo = !this.isShowMultipleSlotInfo;
      if (this.isShowMultipleSlotInfo) {
        const properties = {
          [events.EVENT_NAME]: events.PAYMENT_QUESTION_MARK_ICON_CLICKED,
          [events.PAYMENT_ACTION]: 'release',
          [events.PAYMENT_ORDER_ID]: this.totalOrderIds.join(','),
        };
        sendEvent(events.screen.RELEASE_SLOT_BOOKING, events.category.PAYMENT, properties);
      }
    },
  },
  activated() {
    document.title = `Rupeek Payments | ${!this.hasRescheduleSlotBooking
      ? 'Book Slot for Gold Delivery' : 'Change Slot for Gold Delivery'}`;
    this.getOrdersList(this.$route.query, 'book_slot_screen');
    if (!_.isEmpty(this.selectedAddress)) {
      this.customerAddressValidation(this.selectedAddress.pincode);
    }
  },
};
</script>
<style lang="scss">
@import "@/scss/releaseTracker/releaseTracker.scss";
.defult-bg {
  background: $grey-color;
}
.top-position {
  position: relative;
  z-index: 9999;
}
.delivery-jewels-info {
  p {
    font-size: 16px;
    color: #4B576F;
    span {
      color: #1E2D4B;
      font-weight: 800;
    }
  }
}
.date-body {
  h3 {
    font-weight: 600;
    font-size: 14px;
  }
}

.select-time {
  text-align: center;
  border: 2px solid #D9D9D9;
  box-sizing: border-box;
  border-radius: 8px;
  position: relative;
  letter-spacing: -0.0001em;
  padding: 10px 8px;
  h3 {
    font-size: 14px;
  }
  &.selected {
    border-color: #EA5518;
    background: #FDEEE8;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.16), 0px 4px 16px rgba(0, 0, 0, 0.08);
  }
  &.disabled {
    background: #FAFAFA;
    color: #A5ABB7;
    pointer-events: none;
    &:before {
      display: inline-block;
      position: absolute;
      top: -14px;
      left: 35px;
      content: attr(data-title);
      color: #D0243C;
      background: rgba(255, 255, 255, 0.92);
      border: 1px solid rgba(0, 0, 0, 0.12);
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      border-radius: 4px;
      font-weight: 500;
      font-size: 12px;
      line-height: 17px;
      padding: 2px 4px 0;
    }
  }
}
.select-date {
  width: 64px !important;
  height: 64px !important;
  text-align: center;
  border: 2px solid #D9D9D9;
  box-sizing: border-box;
  border-radius: 8px;
  &.disabled {
    background: #FAFAFA;
    color: #A5ABB7;
    pointer-events: none;
  }
  &.selected {
    border-color: #EA5518;
    background: #FDEEE8;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.16), 0px 4px 16px rgba(0, 0, 0, 0.08);
    .date-header {
      background: #EA5518;
      p {
        color: #ffffff;
      }
    }
  }
  .date-header {
    background: #D9D9D9;
    padding: 4px 0;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    p {
      font-size: 12px;
    }
  }
  h3 {
    padding-top: 8px;
    font-size: 18px;
  }
}
.slot-pending-info {
  background: #FAE9EC;
  border-radius: 4px;
  color: #1E2D4B;
  .icon {
    width: 20px;
    height: auto;
  }
  img {
    width: 100%;
  }
  h3 {
    font-weight: 600;
    font-size: 14px;
  }
  p {
    font-size: 12px;
  }
}
.flex-gap {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 20px;
}
</style>
