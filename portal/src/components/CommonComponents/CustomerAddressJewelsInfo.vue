<template>
  <Container class="information"
    :class="{'more-Address':
      (_.get(addressDetails, 'addressList', []).length >= 2 && hasChangeAddress)
      || (goldRelease && goldRelease.length >= 2 && !hasShowCharges),
      'less-height': hasShowCharges }">
    <div class="h-100vh">
      <div class="position-relative">
        <div class="close-icon cursor-pointer" @click="closeOnboarding('close')"></div>
      </div>
      <div class="border"></div>
      <div class="sm:px-3 md:px-8" v-if="!hasShowCharges">
        <div>
          <div class="d-flex justify-content-between mb-2" v-if="hasChangeAddress">
            <img src="@/assets/icons/home_location_icon.svg" alt="home_location_icon" />
            <div class="add-new-address d-flex align-flex-end" @click="addNewAdderss()">
              <div class="circle mr-2"></div>
              Add new
            </div>
          </div>
          <h4 class="mb-4 bold-font">
            {{ hasChangeAddress ? 'Select Gold Delivery Address' : 'Gold For Release' }}
          </h4>
        </div>
        <div class="plans" v-if="hasChangeAddress">
          <div v-for="(address, index) in addressDetails && addressDetails.addressList"
            :key="index">
            <label class="plan mb-3 w-100" :for="`basic-${index}`" v-if="address.displayText"
            @click="getSelectedAddress(address)">
              <input type="radio" name="plan" :id="`basic-${index}`" />
              <div class="plan-content">
                <p class="plan-details inter-font-family">
                  {{address.displayText}}
                </p>
              </div>
            </label>
          </div>
        </div>
        <div class="jewels-info" v-else>
          <div v-for="(goldInfo, index) in goldRelease" :key="index"
          :class="[(index + 1) === goldRelease.length ? 'mb-12' : 'mb-4']">
            <div class="loan-details">
              <div>
                <span>Loan Amount</span>
                <p>
                  {{formatRupeeAmount(goldInfo.totalLoanAmount)}}
                </p>
              </div>
              <div class="px-4">
                <span>Loan Date</span>
                <p>
                  {{moment(goldInfo.loanDate).format('DD/MM/YYYY')}}
                </p>
              </div>
              <div>
                <span>Total Jewels</span>
                <p>
                  {{goldInfo && _.get(goldInfo, 'releaseJewelsList').length}}
                </p>
              </div>
            </div>
            <JewelsList class="margin-top"
              :jewelsList="_.get(goldInfo, 'releaseJewelsList')"
              :index="index"
            />
          </div>
        </div>
      </div>
      <div class="sm:px-3 md:px-8" v-else>
        <div class="charges p-3 inter-font-family">
          <p class="border-bottom pb-2 font-secondary font-semibold text-sm">
            {{`${$t('additional_charges')} ${$t('breakup')}`}}
          </p>
          <div v-for="(loan, index) in additionalCharges" :key="index"
            class="px-3 py-2 d-flex justify-between text-sm font-tertiary">
            <div>{{$t(`${loan.type}`)}}</div>
            <div>{{formatRupeeAmount(loan.value)}}</div>
          </div>
          <div class="px-3 pt-3.5 d-flex justify-between
            border-top font-secondary font-semibold text-sm">
            <div>
              {{`${$t('total')} ${$t('additional_charges')}`}}
            </div>
            <div>
              {{formatRupeeAmount(totalCharges(additionalCharges))}}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bottom-footer" v-if="hasChangeAddress">
      <Container>
        <div class="sm:px-3 md:px-8 py-3 bt">
          <button class="btn-primary-rupeek w-100" @click="confirmAddress()"
          :class="{'disabled-btn': _.isEmpty(selectedAddress)}">
            Confirm Address
          </button>
        </div>
      </Container>
    </div>
  </Container>
</template>

<script>
import _ from 'lodash';
import moment from 'moment';
import { mapGetters } from 'vuex';
import store from '@/store';
import { addressUpdateAPI } from '@/api/releaseSlotBooking.api';
import JewelsList from '@/components/ReleaseTracker/jewelsCarousel.vue';
import { formatRupeeAmount } from '@/utils/string';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';
import Container from './Container.vue';

