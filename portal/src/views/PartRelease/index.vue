<template>
  <div>
    <div class="leadform z-index-999" v-if="hasPartReleaseInfo"></div>
    <div :class="[selectedJewelsCount ? 'payments-body' : '']">
      <Container :screenType="'body-bg'">
        <div class="header p-6 mt-2">
          <div class="md:flex md:items-center">
            <div>
              <img src="@/assets/icons/left_arrow.svg" alt="back_arrows"
                class="cursor-pointer" @click="backToHome()"/>
            </div>
            <div class="sm:mt-3 md:mt-0 md:ml-3">
              <h2 class="font-semibold text-lg">
                {{$t('choose_gold_for_part_release')}}
              </h2>
            </div>
          </div>
        </div>
        <div class="sm:px-3 sm:my-3 md:my-4"
          v-if="totalJewelsCount">
          <VideoBanner
            :assets="getAssets"
            :eventDetails="{}"
            v-on:showPartReleaseInfo="hasPartReleaseInfo = true"
          />
        </div>
        <ExcessFundingAlert v-if="hideLoanSelection"/>
        <p class="type-secondary sm:px-4 py-3 md:px-6 font-bold">
          Total Jewels: {{totalJewelsCount}}
        </p>
        <div class="jewels-selection block sm:px-4 md:px-4 mb-16"
          v-if="!_.isEmpty(selectedLoansJewels)">
          <InfoMessageWithTitle :infoMessage="infoMessage" />
          <div class="py-2">
            <div v-for="(loan, loanIndex) in selectedLoansJewels.selectedLoan" :key="loanIndex">
              <LoansInfo
                :loan="loan"
                :loanInfo="{
                  loanIndex,
                  id: `loan-selected-${loanIndex}`,
                  selectedLoan: true,
                  showCheckBox: true,
                  quickLinksPartRelease: quickLinksPartRelease,
                }" />
              <template v-if="!loan.jewels.length">
                <p class="my-4">
                  {{$t('selected_loan_has_does_not_have_jewels')}}
                </p>
              </template>
            </div>
            <div class="flex items-center justify-between position-relative cursor-pointer"
              role="tab" @click="showUnSelectedLoanJewels" v-if="!quickLinksPartRelease">
              <div class="divider-horizontal">
                <div class="divider-text">
                  <div class="leading-4">
                    <p class="font-bold leading-none">
                      {{$t('view_more_loans')}}
                    </p>
                    <span class="text-xs normal-font">
                      {{$t('loans_with_same_leander_branch')}}
                    </span>
                  </div>
                </div>
              </div>
              <button class="view-more-loans"
                :class="viewUnSelectedLoanJewels ? null : 'collapsed'"
                :aria-expanded="`${viewUnSelectedLoanJewels}`"
                aria-controls="unselectedloan">
                <img src="@/assets/icons/down_arrow_icon.svg" alt="arrow" class="m-auto" />
              </button>
            </div>
            <b-card no-body class="border-0 bg-transparent" v-if="!quickLinksPartRelease">
              <b-collapse id="unselectedloan"
                v-model="viewUnSelectedLoanJewels"
                accordion="my-accordion"
                role="tabpanel">
                <div class="p-0" v-for="(loan, loanIndex) in selectedLoansJewels.unSelectedLoan"
                  :key="loanIndex">
                  <LoansInfo
                    :loan="loan"
                    :loanInfo="{
                      loanIndex,
                      id:`loan-unselected-${loanIndex}`,
                      selectedLoan: false,
                      showCheckBox: true,
                      quickLinksPartRelease: quickLinksPartRelease,
                    }"/>
                </div>
              </b-collapse>
            </b-card>
          </div>
        </div>
      </Container>
      <transition
        name="custom-classes-transition"
        enter-active-class="animated slideInUp"
        leave-active-class="animated slideOutDown">
        <BottomPopUpInfo
          v-on:closeOnboarding="hasPartReleaseInfo = false"
          v-if="hasPartReleaseInfo"
        />
      </transition>
      <JewelsValidationPopUp
        :validatedLoans="validationInfo.storeValidatedLoans"
        :dialog="validationInfo.storeDialog"
        :validationError="validationInfo.storeValidationError"
        v-on:backToJewels="backToJewels"
        v-on:addLoanClosure="addLoanClosure"
        v-if="showErrorMessage" />
    </div>
    <PartReleaseFooter v-if="hasSelectedJewels"/>
    <!-- Payment Options Component Wrapper -->
    <transition
      name="custom-classes-transition"
      enter-active-class="animated slideInUp"
      leave-active-class="animated slideOutDown">
      <PaymentOptions
        :visible="showDiscrepancyInfo"
        @hide-payments-options="hidePaymentOptionsComponent"
        :closeInfoDetails="closeInfoDetails"
        @moveToCloseLoan="moveToCloseLoan"
      />
    </transition>
  </div>
