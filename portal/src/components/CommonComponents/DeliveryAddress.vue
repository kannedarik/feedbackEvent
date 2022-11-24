<template>
  <div class="border-box location d-flex align-items-center p-3 w-100"
    v-if="_.get(deliveryAddress, 'displayText')">
    <img :src="`${hasSlotBookingScreen
      ? homeLocationIcon : locationIcon}`"
      alt="home_location_icon" />
    <p class="ml-3 medium-font-weight inter-font-family">
      {{ _.get(deliveryAddress, 'displayText') || 'Selecte Gold Delivery Address' }}
    </p>
  </div>
</template>

<script>
import _ from 'lodash';
import homeLocationIcon from '@/assets/icons/home_location_icon.svg';
import locationIcon from '@/assets/icons/location_icon.svg';

export default {
  name: 'DeliveryAddress',
  data() {
    return {
      homeLocationIcon,
      locationIcon,
    };
  },
  computed: {
    _() {
      return _;
    },
  },
  props: {
    deliveryAddress: {
      type: Object,
      required: true,
    },
    hasSlotBookingScreen: {
      type: Boolean,
      require: true,
    },
  },
};
</script>
<style scoped>
.location p {
  color: #4B576F;
  font-size: 14px;
}
</style>
