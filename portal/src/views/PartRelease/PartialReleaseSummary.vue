<template>
  <div>
    <div class="leadform z-index-999" v-if="hasShowJewelsInfo"></div>
    <div class="payments-body">
      <Container :screenType="'body-bg'">
        <div class="header sm:px-4 sm:py-4 md:p-6 mt-2 bg-white">
          <div class="md:flex md:items-center">
            <div>
              <img src="@/assets/icons/left_arrow.svg" alt="back_arrows"
              class="cursor-pointer" @click="backToJewels()"/>
            </div>
            <div class="sm:mt-3 md:mt-0 md:ml-4">
              <h2 class="font-semibold text-lg">
                {{$t('partial_release_summary')}}
              </h2>
            </div>
          </div>
        </div>
        <div class="bg-white pt-3 pb-3 mb-6">
          <TotalLoansDetails
            class="part-release-flow"
            :totalLoansDetails="getLoanDetails"
            v-if="selectedJewels.length"
          />
          <div class="release-gold px-3">
            <h3 class="flex items-center mt-6 font-bold
              text-base font-secondary">
              Gold for Part Release
              <span class="total-loans rounded-md inter-font-family
                ml-2 px-2 font-semibold font-secondary">
                {{selectedJewels.length}}
              </span>
            </h3>
            <JewelsList class="my-3"
              :jewelsList="selectedJewels"
              :index="0"
            />
          </div>
        </div>
        <div class="new-loan-update px-3">
          <h3 class="mb-3 text-lg font-bold font-secondary">
            New Loan Update
          </h3>
          <div class="new-loan-card">
            <div class="summary-row">
              <div class="renewal-number-of-loans receipt-component">
                <div class="font-bold text-base font-secondary">
                  Gold for New Loan
                  <span class="total-loans rounded-md inter-font-family
                    ml-2 px-2 font-semibold font-secondary">
                    {{newLoanJewels.length}}
                  </span>
                </div>
              </div>
              <div class="renewal-number-of-loans">
                <button class="btn-transparent" @click="openJewelsInfo">
                  {{$t('view_gold')}}
                </button>
              </div>
            </div>
            <div class="flex items-center info-message p-3">
              <img src="@/assets/icons/info_icon.svg" alt="InfoIcon" />
              <p class="ml-2 text-sm font-secondary inter-font-family">
                The remaining gold after part release will be booked as a new loan
              </p>
            </div>
          </div>
        </div>
        <PartReleaseSummary
          :ordersList="ordersList"
          :excessFundingAmount="excessFundingAmount"
          :payableAmount="payableAmount"
          @viewRemainingJewels="viewRemainingJewels($event)"
        />
        <InfoMessageWithTitle
          :infoMessage="infoMessage"
          class="mb-5 text-left info-message mx-3"
        />
      </Container>
    </div>
    <div class="footer-new">
      <Container>
        <div class="py-2 sm:px-4 md:p-7 d-flex items-center sm:flex-column md:flex-row">
          <div class="loan-selection-info-wrapper w-full md:w-1/2">
            <label class="container-checkbox pl-4">
              <input type="checkbox" v-model="checked"/>
              <span class="checkmark cursor-pointer"></span>
              I confirm that I am the primary account holder and
              I have read all the part release details
            </label>
          </div>
          <div class="w-full md:w-1/2 md:flex md:justify-end">
            <button :class="[`btn-primary-rupeek
              text-sm md:text-base rounded-full w-full md:w-3/4
              ${!checked ? 'opacity-50 disabled-btn' : ''}`]"
              @click="proceedPartRelease">
                Proceed for Part Release
              </button>
          </div>
        </div>
      </Container>
    </div>
    <transition
      name="custom-classes-transition"
      enter-active-class="animated slideInUp"
      leave-active-class="animated slideOutDown">
      <BottomPopUpInfo
        :goldRelease="goldRelease"
        :hasPartReleaseSummary="true"
        :hasProceedPartRelease="hasProceedPartRelease"
        :partReleaseInfo="partReleaseInfo"
        v-on:closeOnboarding="closeOnboarding()"
        v-on:continueToPay="continueToPay()"
        v-if="hasShowJewelsInfo"
      />
    </transition>
  </div>
</template>
<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import store from '@/store';
import { fetchPartReleaseOrdersAPI } from '@/api/partRelease.api';
import { getPartReleasePaymentsLinkForOrderId } from '@/api/paymentGateways.api';
import Container from '@/components/CommonComponents/Container.vue';
import PartReleaseSummary from '@/components/PartReleaseSummary/PartReleaseSummary.vue';
import TotalLoansDetails from '@/components/CommonComponents/totalLoansDetails.vue';
import InfoMessageWithTitle from '@/components/InfoMessagesBoxs/InfoMessageWithTitle.vue';
import BottomPopUpInfo from '@/components/CommonComponents/BottomPopUpInfo.vue';
import JewelsList from '@/components/ReleaseTracker/jewelsCarousel.vue';
// eslint-disable-next-line
import { makePartReleasePay } from '@/utils/getPaymentMethods';
import { formatRupeeAmount } from '@/utils/string';
import PaymentType from '@/mixins/PaymentType';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';
import InfoIcon from '@/assets/icons/info_icon.svg';

export default {
  name: 'PartialReleaseSummary',
  components: {
    Container,
    BottomPopUpInfo,
    PartReleaseSummary,
    TotalLoansDetails,
    InfoMessageWithTitle,
    JewelsList,
  },
  data() {
    return {
      checked: false,
      ordersList: [],
      jewelsList: null,
      schemes: null,
      // var to store the total renewal amount
      payableAmount: 0,
      // var to store the total excess funding amount
      excessFundingAmount: 0,
      totalReleaseAmount: 0,
      selectedJewels: [],
      newLoanJewels: [],
      goldRelease: [],
      hasShowJewelsInfo: false,
      hasProceedPartRelease: false,
      partReleaseInfo: {},
    };
  },
  mixins: [PaymentType],
  computed: {
    ...mapGetters({
      selectedJewelsList: 'jewels/selectedJewelsList',
      paymentOption: 'loans/paymentOption',
    }),
    order() {
      return this.$route.query;
    },
    getLoanDetails() {
      const loanDetails = {
        totalPayableAmount: this.totalReleaseAmount,
        details: [
          { key: 'part_release_amount', amount: (this.payableAmount - this.excessFundingAmount) },
          { key: 'excess_funding', amount: this.excessFundingAmount },
        ],
      };
      return loanDetails;
    },
    infoMessage() {
      const messageInfo = {
        infoIcon: InfoIcon,
        title: 'Gold will be delivered only to the primary account holder',
        message: 'If you are not the primary account holder / account holder has passed away, please contact customer care to proceed further',
        size: 'very-big',
        hasAuction: false,
      };
      return messageInfo;
    },
  },
  watch: {
    order(value) {
      if (!_.isEmpty(value)) {
        this.getOrdersList();
      }
    },
  },
  methods: {
    formatRupeeAmount,
    backToJewels() {
      this.checked = false;
      this.$router.push('/jewels-selection');
    },
    getOrdersList() {
      const { orderId } = this.$route.query;
      store.dispatch('jewels/orderId', orderId);
      const tempObj = {
        process: 'PART_RELEASE',
        orderId,
        pageNumber: 0,
        fields: 'MASTER_SCHEME, JEWELS',
      };
      fetchPartReleaseOrdersAPI(tempObj)
        .then((responses) => {
          this.ordersList = responses.data.orders;
          this.schemes = responses.data.schemes;
          this.jewelsList = responses.data.jewels;
          this.createOrdersList();
        })
        .catch((error) => {
          this.$noty.error(error);
        });
    },
    createOrdersList() {
      const jewelSelectedId = [];
      const jewelRemaining = [];
      this.totalReleaseAmount = 0;
      this.excessFundingAmount = 0;
      this.payableAmount = 0;
      this.selectedJewels = [];
      this.ordersList.map((order) => {
        const orderData = order;
        orderData.orderItems.map((orderItem) => {
          const orderItemData = orderItem;
          orderItemData.jewelSelected.map((jewels) => jewelSelectedId.push(jewels));
          orderItemData.jewelRemaining.map((jewels) => jewelRemaining.push(jewels));
          orderItemData.loanDetails.map((oldLoan) => {
            const oldLoanData = oldLoan;
            this.totalReleaseAmount += oldLoan.payableAmount ? oldLoan.payableAmount : 0;
            this.excessFundingAmount += oldLoanData.excessAmount;
            this.payableAmount += oldLoanData.payableAmount;
            oldLoanData.schemes = this.schemes[(orderItemData.masterSchemeId).trim()];
            return oldLoanData;
          });
          orderItemData.newLoanDetails.map((newLoan) => {
            const newLoanData = newLoan;
            newLoanData.newLoanJewels = [];
            orderItemData.jewelRemaining.forEach((remainingJewels) => {
              newLoanData.newLoanJewels.push(this.jewelsList[remainingJewels]);
            });
            newLoanData.schemes = this.schemes[(orderItemData.newMasterSchemeId).trim()];
            return newLoanData;
          });
          return orderItemData;
        });
        return orderData;
      });
      jewelSelectedId.forEach((selectedJewel) => {
        this.selectedJewels.push(this.jewelsList[selectedJewel]);
      });
      jewelRemaining.forEach((remainingJewels) => {
        this.newLoanJewels.push(this.jewelsList[remainingJewels]);
      });
      if (this.selectedJewels.length) {
        store.dispatch('jewels/selectedJewelsList', this.selectedJewels);
      }
    },
    proceedPartRelease() {
      this.partReleaseInfo = {
        goldPartReleaseCount: this.selectedJewels.length,
        payableAmount: formatRupeeAmount(this.payableAmount),
      };
      this.hasShowJewelsInfo = true;
      this.hasProceedPartRelease = true;
    },
    continueToPay() {
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_PART_RELEASE_SUMMARY_PAGE_ACCEPT_CONTINUE_CLICKED,
      };
      sendEvent(events.screen.PART_RELEASE_SUMMARY, events.category.PAYMENT, properties);
      if (this.payableAmount) {
        makePartReleasePay(this.$route.query.orderId);
      } else {
        this.getPartReleasePaymentsLink();
      }
    },
    getPartReleasePaymentsLink() {
      const { orderId } = this.$route.query;
      getPartReleasePaymentsLinkForOrderId(orderId)
        .then((response) => {
          if (response.status === 200) {
            if (response.data.data.link) {
              this.$router.push(`/new-payment-status?orderId=${orderId}&success=false`);
            } else {
              // this.$noty.success(response.data.message);
              setTimeout(() => { window.location.reload(); }, 3000);
            }
          }
        })
        .catch((error) => {
          this.$noty.error(error);
        });
    },
    openJewelsInfo() {
      this.hasShowJewelsInfo = true;
      this.goldRelease = this.newLoanJewels;
    },
    viewRemainingJewels(data) {
      this.hasShowJewelsInfo = true;
      this.goldRelease = data;
    },
    closeOnboarding() {
      this.goldRelease = [];
      this.partReleaseInfo = {};
      this.hasShowJewelsInfo = false;
      this.hasProceedPartRelease = false;
    },
  },
  mounted() {
    this.checkPaymentOption();
    const properties = {
      [events.EVENT_NAME]: events.PAYMENT_PART_RELEASE_SUMMARY_PAGE,
    };
    sendEvent(events.screen.PART_RELEASE_SUMMARY, events.category.PAYMENT, properties);
    this.getOrdersList();
  },
};
</script>
<style lang='scss'>
  @import '@/scss/payments-summary/payments-summary.scss';
  .new-loan-card {
    background: #FFFFFF;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
  }
  .amount-details{
    h4 {
      font-size: 2rem;
    }
    h3 {
      font-size: 0.825rem;
      color: #727272;
    }
  }
  .px-5 {
    padding-left: 1.25rem !important;
    padding-right: 1.25rem !important;
  }
  @media screen and (max-width: 640px) {
  .footer-new {
    .custom-control-label {
      font-size: 12px;
    }
  }
}
@media screen and (max-width: 320px) {
  .footer-new {
    .custom-control-label {
      font-size: 10px;
    }
  }
}
.total-loans {
  background: #FCE6DC;
}
.info-message {
  background: #E6F5FE;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 16px;
}
</style>