</template>
<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import store from '@/store';
import Container from '@/components/CommonComponents/Container.vue';
import InfoMessageWithTitle from '@/components/InfoMessagesBoxs/InfoMessageWithTitle.vue';
import LoansInfo from '@/components/partRelease/LoansInfo.vue';
import JewelsValidationPopUp from '@/components/partRelease/JewelsValidationPopUp.vue';
import PartReleaseFooter from '@/components/partRelease/PartReleaseFooter.vue';
import ExcessFundingAlert from '@/components/CommonComponents/ExcessFundingAlert.vue';
import VideoBanner from '@/components/ReleaseTracker/videoBanner.vue';
import BottomPopUpInfo from '@/components/CommonComponents/BottomPopUpInfo.vue';
import PaymentOptions from '@/components/PaymentOptionsPopup/PaymentOptionsPopup.vue';
import infoIcon from '@/assets/icons/additiona_info_icon.svg';
import PaymentType from '@/mixins/PaymentType';
import mixinComponent from '@/mixins/mixinComponent';
import { sendEvent } from '@/utils/clevertap/EventTracker';
/* eslint import/no-cycle: [2, { maxDepth: 1 }] */
import { setLoanClosure } from '@/utils/partRelease';
import events from '@/utils/clevertap/eventconstants';
import thumbnailUrl from '@/assets/part_release_gif/thumbnail.gif';

