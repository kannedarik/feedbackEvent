<template>
  <div class="block">
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import {
  getPaymentDetails as getPaymentDetailsProvider,
  getPaymentDetailsV2,
  getPaymentSuccessDetails,
} from '@/api/paymentGateways.api';
import rupeekLogoRazorpay from '@/assets/rupeek_logo_razorpay.svg';

export default {
  name: 'generatePaymentLink',
  computed: {
    ...mapGetters({
      user: 'auth/loggedInUser',
    }),
  },
  methods: {
    getPaymentDetails(paymentId) {
      let isDesktopView = true;
      let getPaymentDetailsProviderAPI = getPaymentDetailsProvider;
      if (this.$route.name === 'web_pay_link_mob' || this.$route.name === 'v2_web_pay_link_mob') {
        isDesktopView = false;
        if (this.$route.name === 'v2_web_pay_link_mob') {
          getPaymentDetailsProviderAPI = getPaymentDetailsV2;
        }
      }
      getPaymentDetailsProviderAPI(isDesktopView, paymentId)
        .then((response) => {
          if (response.status === 200) {
            this.populatePaymentOptions = response.data.response.data.response;
            if (isDesktopView) {
              this.populateUserData = this.user;
            } else {
              this.populateUserData = response.data.response.data.user;
            }
            if (response.data.response.data.response.provider === 'razorpay') {
              this.populateRazorPayOptions();
            } else if (response.data.response.data.response.provider === 'billdesk') {
              this.initiateBillDeskPayment();
            }
          }
        })
        .catch((error) => {
          this.$router.push('/dashboard');
          if (error.response && error.response.data.error) {
            this.$noty.error(error.response.data.response.mesg);
          }
        });
    },
    populateRazorPayOptions() {
      this.razprpayOptions.key = this.populatePaymentOptions.razorpay_key;
      this.razprpayOptions.amount = this.populatePaymentOptions.amount * 100;
      this.razprpayOptions.description = this.populatePaymentOptions.description;
      this.razprpayOptions.prefill.name = `${this.populateUserData.firstname} ${this.populateUserData.lastname}`;
      this.razprpayOptions.prefill.contact = this.populateUserData.phone;
      this.razprpayOptions.notes.order_id = this.populatePaymentOptions.requestid;
      this.razprpayOptions.timeout = this.populatePaymentOptions.pay_timeout;
      this.razprpayOptions.callback_url = `${this.populatePaymentOptions.callback_url}&mweb=true`;
      this.razprpayOptions.redirect = true;
      this.razprpayOptions.modal.ondismiss = () => {
        window.location = '/dashboard';
      };
      delete this.razprpayOptions.handler;
      /* eslint-disable */
      const rzp = new Razorpay(this.razprpayOptions);
      rzp.open();
      /* eslint-disable */
    },
    initiateBillDeskPayment() {
      window.location.href = this.populatePaymentOptions.link;
    },
    // function to confirm the razorpay payment status
    confirmRazorpayPaymentStatus(providerId, requestObj) {
      getPaymentSuccessDetails(providerId, requestObj)
        .then((dataResponse) => {
          if (dataResponse.status === 200) {
            this.$router.push(`/new-payment-status?requestid=${this.$route.params.id}`);
          }
        })
        .catch(() => {
          this.$router.push(`/new-payment-status?requestid=${this.$route.params.id}`);
        });
    },
    apiCall(){
      // As an instance method inside a component
      this.$loadScript('https://checkout.razorpay.com/v1/checkout.js')
        .then(() => {
          // function call to get the details of the payments info using the payment id like (RPK....)
          this.getPaymentDetails(this.$route.params.id);
        })
        .catch(() => {
          this.$noty.error('Sorry, Something went wrong Please try again');
        });
    }
  },
  data() {
    return {
      populatePaymentOptions: null,
      populateUserData: null,
      razprpayOptions: {
        key: null,
        amount: null,
        name: 'Rupeek Fintech Pvt. Ltd.',
        description: null,
        image: rupeekLogoRazorpay,
        handler(response) {
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          order_id: null,
        },
        theme: {
          color: '#e63212',
        },
        modal: {
          ondismiss() {
          },
        },
      },
    };
  },
  mounted() {
    this.apiCall();
  },
};
</script>
