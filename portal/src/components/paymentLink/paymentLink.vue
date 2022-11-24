<script>
import { mapGetters } from 'vuex';
import rupeekLogoRazorpay from '@/assets/rupeek_logo_razorpay.svg';
import { getPaymentDetails } from '../../api/payment.api';

export default {
  name: 'generatePaymentLink',
  computed: {
    ...mapGetters({
      userObj: 'auth/loggedInUser',
    }),
  },
  methods: {
    getPaymentDetails(rpkid) {
      getPaymentDetails(!(this.$route.name === 'web_pay_link_mob'), rpkid)
        .then((response) => {
          if (response.status === 200) {
            this.populatePaymentOptions = response.data.response.data.response;
            this.populateUserData = this.userObj;
            if (response.data.response.data.response.provider === 'razorpay') {
              this.populateRazorPayOptions();
            } else if (response.data.response.data.response.provider === 'billdesk') {
              this.initiateBillDeskPayment();
            }
          }
        })
        .catch((error) => {
          this.$router.push('/');
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
      // As an instance method inside a component
  this.$loadScript('https://checkout.razorpay.com/v1/checkout.js')
    .then(() => {
      this.getPaymentDetails(this.$route.params.rpkid);
    })
    .catch(() => {
      this.$noty.error('Sorry, Something went wrong Please try again');
    });
  }
};
</script>
<style scoped lang='scss'>

</style>

