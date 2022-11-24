<template>
  <div class="address-from sm:px-3 sm:py-3 md:p-8">
    <h3 class="pb-3">Add Delivery Address</h3>
    <div>
      <b-form @submit="onSubmit" class="from">
        <label for="pincode">Pincode <span>*</span></label>
        <b-input-group class="mb-4">
          <b-form-input
            id="pincode"
            v-model="pincode"
            placeholder="Enter pincode"
            required
            type="number"
            :class="{ 'error border-right-0': !validatePIN(pincode)}"
          ></b-form-input>
          <b-input-group-append v-if="!validatePIN(pincode)">
            <b-input-group-text
              class="error cursor-pointer">
              <img
                src="@/assets/icons/closing_error_icon.svg"
                alt="closing"
                @click="clearPinCode()"
              />
            </b-input-group-text>
          </b-input-group-append>
          <b-form-invalid-feedback :state="validatePIN(pincode)">
            Please enter a valid 6 digit pincode
          </b-form-invalid-feedback>
          <b-form-invalid-feedback :state="hasPincodeServiceable">
            Please enter valid city pin code where your loan is booked
          </b-form-invalid-feedback>
        </b-input-group>
        <label for="houseNo">House No/Flat no<span>*</span></label>
        <b-input-group class="mb-4">
          <b-form-input
            id="houseNo"
            v-model="houseNo"
            placeholder="House No/Flat no"
            required
          ></b-form-input>
        </b-input-group>
        <label for="complete-address">Complete Address<span>*</span></label>
        <b-input-group class="mb-4">
          <gmap-autocomplete
            id="complete-address"
            class="form-control"
            @place_changed="setPlace"
            :value="fullAddress"
            placeholder="Enter complete address"
          >
        </gmap-autocomplete>
        </b-input-group>
        <label for="landmark">Landmark<span>*</span></label>
        <b-input-group class="mb-4">
          <b-form-input
            id="landmark"
            v-model="landmark"
            placeholder="Enter landmark"
            required
          ></b-form-input>
        </b-input-group>
        <label for="city">City</label>
        <b-input-group class="mb-4">
          <b-form-input
            id="city"
            disabled
            class="border-right-0"
            v-model="cityName"
          ></b-form-input>
          <b-input-group-append>
            <b-input-group-text>
              <img
                src="@/assets/icons/info_icon.svg"
                alt="info_icon"
                id="city-name"
                class="cursor-pointer"
              />
              <b-popover
                target="city-name"
                triggers="click"
                placement="bottom"
                custom-class="info-tooltip"
              >
                <p class="white-color">
                  Your gold is stored in this city and can only be delivered
                  here
                </p>
              </b-popover>
            </b-input-group-text>
          </b-input-group-append>
          <b-form-invalid-feedback :state="hasPincodeServiceable">
            Your gold can be delivered only in this city
          </b-form-invalid-feedback>
        </b-input-group>
        <button
          id="cityName"
          type="submit"
          class="btn-primary-rupeek mt-2"
          :class="{ disabled: getDisabledinfo }">
          Add Address
        </button>
      </b-form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import store from '@/store';
import ReleaseSlotBookingMixins from '@/mixins/ReleaseSlotBookingMixins';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';

export default {
  name: 'AddressFrom',
  data() {
    return {
      hasPincodeServiceable: true,
      pincode: null,
      houseNo: '',
      landmark: '',
      addressList: {},
      fullAddress: '',
      cityName: '',
      inValidCity: false,
    };
  },
  mixins: [ReleaseSlotBookingMixins],
  computed: {
    // getDisabledinfo variable checks add address btn need to dissable or not
    getDisabledinfo() {
      const value = !this.houseNo || !this.fullAddress || !this.landmark || !this.inValidCity;
      const pincodeLight = this.pincode && this.pincode.length === 6;
      const data = value || !pincodeLight;
      return !(/^[0-9]{1,6}$/.test(this.pincode)) || data;
    },
    ...mapGetters({
      gmapAddress: 'releaseSlotBooking/gmapAddress',
    }),
  },
  props: {
    customerCityInfo: {
      type: Object,
      require: true,
    },
  },
  watch: {
    // gmapAddress this variable whenever update call this function
    gmapAddress(value) {
      this.fullAddress = value.displayText;
      this.pincode = value.pincode;
    },
    // customerCityInfo this variable whenever update call this function
    customerCityInfo(value) {
      if (value && value.cityName) {
        this.cityName = value.cityName;
      }
    },
    // pincode this variable whenever update call this function
    pincode(value) {
      if (value && value.length === 6) {
        this.customerAddressValidation(value);
        store.dispatch('releaseSlotBooking/updatePinCode', value);
      } else {
        this.hasPincodeServiceable = true;
      }
    },
    // addressValidation this variable whenever update call this function
    addressValidation(value) {
      this.inValidCity = +value.cityId === +(this.customerCityInfo && this.customerCityInfo.cityId);
      this.hasPincodeServiceable = (+value.cityId === (this.customerCityInfo
        && +this.customerCityInfo.cityId) && this.validatePIN(this.pincode));
      if (!this.inValidCity) {
        const element = document.getElementById('cityName');
        element.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    },
  },
  methods: {
    // function call to clear the entered pincode
    clearPinCode() {
      this.pincode = null;
    },
    // function call to validate the pin code
    validatePIN(pin) {
      return pin ? /^(\d{6})$/.test(pin) : true;
    },
    // function call to get the selected address
    setPlace(place) {
      this.$emit('getFullAddress', place);
    },
    // function call to update the new address
    onSubmit(event) {
      event.preventDefault();
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_ADD_ADDRESS_CLICKED,
        [events.PAYMENT_ACTION]: 'release',
      };
      sendEvent(events.screen.ADDRESS_SELECTION, events.category.PAYMENT, properties);
      if (!this.getDisabledinfo) {
        this.addressList = {
          pincode: this.pincode,
          house: this.houseNo,
          landmark: this.landmark,
        };
        this.$emit('updatedNewAdderss', this.addressList);
      }
    },
  },
  mounted() {
    this.cityName = this.customerCityInfo && this.customerCityInfo.cityName;
  },
};
</script>
<style lang="scss">
.address-from {
  form {
    font-family: 'Inter';
  }
}
</style>
