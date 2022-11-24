<template>
  <div v-if="datesInfo.length && !showCityIsNotServiceable"
    class="md:w-11/12">
    <h5 class="bold-font">Select Date</h5>
    <VueSlickCarousel class="mt-3 slot" v-bind="settings" v-if="datesInfo.length">
      <div class="select-date cursor-pointer" v-for="(listDate, index) in datesInfo" :key="index"
        @click="selectDate(listDate)"
        :class="{'selected': listDate === selectedDate, 'disabled': listDate.holiday}">
        <div class="date-header inter-font-family">
          <p>{{listDate.weekday}}</p>
        </div>
        <div class="date-body">
          <h3 class="bold-font">
            {{moment(listDate.date).format('DD')}}
          </h3>
        </div>
      </div>
    </VueSlickCarousel>
    <div class="mt-3" v-if="selectedDate !== 0 && timeStamp.length">
      <h5 class="bold-font mb-3">Select Time Slot</h5>
      <div class="my-2 flex-gap">
        <div class="select-time cursor-pointer" data-title="Fully Booked"
          v-for="(timeInfo, index) in timeStamp" :key="index"
          @click="selectTime(timeInfo)"
          :class="{'selected': timeInfo === selectedTime,
            'disabled': timeInfo.availableagents === 0}">
          <h3 class="medium-font-weight inter-font-family">
            {{
              getTimeSlots(timeInfo)
            }}
          </h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueSlickCarousel from 'vue-slick-carousel';
import moment from 'moment';
import { mapGetters } from 'vuex';
import { getSlotsAPI } from '@/api/releaseSlotBooking.api';
import ReleaseSlotBookingMixins from '@/mixins/ReleaseSlotBookingMixins';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';

export default {
  name: 'SelectDateTimeSlot',
  data() {
    return {
      selectedDate: 0,
      selectedTime: Number,
      settings: {
        dots: false,
        arrows: true,
        infinite: false,
        touchMove: true,
        speed: 500,
        slidesToShow: 9,
        slidesToScroll: 3,
        initialSlide: 0,
        responsive: [
          {
            breakpoint: 1030,
            settings: {
              slidesToShow: 7,
            },
          },
          {
            breakpoint: 768,
            settings: {
              arrows: false,
              slidesToShow: 8,
            },
          },
          {
            breakpoint: 596,
            settings: {
              arrows: false,
              slidesToShow: 5,
            },
          },
          {
            breakpoint: 330,
            settings: {
              arrows: false,
              slidesToShow: 4,
            },
          },
        ],
      },
      datesInfo: [],
      timeStamp: [],
    };
  },
  props: {
    slotsDates: {
      type: Array,
      required: true,
    },
    currentOrderId: {
      type: String,
      required: true,
    },
    resetSeletedDateTimes: {
      type: Boolean,
      required: true,
    },
    showCityIsNotServiceable: {
      type: Boolean,
      required: true,
    },
  },
  mixins: [ReleaseSlotBookingMixins],
  computed: {
    ...mapGetters({
      selectedAddress: 'releaseSlotBooking/selectedAddress',
    }),
  },
  watch: {
    resetSeletedDateTimes(value) {
      this.timeStamp = [];
      this.selectedTime = null;
      this.selectedDate = null;
      if (!value) {
        this.getSlotsDates();
      }
    },
  },
  components: { VueSlickCarousel },
  methods: {
    moment: (date) => moment(date),
    selectDate(date) {
      this.selectedDate = date;
      this.$emit('datehasSelected');
      this.$emit('selectedDate', this.selectedDate);
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_SLOT_SELECTED,
        [events.PAYMENT_ACTION]: 'release',
        [events.PAYMENT_ORDER_ID]: this.currentOrderId,
        [events.PAYMENT_DATE]: moment(this.selectedDate.date).format('DD/MM/YYYY'),
      };
      sendEvent(events.screen.RELEASE_SLOT_BOOKING, events.category.PAYMENT, properties);
      const tempDate = {
        date: date.date,
        orderId: this.currentOrderId,
        pincode: this.selectedAddress.pincode,
        latitude: this.selectedAddress.latitude,
        longitude: this.selectedAddress.longitude,
      };
      getSlotsAPI(tempDate)
        .then((responses) => {
          this.timeStamp = responses.data.data;
          this.checkAllSlotsBooked();
          this.setSlotUnavailable(!this.timeStamp.length);
        })
        .catch((error) => {
          this.setSlotUnavailable(!this.timeStamp.length);
          this.$noty.error(error.message);
        });
    },
    checkAllSlotsBooked() {
      const fullyBookedSlots = this.timeStamp.filter((slot) => !slot.availableagents);
      if (fullyBookedSlots.length === this.timeStamp.length) {
        this.setSlotUnavailable(true);
      }
    },
    setSlotUnavailable(slotIsUnavailable) {
      this.$emit('slotUnavailable', slotIsUnavailable);
      if (slotIsUnavailable) {
        this.timeStamp = [];
        this.selectedTime = null;
      }
    },
    selectTime(time) {
      this.selectedTime = time;
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_SLOT_SELECTED,
        [events.PAYMENT_ACTION]: 'release',
        [events.PAYMENT_ORDER_ID]: this.currentOrderId,
        [events.PAYMENT_DATE]: moment(this.selectedDate.date).format('DD/MM/YYYY'),
        [events.PAYMENT_TIME]: this.getTimeSlots(time),
      };
      sendEvent(events.screen.RELEASE_SLOT_BOOKING, events.category.PAYMENT, properties);
      const slotStatus = {
        slotStatus: 'available',
        slot: time,
      };
      this.$emit('setSlotInfo', slotStatus);
    },
    getSlotsDates() {
      this.datesInfo = [];
      this.slotsDates.forEach((date) => {
        const newDate = date;
        const today = moment().format('YYYY-MM-DD');
        const data = moment(newDate.date).format('YYYY-MM-DD');
        newDate.weekday = moment(today).isSame(moment(data))
          ? 'Today' : moment(newDate.date).format('ddd');
        this.datesInfo.push(newDate);
      });
    },
    resetSeletedDataTime() {
      this.timeStamp = [];
      this.selectedTime = null;
      this.selectedDate = null;
      this.$emit('setSlotInfo', {});
    },
  },
  mounted() {
    this.getSlotsDates();
  },
};
</script>
