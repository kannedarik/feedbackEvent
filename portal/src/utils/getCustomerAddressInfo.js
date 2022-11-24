import store from '@/store';
import {
  customerAddressValidationAPI,
  getCustomerAddressInfoAPI,
} from '@/api/releaseSlotBooking.api';

function getCustomerAddressInfo() {
  const userObj = store.getters['auth/loggedInUser'];
  getCustomerAddressInfoAPI(userObj.phone)
    .then((responses) => {
      let addressDetailsInfo = {};
      responses.data.users.forEach((address) => {
        addressDetailsInfo = {
          cityName: address.cityName,
          cityId: address.city,
          addressList: address.addressList,
          leadId: address.leadId,
        };
      });
      store.dispatch('releaseSlotBooking/customerAddressInfo', addressDetailsInfo);
    })
    .catch((error) => {
      this.$noty.error(error.message);
    });
}

function customerAddressValidation(pincode) {
  customerAddressValidationAPI(pincode)
    .then((responses) => {
      store.dispatch('releaseSlotBooking/addressValidation', responses.data.data);
    })
    .catch((error) => {
      this.$noty.error(error.message);
    });
}
export {
  getCustomerAddressInfo,
  customerAddressValidation,
};
