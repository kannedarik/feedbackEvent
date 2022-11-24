import _ from 'lodash';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';
import values from 'lodash/values';
import moment from 'moment';
import { mapGetters } from 'vuex';
import store from '@/store';
import {
  fetchOrdersDetailsAPI,
  getStaticMessageAPI,
} from '@/api/goldRelease.api';
import {
  customerAddressValidationAPI,
  getCustomerAddressInfoAPI,
} from '@/api/releaseSlotBooking.api';
import events from '@/utils/clevertap/eventconstants';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import constants from '@/constant';

export default {
  data() {
    return {
      // Array is used to store the static messages details
      staticMessages: [],
      staticMessage: {},
      addressValidation: {},
      lastUpdatedDate: null,
    };
  },
  computed: {
    ...mapGetters({
      addressDetails: 'releaseSlotBooking/addressDetails',
    }),
    _() {
      return _;
    },
  },
  methods: {
    moveToHome() {
      this.$router.push('/dashboard');
    },
    getCustomerAddressInfo() {
      const userObj = store.getters['auth/loggedInUser'];
      const orderCityInfo = store.getters['releaseSlotBooking/orderCityInfo'];
      getCustomerAddressInfoAPI(userObj.phone)
        .then((responses) => {
          let addressDetailsInfo = {};
          responses.data.users.forEach((address) => {
            address.addressList.map((addressData) => {
              const AddressInfo = addressData;
              if (!AddressInfo.displayText) {
                AddressInfo.displayText = values(pick(pickBy(AddressInfo), ['floor', 'house', 'apartment', 'street', 'subarea', 'area', 'city', 'state', 'pincode'])).join(', ');
              }
              return AddressInfo;
            });
            addressDetailsInfo = {
              ...orderCityInfo,
              addressList: address.addressList,
              leadId: address.leadId,
            };
          });
          store.dispatch('releaseSlotBooking/customerAddressInfo', addressDetailsInfo);
        })
        .catch((error) => {
          this.$noty.error(error.message);
        });
    },
    getStaticMessages(screenType) {
      getStaticMessageAPI(`screen=${screenType}`)
        .then((responses) => {
          this.staticMessages = responses.data.data;
          const data = Object.assign({},
            ...this.staticMessages.map((item) => ({ [item.identifier]: item })));
          this.staticMessage = data;
        })
        .catch((error) => {
          this.$noty.error(error);
        });
    },
    customerAddressValidation(pincode) {
      customerAddressValidationAPI(pincode)
        .then((responses) => {
          this.addressValidation = responses.data.data;
        })
        .catch((error) => {
          this.$noty.error(error.message);
        });
    },
    getOrdersList(data, screenType) {
      const tempObj = {
        process: 'RELEASE',
        pageNumber: 0,
        fields: 'JEWELS',
        orderStatus: 'IN_PROGRESS',
      };
      fetchOrdersDetailsAPI({ ...tempObj, ...data })
        .then((responses) => {
          this.lastUpdatedDate = moment().format('hh:mm A');
          this.getOrdersDetails(responses.data.orders, responses.data.jewels);
          if (screenType !== 'NO') {
            this.getStaticMessages(screenType);
          }
        })
        .catch((error) => {
          this.$noty.error(error.message);
        });
    },
    getDate(releaseDate) {
      const today = moment().format('YYYY-MM-DD');
      const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
      const localTime = moment.utc(releaseDate).toDate();
      let displayDate = '';
      if (moment(today).isSame(moment(localTime).format('YYYY-MM-DD'))) {
        displayDate = 'Today';
      } else if (moment(tomorrow).isSame(moment(localTime).format('YYYY-MM-DD'))) {
        displayDate = 'Tomorrow';
      } else {
        displayDate = moment(localTime).format('DD/MM/YYYY');
      }
      return displayDate;
    },
    getReleaseTimeSlot(releaseTime) {
      const localTime = moment.utc(releaseTime).toDate();
      return moment(localTime).format('hh:mm a');
    },
    getTimeSlots(time) {
      const slotStartTime = time.customerreachingtime;
      const startLocalTime = this.getReleaseTimeSlot(slotStartTime);
      const endLocalTime = this.getReleaseTimeSlot(time.slotend);
      return (`${startLocalTime} - ${endLocalTime}`);
    },
    movetToTrackYourGold(releaseInfo, isHomeScreen = false, slotBookingLaunched) {
      if (((_.get(releaseInfo, 'releaseDeliveryStatus') === constants.releaseDeliveryStatus.SLOT_UNAVAILABLE
      || _.get(releaseInfo, 'releaseDeliveryStatus') === constants.releaseDeliveryStatus.PAYMENT_SUCCESSFUL)
      && _.get(releaseInfo, 'progress.staticKey') !== 'release_related_loan') && !isHomeScreen && slotBookingLaunched) {
        const eventProperties = {
          [events.EVENT_NAME]: events.PAYMENT_BOOK_GOLD_DELIVERY_SLOT_CLICKED,
          [events.PAYMENT_RELATED_LOAN]:
           _.get(releaseInfo, 'progress.staticKey') === 'release_related_loan',
          [events.PAYMENT_ORDER_ID]: _.get(releaseInfo, 'id'),
        };
        sendEvent(events.screen.STATUS_CARDS, events.category.PAYMENT, eventProperties);
        this.$router.push(`/release-slot-booking?orderId=${_.get(releaseInfo, 'id')}`);
      } else {
        const eventProp = {
          [events.PAYMENT_STATIC_KEY]: _.get(releaseInfo, 'progress.staticKey'),
          [events.PAYMENT_ORDER_ID]: _.get(releaseInfo, 'id'),
        };
        if (isHomeScreen) {
          eventProp[events.EVENT_NAME] = events.CLICKED_ON_VIEW_MORE_FROM_STATUS_CARD;
          eventProp[events.PAYMENT_ACTION] = 'release';
        } else {
          eventProp[events.EVENT_NAME] = events.CLICKED_ON_TRACK_YOUR_GOLD_ON_STATUS_CARD_LIST;
        }
        sendEvent(events.screen.DASHBOARD, events.category.PAYMENT, eventProp);
        this.$router.push(`/release-tracker/${_.get(releaseInfo, 'id')}`);
      }
    },
    getEstimatedArrivalTime(pendingLoan) {
      let estimatedArrivalTime = '--';
      if (_.get(pendingLoan, 'releaseSlotStart') && _.get(pendingLoan, 'releaseSlotEnd')) {
        estimatedArrivalTime = `${this.getTimeSlots({ customerreachingtime: pendingLoan.releaseSlotStart, slotend: pendingLoan.releaseSlotEnd })},`;
      } else if (_.get(pendingLoan, 'releaseSlotStart') && !_.get(pendingLoan, 'releaseSlotEnd')) {
        estimatedArrivalTime = `${this.getReleaseTimeSlot(pendingLoan.releaseSlotStart)},`;
      } else if (!_.get(pendingLoan, 'releaseSlotStart') && _.get(pendingLoan, 'releaseSlotEnd')) {
        estimatedArrivalTime = `${this.getReleaseTimeSlot(pendingLoan.releaseSlotEnd)},`;
      }
      return estimatedArrivalTime;
    },
    getEstimatedArrivalDay(pendingLoan) {
      let estimatedArrivalDay = '--';
      if (_.get(pendingLoan, 'releaseSlotStart') && _.get(pendingLoan, 'releaseSlotEnd')) {
        estimatedArrivalDay = this.getDate(pendingLoan.releaseSlotStart);
      } else if (_.get(pendingLoan, 'releaseSlotStart') && !_.get(pendingLoan, 'releaseSlotEnd')) {
        estimatedArrivalDay = this.getDate(pendingLoan.releaseSlotStart);
      } else if (!_.get(pendingLoan, 'releaseSlotStart') && _.get(pendingLoan, 'releaseSlotEnd')) {
        estimatedArrivalDay = this.getDate(pendingLoan.releaseSlotEnd);
      }
      return estimatedArrivalDay;
    },
  },
};
