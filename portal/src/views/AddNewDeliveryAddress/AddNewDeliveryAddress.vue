<template>
  <Container>
    <div class="release-slot">
      <div class="white-background d-flex align-items-center
        sm:px-3 md:px-8 py-4 header w-100">
        <img src="@/assets/icons/left_arrow.svg" alt="left_arrow"
          @click="goBacktoSlotBooking(false)" class="cursor-pointer" />
        <h2 class="font-semibold text-lg ml-3">
          Add Delivery Address
        </h2>
      </div>
      <GoogleMapView
        :fullAddress="fullAddress"
      />
      <AddressFrom
        v-on:updatedNewAdderss="updatedNewAdderss($event)"
        v-on:getFullAddress="getFullAddress($event)"
        :customerCityInfo="customerCityInfo"
      />
    </div>
  </Container>
</template>
<script>
import { mapGetters } from 'vuex';
import store from '@/store';
import { addNewAddressAPI, addressUpdateAPI } from '@/api/releaseSlotBooking.api';
import AddressFrom from '@/components/CommonComponents/AddressFrom.vue';
import Container from '@/components/CommonComponents/Container.vue';
import GoogleMapView from '@/components/CommonComponents/GoogleMapView.vue';
import ReleaseSlotBookingMixins from '@/mixins/ReleaseSlotBookingMixins';

export default {
  name: 'AddNewDeliveryAddress',
  data() {
    return {
      fullAddress: {},
      customerCityInfo: {},
      pincode: '',
    };
  },
  computed: {
    ...mapGetters({
      addressDetails: 'releaseSlotBooking/addressDetails',
      gmapAddress: 'releaseSlotBooking/gmapAddress',
      hasRescheduleSlotBooking: 'releaseSlotBooking/hasRescheduleSlotBooking',
      currentOrderId: 'releaseSlotBooking/currentOrderId',
    }),
  },
  components: {
    AddressFrom,
    Container,
    GoogleMapView,
  },
  mixins: [ReleaseSlotBookingMixins],
  watch: {
    addressDetails(value) {
      this.customerCityInfo = value;
    },
  },
  methods: {
    getFullAddress(event) {
      this.fullAddress = event;
    },
    updatedNewAdderss(event) {
      this.pincode = event.pincode;
      const updatedNewAdderssObj = {
        leadId: this.addressDetails.leadId,
        addressList: [{
          ...event,
          ...this.gmapAddress,
        }],
      };
      addNewAddressAPI(this.addressDetails.leadId, updatedNewAdderssObj)
        .then((responses) => {
          store.dispatch('releaseSlotBooking/setSelectedAddress', responses.data[0]);
          if (!this.hasRescheduleSlotBooking) {
            this.updateSelectedAddress();
          } else {
            this.goBacktoSlotBooking(true);
          }
        })
        .catch((error) => {
          this.$noty.error(error.message);
        });
    },
    updateSelectedAddress() {
      const data = {
        orderIds: [this.currentOrderId],
        address: this.gmapAddress.displayText,
        pinCode: this.pincode,
        locality: this.gmapAddress.area,
        location: {
          x: this.gmapAddress.latitude,
          y: this.gmapAddress.longitude,
        },
      };
      addressUpdateAPI(data)
        .then((responses) => {
          if (responses.data.code === 200) {
            this.goBacktoSlotBooking(true);
          }
        })
        .catch((error) => {
          this.$noty.error(error.message);
        });
    },
    getAddressDetails() {
      if (!this.addressDetails) {
        this.getCustomerAddressInfo();
      }
    },
    goBacktoSlotBooking(resetAll) {
      store.dispatch('releaseSlotBooking/setResetslotBooking',
        { reset: true, resetAll, resetReleaseTracker: false });
      this.$router.go(-1);
    },
    getOrdersDetails(orders) {
      const orderIdsList = [];
      if (orders.length) {
        orders.forEach((order) => {
          if (!order.relatedLoan) {
            orderIdsList.push({
              orderId: order.id,
              isCompleted: order.relatedLoan,
            });
          }
        });
        const orderIds = orderIdsList.filter((order) => !order.isCompleted);
        const orderID = orderIds.length ? orderIds[0].orderId : '';
        store.dispatch('releaseSlotBooking/setCurrentOrderId', orderID);
      }
    },
  },
  mounted() {
    store.dispatch('releaseSlotBooking/setGmapAddress', {});
    this.customerCityInfo = this.addressDetails;
    this.getAddressDetails();
    if (!this.currentOrderId) {
      this.getOrdersList(this.$route.query, 'NO');
    }
  },
};
</script>
<style lang="scss">
@import "@/scss/releaseTracker/releaseTracker.scss";
.release-slot {
  height: 100vh;
  border-radius: 0;
  margin-top: 40px;
  margin-bottom: 70px;
  color:#1E2D4B;
  @include box-shadow(0px 3px 10px 0, rgba(0, 0, 0, 0.08));
}
label span {
  color:#F76964;
}
label.adderss {
  width: 90%;
  margin: auto;
  position: absolute;
  left: 0;
  right: 0;
  top: 25px;
  z-index: 99;
}
.pac-target-input {
  background: #FFFFFF;
  border-radius: 32px;
  margin: 0 auto;
  width: 100%;
  height: 45px;
  padding: 0 20px 0 45px;
  font-size: 1rem;
  border: 1px solid #FFFFFF;
  outline: none;
  font-weight: 600;
  color: #788193;
}
.search-icon {
  width: 24px;
  height: 24px;
  top: -36px;
  left: 12px;
}
.hdpi .pac-icon {
  background-image: url("../../assets/icons/location_icon.svg");
  background-position: center;
  background-size: auto;
  background-repeat: no-repeat;
  margin-top: 2px;
}
.pac-item {
  padding: 10px 20px;
  line-height: 22px;
  font-size: 16px;
  color: #1E2D4B;
  font-weight: 600;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
.address-from {
  background: #FFFFFF;
  box-shadow: 0px -4px 16px rgba(0, 0, 0, 0.08);
  .form-control {
    padding: 0.65rem 1rem;
    height: 50px;
    font-weight: 600;
    color: #788193;
    background-color: #F2F2F2;
    border: 2px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    &.error {
      border-color: #F76964;
      background-color: #F2F2F2;
    }
    &.is-invalid {
      border-color: #F76964;
      padding-right: calc(1.5em + 0.75rem) !important;
      background-repeat: no-repeat;
      background-position: right calc(0.375em + 0.1875rem) center;
      background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
    }
    &:focus {
      box-shadow: none;
    }
  }
  .input-group-append {
    margin: 0;
  }
  .input-group-text {
    background-color: #F2F2F2;
    border: 2px solid rgba(224, 224, 224, 1);
    border-left: 0;
    border-top-right-radius: 4px !important;
    border-bottom-right-radius: 4px !important;
    &.error {
      border-color: #F76964;
      background-color: #F2F2F2;
    }
  }
}
.btn-rupeek {
  width: 100%;
  background: #EA5518;
  box-shadow: 0px 2px 6px rgba(255, 109, 0, 0.32), 0px 12px 16px rgba(255, 109, 0, 0.24);
  border-radius: 8px;
  border: 2px solid #EA5518;
  color: #fff;
  padding: 9px 16px;
  font-weight: 700;
  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
</style>