export default {
  name: 'JewelsSelection',
  components: {
    Container,
    InfoMessageWithTitle,
    LoansInfo,
    JewelsValidationPopUp,
    PartReleaseFooter,
    ExcessFundingAlert,
    BottomPopUpInfo,
    VideoBanner,
    PaymentOptions,
  },
  data() {
    return {
      selectedIndex: null,
      viewUnSelectedLoanJewels: false,
      infoMessage: {
        infoIcon,
        title: 'additional_information',
        message: 'select_multiple_jewels_same_lender_branch',
        size: 'small',
      },
      coreids: [],
      identifierType: 'jewels-list-disabled',
      enableDigitalPartRelease: [],
      identifierMessage: '',
      quickLinksPartRelease: false,
      hasPartReleaseInfo: false,
      hasSelectedJewels: true,
      showDiscrepancyInfo: false,
    };
  },
  mixins: [PaymentType, mixinComponent],
  computed: {
    ...mapGetters({
      selectedLoansJewels: 'jewels/jewelsList',
      paymentOption: 'loans/paymentOption',
      hideLoanSelection: 'loans/hideLoanSelection',
      validationInfo: 'jewels/validationInfo',
      showErrorMessage: 'jewels/showErrorMessageModal',
      quickLinkSelected: 'quickLinks/quickLinkSelected',
      selectedJewelsCount: 'jewels/selectedJewelsCount',
      closeInfoDetails: 'jewels/closeInfoDetails',
    }),
    _() {
      return _;
    },
    totalJewelsCount() {
      let jewelsCount = 0;
      if (_.get(this.selectedLoansJewels, 'loans', []).length) {
        _.get(this.selectedLoansJewels, 'loans').forEach((loan) => {
          jewelsCount += loan.jewels.length;
        });
      }
      return jewelsCount;
    },
    getAssets() {
      return {
        title: 'What is Part Release?',
        description: 'Get some of your gold delivered using the part release feature',
        thumbnailUrl,
        hasPartReleaseInfo: true,
      };
    },
  },
  watch: {
    selectedLoansJewels(value) {
      const partReleaseFlowInfo = localStorage.getItem('partReleaseFlowInfo')
        ? localStorage.getItem('partReleaseFlowInfo') : false;
      if (!partReleaseFlowInfo) {
        this.hasPartReleaseInfo = true;
      }
      if (_.get(value, 'loans', []).length) {
        this.getAuctionMessagesType(value);
      }
    },
    staticMessage(value) {
      store.dispatch('jewels/actionMessages', value);
    },
    quickLinksPartRelease(value) {
      if (value) {
        this.viewUnSelectedLoanJewels = value;
      }
    },
    quickLinkSelected(value) {
      this.quickLinksPartRelease = value === 'part-release';
    },
    closeInfoDetails(value) {
      if (value && value.hasInfo) {
        this.showDiscrepancyInfo = true;
      }
    },
  },
  methods: {
    backToHome() {
      if (this.quickLinkSelected !== 'all') {
        store.dispatch('quickLinks/setQuickLinkSelected', 'all');
        store.dispatch('quickLinks/setQuickLinkDispaly', 'Manage Loans');
      }
      store.dispatch('jewels/selectedJewelsCount', 0);
      this.$router.push('/dashboard');
    },
    showUnSelectedLoanJewels() {
      const properties = {
        [events.EVENT_NAME]:
        events.PAYMENT_JEWEL_SELECTION_SAME_LENDER_SAME_BRANCH_EXPAND_ARROW_CLICKED,
      };
      sendEvent(events.screen.JEWELS_SELECTION, events.category.PAYMENT, properties);
      this.viewUnSelectedLoanJewels = !this.viewUnSelectedLoanJewels;
    },
    // function call to hide vaildation popup and
    // if validation error type is "closure" unselecte last selected jewel.
    backToJewels() {
      store.dispatch('jewels/showErrorMessageModal', false);
      const allJewelsSelected = this.validationInfo.storeValidationError.includes('closure');
      store.dispatch('jewels/unselectLastSeletedJewel', allJewelsSelected);
    },
    addLoanClosure() {
      store.dispatch('jewels/setLoanClosure');
      store.dispatch('jewels/showErrorMessageModal', false);
      store.dispatch('jewels/selectedAddLoanClosure', true);
    },
    getAuctionMessagesType(selectedLoans) {
      let auctionMessagesType = [];
      _.get(selectedLoans, 'loans').forEach((loan) => {
        auctionMessagesType.push(_.get(loan, 'auctionAction.message', ''));
        this.enableDigitalPartRelease.push(loan.enableDigitalPartRelease);
      });
      auctionMessagesType = auctionMessagesType.filter(Boolean);
      auctionMessagesType = [...new Set(auctionMessagesType)];
      if (this.enableDigitalPartRelease.includes(false)) {
        auctionMessagesType.push(this.identifierType);
      }
      if (auctionMessagesType.length === 1 || this.enableDigitalPartRelease.includes(false)) {
        this.identifierMessage = auctionMessagesType.join(',');
        this.getStaticMessages(this.identifierMessage);
      }
    },
    hidePaymentOptionsComponent() {
      this.showDiscrepancyInfo = false;
      store.dispatch('jewels/closeInfoDetails', {});
    },
    moveToCloseLoan() {
      this.hidePaymentOptionsComponent();
      const loanId = [];
      this.selectedLoansJewels.loans.forEach((loan) => {
        if (loan.isLoanClosure) {
          loanId.push(+loan.loanId);
        }
      });
      const tempObj = {
        type: 'closeLoan',
        coreId: loanId,
      };
      store.dispatch('loans/setPaymentOption', 'closeLoan');
      setLoanClosure(tempObj);
    },
  },
  activated() {
    this.checkPaymentOption();
    this.quickLinksPartRelease = this.quickLinkSelected === 'part-release';
  },
};
</script>
<style lang='scss'>
  @import '@/scss/payments-summary/payments-summary.scss';
  .header {
    background: $white-color;
    border-bottom: 1px solid #ECEDEF;
  }
  .select-release {
    color: $theme-color;
    border: 1px solid;
    border-radius: 20px;
    &:hover {
      color: $theme-color
    }
  }
.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
}
.divider-horizontal {
  display: block;
  height: 1px;
  width: 100%;
  margin: 24px 0;
  background-color: #727272;
  .divider-text {
    position: absolute;
    font-weight: 500;
    font-size: 14px;
    padding: 0 20px 0 0;
    background-color: #fafafa;
    display: flex;
    align-items: center;
    left: 0;
    transform: translateY(-50%);
  }
}
.view-more-loans {
  background: transparent;
  border-radius: 25px;
  border: 1px solid #d9d9d9;
  margin-left: 32px;
  padding: 4px;
  transform: rotate(180deg);
  height: 25px;
  width: 25px;
  &.collapsed {
    transform: rotate(0deg);
  }
}
</style>
