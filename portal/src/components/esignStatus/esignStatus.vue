<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import store from '@/store';
import { getUnsignedDocument, fetchEsignLinks, getorderDetails } from '@/api/repledge.api';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';
import infoIcon from '@/assets/icons/info_icon.svg';

export default {
  data() {
    return {
      links: [],
      count: 0,
      hasShowRetryBtn: false,
    };
  },
  computed: {
    _() {
      return _;
    },
    ...mapGetters({
      lendersConfig: 'loans/lendersConfig',
    }),
  },
  methods: {
    toBack() {
      this.$router.push('/dashboard');
    },
    infoMessage(data) {
      const messageInfo = {
        infoIcon,
        title: data.title,
        message: data.message,
        size: 'big',
        hasAuction: false,
      };
      return messageInfo;
    },
    trackEsignLenderOrRupeek(link) {
      const eventName = link.custom.lender === 'rupeek' ? events.PAYMENT_RUPEEK_ESIGN_CLICKED : events.PAYMENT_LENDER_ESIGN_CLICKED;
      const properties = {
        [events.EVENT_NAME]: eventName,
      };
      sendEvent(events.screen.ESIGN_STATUS, events.category.PAYMENT, properties);
    },
    toPayments() {
      this.$router.push({ name: 'paymentOptions', params: { id: this.$route.params.id } });
    },
    // for fetching the unsigned pc
    async getDocument(orderid) {
      try {
        const response = await getUnsignedDocument(orderid);
        window.open(response.data && response.data.docurl, '_blank', 'toolbar=yes,scrollbars=yes,resizable=yes,,width=100%,height=400');
      } catch (error) {
        this.$noty.error(error.message);
      }
    },
    retry() {
      this.count = 0;
      this.getEsignLinks();
    },
    // for fetching the esign links
    async getEsignLinks() {
      try {
        const response = await fetchEsignLinks(this.$route.params.id);
        this.hasShowRetryBtn = false;
        let signedCount = 0;
        this.links = response.data.signingrequests;
        if (!this.links.length && this.count < 2) {
          this.count += 1;
          setTimeout(() => { this.getEsignLinks(); }, 5000);
          store.dispatch('loader/setLoading', { esign: true, loader: true });
        } else {
          store.dispatch('loader/stopLoading');
          this.count += 1;
          this.links.map((key) => {
            const data = key;
            if (data.status.name === 'failure') {
              this.$router.push({ name: 'orderStatus', params: { orderId: this.$route.params.id } });
            }
            if (data.status.name === 'success') {
              signedCount += 1;
            }
            return data;
          });
        }
        if (this.links.length > 0) {
          if (this.links.length === signedCount) {
            this.getorderDetails();
          }
        } else if (this.count >= 3) {
          store.dispatch('loader/stopLoading');
          this.$noty.error('Esign Links Not Found, Please reload the page again');
        }
      } catch (error) {
        this.hasShowRetryBtn = true;
        this.$noty.error(error.message);
      }
    },
    async getorderDetails() {
      try {
        const response = await getorderDetails(this.$route.params.id);
        if (response.data.order.hasLoanEnhancementLoans && response.data.order.paymentstatus === 'success' && response.data.order.signingstatus === 'success') {
          this.$router.push({ name: 'bankDetails', params: { id: this.$route.params.id } });
        } else {
          this.$router.push({ name: 'orderStatus', params: { orderId: this.$route.params.id } });
        }
      } catch (error) {
        this.$noty.error(error.message);
      }
    },
    // redirecting to esign page
    toEsign() {
      let urlSelected = false;
      this.links.map((key) => {
        if (key.status.name === 'processing' && !urlSelected) {
          urlSelected = true;
          window.location.href = key.signurl;
        }
        return true;
      });
    },
  },
  activated() {
    this.links = [];
    this.count = 0;
    this.getEsignLinks();
  },
};
</script>