export default {
  name: 'AddressJewelsInfo',
  data() {
    return {
      selectedAddress: {},
    };
  },
  components: {
    Container,
    JewelsList,
  },
  computed: {
    _() {
      return _;
    },
    ...mapGetters({
      orderIdsList: 'releaseSlotBooking/orderIdsList',
      hasRescheduleSlotBooking: 'releaseSlotBooking/hasRescheduleSlotBooking',
    }),
    // function call to return the order ID
    getOrderId() {
      const orders = [];
      this.orderIdsList.forEach((order) => {
        orders.push(order.orderId);
      });
      return orders;
    },
  },
  props: {
    hasChangeAddress: {
      type: Boolean,
      required: true,
    },
    goldRelease: {
      type: Array,
    },
    addressDetails: {
      type: Object,
    },
    hasUpdateSelectedAddress: {
      type: Boolean,
      required: true,
    },
    additionalCharges: {
      type: Array,
    },
    hasShowCharges: {
      type: Boolean,
    },
  },
  methods: {
    formatRupeeAmount,
    moment: (date) => moment(date),
    // function call to close the address/view jewels screen
    closeOnboarding(data) {
      this.$emit('closeOnboarding', data);
    },
    totalCharges(charges) {
      return charges.reduce((amount, item) => amount + item.value, 0);
    },
    // function call to move to the add new address screen
    addNewAdderss() {
      this.$emit('addNewAdderss');
      if (!this.hasUpdateSelectedAddress) {
        store.dispatch('releaseSlotBooking/setRescheduleSlotBooking', true);
      }
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_ADD_NEW_ADDRESS_CLICKED,
        [events.PAYMENT_ACTION]: 'release',
      };
      sendEvent(events.screen.RELEASE_SLOT_BOOKING, events.category.PAYMENT, properties);
      if (this.$route.params.id) {
        this.$router.push(`/add-new-address?orderId=${this.$route.params.id}`);
      } else {
        this.$router.push({ path: 'add-new-address', query: this.$route.query });
      }
    },
    // function call to get the selected address
    getSelectedAddress(address) {
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_SELECTED_DELIVERY_ADDRESS,
        [events.PAYMENT_ACTION]: 'release',
      };
      sendEvent(events.screen.RELEASE_SLOT_BOOKING, events.category.PAYMENT, properties);
      this.selectedAddress = address;
    },
    // function call to confirm the selected address
    confirmAddress() {
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_CONFIRM_ADDRESS_CLICKED,
        [events.PAYMENT_ACTION]: 'release',
      };
      sendEvent(events.screen.RELEASE_SLOT_BOOKING, events.category.PAYMENT, properties);
      store.dispatch('releaseSlotBooking/setSelectedAddress', this.selectedAddress);
      if (this.hasRescheduleSlotBooking) {
        store.dispatch('releaseSlotBooking/setResetslotBooking',
          { reset: true, resetAll: false, resetReleaseTracker: false });
      }
      if (this.hasUpdateSelectedAddress) {
        this.updateSelectedAddress();
      } else {
        this.closeOnboarding('confirm-address');
      }
    },
    // API call the submit the selected address
    updateSelectedAddress() {
      const data = {
        orderIds: this.getOrderId,
        address: this.selectedAddress.displayText,
        pinCode: this.selectedAddress.pincode,
        locality: this.selectedAddress.area,
        location: {
          x: this.selectedAddress.latitude,
          y: this.selectedAddress.longitude,
        },
      };
      addressUpdateAPI(data)
        .then((responses) => {
          if (responses.data.code === 200) {
            this.closeOnboarding('confirm-address');
          }
        })
        .catch((error) => {
          this.$noty.error(error.message);
        });
    },
  },
};
</script>
<style lang="scss">
%circleInfo {
  content: '';
  position: absolute;
  display: block;
  background-color: #EA5518;
  border-radius: 25px;
  z-index: 9;
}
.information {
  position: fixed;
  z-index: 99991;
  width: 100%;
  height: 420px;
  bottom: 0;
  left: 0;
  right: 0;
  color: #1E2D4B;
  &.more-Address {
    height: 490px;
  }
  &.less-height {
    height: 240px;
  }
  .br {
    border-radius: 16px 16px 0px 0px;
  }
  .border {
    width: 48px;
    border: 3px solid rgba(0, 0, 0, 0.32) !important;
    border-radius: 20px;
    margin: 12px auto !important;
  }
  h4 {
    font-size: 18px;
  }
  .close-icon {
    position: absolute;
    right: 5px;
    opacity: 1;
    top: -55px;
    height: 40px;
    width: 40px;
    background-image: url("../../assets/icons/new_closing_icon.svg");
  }
  .bottom-footer {
    border: none;
  }
  .add-new-address {
    color: #EA5518;
  }
  .circle {
    border-radius: 50%;
    width: 25px;
    height: 25px;
    border: 2px solid #EA5518;
    position: relative;
    &::after {
      @extend %circleInfo;
      height: 3px;
      top: 50%;
      left: 3px;
      right: 3px;
      transform: translateY(-60%);
    }
    &::before {
      @extend %circleInfo;
      width: 3px;
      left: 54%;
      top: 3px;
      bottom: 3px;
      transform: translateX(-70%);
    }
  }
  .new-address {
    background: #FAFAFA;
    border: 1px solid rgba(0, 0, 0, 0.12);
    box-sizing: border-box;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    p {
      padding-left: 16px;
    }
  }
  .jewels-info {
    height: 450px;
    overflow-y: scroll;
  }
  .plans {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    height: 300px;
    overflow-y: scroll;
    .plan {
      cursor: pointer;
      input[type="radio"] {
        position: absolute;
        opacity: 0;
        + .plan-content:after {
          content: "";
          position: absolute;
          height: 20px;
          width: 20px;
          background: #FFFFFF;
          top: 36%;
          left: 20px;
          border-radius: 100%;
          border: 3px solid #C4C4C4;
          -webkit-box-shadow: 0px 0px 0px 2px #C4C4C4;
          box-shadow: 0px 0px 0px 2px #C4C4C4;
        }
        &:checked + .plan-content:after {
          border: 6px solid #EA5518;
          -webkit-box-shadow: 0px 0px 0px 2px #EA5518;
          box-shadow: 0px 0px 0px 2px #EA5518;
        }
      }
      input[type="radio"]:checked + .plan-content {
        border: 2px solid #EE7746;
        background: #FDEEE8;
        -webkit-transition: ease-in 0.3s;
        -o-transition: ease-in 0.3s;
        transition: ease-in 0.3s;
        .plan-details {
          color: #1E2D4B;
        }
      }
      .plan-content {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        padding: 26px;
        -webkit-box-sizing: border-box;
        background: #FAFAFA;
        box-sizing: border-box;
        border: 2px solid rgba(0, 0, 0, 0.12);
        border-radius: 10px;
        -webkit-transition: -webkit-box-shadow 0.4s;
        transition: -webkit-box-shadow 0.4s;
        -o-transition: box-shadow 0.4s;
        transition: box-shadow 0.4s;
        transition: box-shadow 0.4s, -webkit-box-shadow 0.4s;
        position: relative;
        &:hover {
          -webkit-box-shadow: 0px 3px 5px 0px #e8e8e8;
          box-shadow: 0px 3px 5px 0px #e8e8e8;
        }
        @media screen and (max-width: 600px) {
          padding: 16px;
        }
      }
      .plan-details {
        color: #4B576F;
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
        padding-left: 40px;
      }
    }
  }
  .loan-details {
    background: #FDEEE8;
    border-radius: 4px;
    display: flex;
    padding: 10px;
    span {
      font-size: 12px;
      color: #4B576F;
    }
    p {
      font-weight: 600;
      font-size: 14px;
    }
  }
}
.charges {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  .border-bottom {
    border-color: rgba(238, 119, 70, 0.80) !important;
  }
  .font-tertiary {
    color: #4B576F;
  }
}
</style>
