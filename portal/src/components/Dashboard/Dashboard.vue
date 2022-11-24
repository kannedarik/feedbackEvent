<!-- eslint-disable max-len -->
<template>
  <div class="position-relative block" @click="() => {showQuickLinks = false}"
  :class="`${getGoldTrackerClass()}`">
  <div class="payment-options-wrapper-back-drop"
    v-if="showPaymentOptions" @click="hidePaymentOptionsComponent">
  </div>
    <!-- <div class="leadform z-index-999" v-if="onBoarding"></div> -->
  <div class="d-flex justify-content-center">
    <!-- Federal Bank Loans Message/Info Wrapper -->
    <div class="messaging-wraper white-color flex itmes-center"
      v-if="showHideFederalBankMessage">
      <img src="@/assets/icons/new_icon.svg" alt="new_icon" />
      <p class="text-justify">
        {{ federalBankCallUsBack && federalBankCallUsBack.msg }}
      </p>
    </div>
    <!-- Federal Bank Loans Message/Info Wrapper -->
    <!-- Loans Listing Wrapper -->
    <div class="loans-list block">
      <div class="header-main sm:px-3 md:px-8 py-3" v-if="allLoans.length">
        <h2 class="font-semibold text-sm">
          {{ getTitleText }}
        </h2>
      </div>
      <h3 class="medium-font-weight sm:px-3 md:px-8 py-4" v-else>
        No Active Loans
      </h3>
      <!-- Excess Funding header section -->
      <ExcessFundingAlert v-if="excessFundingArray.length !== 0" />
      <!-- Excess Funding header section ends -->
      <div class="renewal-status-card-container p-3 sm:mb-3 md:mb-4
        flex justify-between cursor-pointer"
        :class="{'bgnd-yellow' : repledgePendingLoans.renewalCount === 0}"
        v-if="repledgePendingLoans.orders && repledgePendingLoans.orders.length"
        @click="openStatusCardPopup()">
        <span class="flex items-center">
          <img src="@/assets/statusIcons/alert.png" alt="alert" class="mr-3" />
          <span v-if="repledgePendingLoans.renewalCount">
            Pending Actions: Attention Required
          </span>
          <span v-else>Pending Actions: View</span>
        </span>
        <img src="@/assets/statusIcons/ic_expand_less.svg" alt="expand icon"/>
      </div>
      <div class="sm:px-3 md:px-8 sm:mb-3 md:mb-4 video" v-if="hasShowMissPayingInterestVideo">
        <VideoBanner v-if="assets.length" :assets="getAssets" :eventDetails="{}" />
      </div>
      <div v-if="allLoans.length">
        <div class="sm:px-3 md:px-8"
          :class="{
            'mb-16' : quickLinkSelected !== 'all',
            'mb-14' : selectedLoans.length && quickLinkSelected === 'all',
          }">
          <div v-for="(groupedLoan, groupIndex) in getFinalLoans"
            :key="groupIndex"
            class="w-100 mb-3">
            <div class="branch-closed" v-if="groupedLoan.hasBranchWorking">
              {{groupedLoan.reason}}
            </div>
            <LoanGroupCard
              :groupLoans="groupedLoan.loans"
              :recoveryMessage="_.get(groupedLoan, 'loans[0].loans[0].recoverytext')"
              :selectedLoansFromGroup="selectedLoans"
              :rcplRepledgeMessage="rcplRepledgeMessage"
              :lendersConfig="lendersConfig"
              :hideLoanSelection="hideLoanSelection"
              :paymentOption="paymentOption"
              :staticMessage="staticMessage"
              :repledgeMessage="repledgeMessage"
              @loanselection="onLoansSelectionFromLoanGroup($event, groupIndex)"
              @showloandetail="showLoanDetails($event)"
            />
            <div class="mb-2" v-if="checkSchemeType(groupedLoan.loans)">
              <MessagesBox
                :message="''"
                :hasShowImpinfoIcon="true"
                :hasShowFullWidth="true"
                :staticMessages="getIdentifierStaticMessages(staticMessages, identifierType).content"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Continue to pay (proceed to payment options screen) Component Wrapper -->
  <transition name="sticky-footer-wraper">
    <div class="sticky-footer-wraper"
      :class="`${getGoldTrackerClass()}`"
      v-if="selectedLoans.length > 0 && quickLinkSelected === 'all'">
      <Container class="mb-0">
        <div class="py-2 px-4 md:p-7 flex justify-between md:justify-end">
          <button class="btn btn-primary-rupeek w-full md:w-1/2"
            :disabled="selectedLoans.length < 1"
            @click="showPaymentOptionsComponent">
            Continue
          </button>
        </div>
      </Container>
    </div>
  </transition>
  <transition>
    <div class="sticky-footer-wraper" v-if="quickLinkSelected !== 'all'">
      <Container>
        <div class="py-2 px-4 md:p-7 text-right">
          <button class="btn btn-primary-rupeek" @click="showPaymentSummaryComponent()"
            :class="{'disabled-btn': selectedLoans.length < 1}">
            {{getQuickLinkBtn}}
          </button>
        </div>
      </Container>
    </div>
    </transition>
  <div class="sticky-footer-wraper">
    <goldDeliveryStatus v-if="goldDeliveryTracker && quickLinkSelected === 'all'"
      :releaseLoans="goldReleasesList"
      :lastUpdateTime="lastUpdatedDate"
      :deliveryStatusMessage="_.get(goldDeliveryMessages[0], 'content.message')"
      v-on:showStatusCard="openStatusCardPopup()"
      v-on:getDeliveryStatusMessage="getStaticMessages($event, goldDeliveryMessage=true)"
      class="p-0"
    />
  </div>
  <!-- Payment Options Component Wrapper -->
  <PaymentOptions
    :visible="showPaymentOptions"
    :lenderConfigs="_.get(renderPaymentOptionBasedLender, 'config.actions', [])"
    :selectedLoansList="selectedLoans"
    :populateAmounts="populateAmounts"
    :isDisablingRenewalCovid="isDisablingRenewalCovid"
    :paymentOption="paymentOption"
    :isEligibleForRenewal="isEligibleForRenewal"
    :showPaymentSummaryComponent="showPaymentSummaryComponent"
    :checkDiscrepancyClosure="checkDiscrepancyClosure"
    :partReleaseFeatureFlag="partReleaseFeatureFlag"
    :hideDisablePartReleaseInfo="hideDisablePartReleaseInfo"
    :discrepancyMessage="discrepancyMessage"
    :disablePartRelease="disablePartRelease"
    :disableRepledge="disableRepledge"
    :disablePartPayment="disablePartPayment"
    :checkDiscrepancyPartPayment="checkDiscrepancyPartPayment"
    :repledgeMessage="checkRepledgeMessage"
    :partReleaseMessage="partReleaseMessage"
    :partPaymentsMessage="partPaymentsMessage"
    @change="updatePaymentOption"
    @hide-payments-options="hidePaymentOptionsComponent"
    :closeInfoDetails="closeInfoDetails"
    :closureDiscrepancyMessage="closureBlockedDiscrepancyMessage"
    @moveToCloseLoan="moveToCloseLoan"
  />
  <!-- Loan Details Popup -->
  <LoanDetailsPopUp
    v-if="schemeSelectionPopup"
    :schemeComparison="schemeComparison"
    @hidden="schemeSelectionPopup = false"
    @ok="showLoanSelectionModal = true, schemeSelectionPopup = false"
  />
  <!--
    If we open the modal from the summary screen, then we are viewing a single loan.
    Otherwise, we view all the selected loans in the modal.
  -->
  <LoanAmountSelectionModal
    v-if="showLoanSelectionModal"
    @hidden="showLoanSelectionModal = false"
    @completed="onLoanSelectionModalCompleted"
    :viewingSummaryScreen="showHidePaymentSummary"
  />
  <onBoardingScreen
    :onBoarding="onBoarding"
    @closeOnboarding="closeOnboarding"
  ></onBoardingScreen>
  </div>
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
import { mapGetters, mapActions } from 'vuex';
import { getCustomerLoans, getDiscrepancyMessage } from '@/api/customer.api';
import {
  getrenewalScheme,
  disablingRenewalCovidAPI,
  renewalEligibilityAPI,
} from '@/api/repledge.api';
import { fetchPartReleaseOrdersAPI, getJewelsListAPI } from '@/api/partRelease.api';
import { getLenderConfiguration } from '@/api/lenderConfiguration.api';
import getexcessFundingConfing from '@/api/excessFunding.api';
import LoanGroupCard from '@/components/LoanGroupCard/LoanGroupCard.vue';
import MessagesBox from '@/components/InfoMessagesBoxs/MessagesBox.vue';
import events from '@/utils/clevertap/eventconstants';
import { sendEvent, mapCleverTapProperty } from '@/utils/clevertap/EventTracker';
import errorMessages from '@/utils/errorMessages';
import VideoBanner from '@/components/ReleaseTracker/videoBanner.vue';
import Container from '@/components/CommonComponents/Container.vue';
import { secureComponent } from '@/utils/loan';
import LoanDetailsPopUp from '@/components/LoanDetailsPopUp/LoanDetailsPopUp.vue';
import LoanAmountSelectionModal from '@/components/LoanAmountSelection/LoanAmountSelectionModal.vue';
import PaymentOptions from '@/components/PaymentOptionsPopup/PaymentOptionsPopup.vue';
import OnBoardingScreen from '@/views/OnBoardingScreen/OnBoardingScreen.vue';
import goldDeliveryStatus from '@/components/goldDeliveryStatus/goldDeliveryStatus.vue';
import ExcessFundingAlert from '@/components/CommonComponents/ExcessFundingAlert.vue';
import mixinComponent from '@/mixins/mixinComponent';
import assetsFromFirebase from '@/mixins/assetsFromFirebase';
import { formatRupeeAmount } from '@/utils/string';
import { getOrnamentList } from '@/utils/partRelease';
import setJewelsList from '@/utils/setJewelsList';

export default {
  name: 'listCustomerLoans',
  data() {
    return {
      // array to store all the loans for a logined customer
      loansArray: [],
      // array to store the lender configuration
      lenderConfigurationArray: [],
      // flag to show/hide the loan details component
      showHideLoanDetails: false,
      // variable to store the temporary loan object to pass to a different component
      tempLoanDetailsObj: null,
      // variable to store the payment options like pay interest,
      // part payment, close loan and re-pledge
      paymentOption: null,
      //  flag to disable.enable the part payment button
      disablePartPayment: true,
      // flag to disable/enable the re -pledge button
      disableRepledge: true,
      // flag to disable/enable the part release button
      disablePartRelease: true,
      // flag to show/hide the payment options
      showPaymentOptions: false,
      // configuration to render the payment options
      reInitializePaymentOptions: {
        name: 'rupeek',
        config: {
          actions: [
            {
              type: 'interest',
              order: 2,
              display: true,
            },
            {
              type: 'close_loan',
              order: 3,
              display: true,
            },
            {
              type: 'repledge',
              order: 1,
              display: true,
              showTopupLabel: false,
            },
            {
              type: 'part-release',
              order: 4,
              display: true,
            },
            {
              type: 'part_payment',
              order: 5,
              display: true,
            },
          ],
        },
      },
      renderPaymentOptionBasedLender: {},
      // variable to store the federal bank call us back number
      federalBankCallUsBack: null,
      // flag to show/hide the federal bank message
      showHideFederalBankMessage: false,
      // flag to show/hide the payment summary
      showHidePaymentSummary: false,
      // for storing the loans Object
      loanDetailsObj: {},
      showHidePaymentOptions: false,
      // for storing the selected loans in top up flow
      selectedTopUpLoans: [],
      // Array is storing the excess funding data
      excessFundingArray: [],
      // flag for showing the status card
      showStatusCard: false,
      // for storing repledged loans
      repledgePendingLoans: {},
      // scheme selection data
      selectedLoansMappedArray: { selectedloans: [], totalloans: [] },
      // scheme selection popup flag
      schemeSelectionPopup: false,
      schemeComparison: {},
      selectedSchemeData: {},
      onBoarding: false,
      repledgeMessage: '',
      rcplRepledgeMessage: '',
      selectedOption: '',
      // flag for takeover and excess funding
      hideLoanSelection: true,
      isDisablingRenewalCovid: true,
      disablingRenewalCovidMessage: '',
      showLoanSelectionModal: false,
      isEligibleForRenewal: true,
      renewalEligibilityMessage: '',
      // variable to store coreIds
      coreIds: '',
      // flag for show info icon in part release payment option
      hideDisablePartReleaseInfo: false,
      partReleaseMessage: '',
      auctionMessagesType: [],
      goldDeliveryTracker: false,
      goldReleasesList: [],
      showChangeSchemeModal: false,
      hasShowMissPayingInterestVideo: false,
      partPaymentsMessage: '',
      lastUpdatedDate: null,
      identifierType: 'loan-details-mip-details',
      closureDiscrepancyInfo: 'closure-blocked-discrepancy-message',
      closeInfoDetails: {},
    };
  },
  components: {
    Container,
    LoanGroupCard,
    OnBoardingScreen,
    VideoBanner,
    LoanDetailsPopUp,
    LoanAmountSelectionModal,
    PaymentOptions,
    goldDeliveryStatus,
    ExcessFundingAlert,
    MessagesBox,
  },
  computed: {
    ...mapGetters({
      userObj: 'auth/loggedInUser',
      selectedLoans: 'loans/selectedLoans',
      populateAmounts: 'loans/populateAmounts',
      allLoans: 'loans/allLoans',
      isLoanIDEligibleForLE: 'renewal/isLoanIDEligibleForLE',
      isMoreRenewalAvailable: 'renewal/isMoreRenewalAvailable',
      currentLPLoanID: 'renewal/currentLPLoanID',
      lendersConfig: 'loans/lendersConfig',
      discrepancyMessage: 'loans/discrepancyMessage',
      quickLinkSelected: 'quickLinks/quickLinkSelected',
      totalLoans: 'loans/totalLoans',
      partReleaseFeatureFlag: 'loans/partReleaseFeatureFlag',
      maxPartPaymentAmount: 'loans/maxPartPaymentAmount',
      closureBlockedDiscrepancyMessage: 'loans/closureBlockedDiscrepancyMessage',
    }),
    _() {
      return _;
    },
    events() {
      return events;
    },
    checkDiscrepancy() {
      return this.selectedLoans.length > 0 && !this.selectedLoansDiscrepancy.includes(false);
    },
    selectedLoansDiscrepancy() {
      const dSelectedLoans = [];
      this.selectedLoans.forEach((loan) => {
        loan.loans.forEach((loanData) => {
          dSelectedLoans.push(loanData.loanHasDiscrepancy);
        });
      });
      return dSelectedLoans;
    },
    checkDiscrepancyClosure() {
      return this.selectedLoansDiscrepancy.every((key) => key);
    },
    checkDiscrepancyPartPayment() {
      const dMessage = _.get(this.discrepancyMessage, 'part_payment.showFlag', false);
      return dMessage && this.checkDiscrepancy;
    },
    getTitleText() {
      let title = 'Select loans you want to pay for';
      if (this.quickLinkSelected === 'interest') {
        title = 'Choose a Loan to Pay Interest';
      } else if (this.quickLinkSelected === 'part_payment') {
        title = 'Choose a Loan to Part payment';
      } else if (this.quickLinkSelected === 'repledge') {
        title = 'Choose a Loan to Renewal';
      } else if (this.quickLinkSelected === 'part-release') {
        title = 'Choose a Loan to Part Release';
      } else if (this.quickLinkSelected === 'close_loan') {
        title = 'Choose a Loan to Close';
      }
      return title;
    },
    getQuickLinkBtn() {
      let buttonText = 'Make Payment';
      if (this.quickLinkSelected === 'interest') {
        buttonText = `Pay Interest ${this.selectedLoans.length
          ? formatRupeeAmount(this.populateAmounts.totalInterestAmount
            ? this.populateAmounts.totalInterestAmount : 100) : ''}`;
      } else if (this.quickLinkSelected === 'part_payment') {
        buttonText = `Make Payment ${this.selectedLoans.length
          ? this.getPayAmount : ''}`;
      } else if (this.quickLinkSelected === 'repledge') {
        buttonText = 'Renew Loan';
      } else if (this.quickLinkSelected === 'part-release') {
        buttonText = 'Make Payment';
      } else if (this.quickLinkSelected === 'close_loan') {
        buttonText = `Close Loan ${this.selectedLoans.length
          ? formatRupeeAmount(this.populateAmounts.totalClosingAmount) : ''}`;
      }
      return buttonText;
    },
    getPayAmount() {
      return `${formatRupeeAmount(this.populateAmounts.totalInterestAmount >= 100
        ? this.populateAmounts.totalInterestAmount : 100)}
          - ${formatRupeeAmount(this.populateAmounts.partPaymentClosingAmount)}`;
    },
    checkRepledgeMessage() {
      let message = this.repledgeMessage;
      if (!this.isEligibleForRenewal) {
        message = this.renewalEligibilityMessage;
      } else if (!this.isDisablingRenewalCovid) {
        message = this.disablingRenewalCovidMessage;
      }
      return message;
    },
    getFinalLoans() {
      return this.hideLoanSelection ? this.totalLoans : this.allLoans;
    },
  },
  watch: {
    paymentOption(value) {
      if (value) {
        this.setPaymentOption(value);
      }
    },
    showHideLoanDetails(value) {
      if (value && this.tempLoanDetailsObj.length) {
        this.$router.push({
          name: 'LoanDetails',
          params: {
            loansArray: this.tempLoanDetailsObj,
            lendersConfig: this.lendersConfig,
          },
        });
      }
    },
    selectedLoans(value) {
      this.populateLoanAmount(value);
      // function call to enable/disable the re-pledge if thr is a negative pending amount
      this.enableDisableRePledge();
      // function to enable/disable the part release radio
      // button when user selects same lender different branches
      this.enableDisablePartRelease();
      // function call to disable/enable the part payment
      this.enableDisablePartPayment();
      if (!value) {
        this.renderPaymentOptionBasedLender = this.reInitializePaymentOptions;
      }
    },
    quickLinkSelected(value) {
      if (value === 'interest') {
        this.paymentOption = 'interest';
      } else if (value === 'part_payment') {
        this.paymentOption = 'partPayment';
      } else if (value === 'repledge') {
        this.paymentOption = 'rePledge';
      } else if (value === 'part-release') {
        this.paymentOption = 'partialRelease';
      } else if (value === 'close_loan') {
        this.paymentOption = 'closeLoan';
      }
      if (value !== 'part-release') {
        this.getLoans(value !== 'all' && value);
      } else {
        this.getJewelsInfo('', false);
      }
    },
    hasShowMissPayingInterestVideo(value) {
      if (value) {
        this.getAssetsFromFirebase('paying_interest_on_time');
      }
    },
    staticMessages(value) {
      this.setClosureBlockedDiscrepancyMessage(
        this.getIdentifierStaticMessages(value, this.closureDiscrepancyInfo).content,
      );
    },
  },
  mixins: [mixinComponent, assetsFromFirebase],
  methods: {
    ...mapActions({
      setLendersConfig: 'loans/setLendersConfig',
      populateLoanAmount: 'loans/populateLoanAmount',
      setPaymentOption: 'loans/setPaymentOption',
      setDiscrepancyMessage: 'loans/setDiscrepancyMessage',
      setLoans: 'loans/setLoans',
      selectLoans: 'loans/selectLoans',
      setSelectedLoans: 'loans/setSelectedLoans',
      checkLoansForMultipleLenders: 'loans/checkLoansForMultipleLenders',
      updateDisabledContinueBtn: 'loans/updateDisabledContinueBtn',
      resetSelectedLoans: 'loans/resetSelectedLoans',
      updatedALLLoans: 'loans/updatedALLLoans',
      setHideLoanSelection: 'loans/setHideLoanSelection',
      getJewelsDetails: 'jewels/getJewelsDetails',
      setCurrentLPLoanID: 'renewal/setCurrentLPLoanID',
      loanAmountSelectionModalOpened: 'renewal/loanAmountSelectionModalOpened',
      confirmModalSelection: 'renewal/confirmModalSelection',
      initialiseSelectionState: 'renewal/initialiseSelectionState',
      repledgePendingLoansOrders: 'loans/repledgePendingLoansOrders',
      getPartReleaseFeatureFlag: 'loans/getPartReleaseFeatureFlag',
      setQuickLinkSelected: 'quickLinks/setQuickLinkSelected',
      setQuickLinkDispaly: 'quickLinks/setQuickLinkDispaly',
      resetState: 'jewels/resetState',
      setClosureBlockedDiscrepancyMessage: 'loans/setClosureBlockedDiscrepancyMessage',
    }),
    checkSchemeType(data) {
      let hasMIPLoan = false;
      data.forEach((loansData) => {
        hasMIPLoan = loansData.loans.some((even) => _.get(even, 'schemedata.type') === 'monthly');
      });
      return hasMIPLoan;
    },
    moment: (date) => moment(date),
    getGoldTrackerClass() {
      let className = '';
      if (this.goldDeliveryTracker && this.quickLinkSelected === 'all') {
        className = this.goldReleasesList.length > 1 ? 'show-more-loans-release' : 'show-gold-Tracker';
      }
      return className;
    },
    trackSchemeSelectionEvent(context, event, properties) {
      sendEvent(context, event, properties);
    },
    trackLoanSelectionEvent(selected, group) {
      if (selected) {
        const properties = {
          [events.EVENT_NAME]: group
            ? events.PAYMENT_LOAN_GROUP_SELECTED : events.PAYMENT_LOAN_SELECTED,
        };
        sendEvent(events.screen.DASHBOARD, events.category.PAYMENT, properties);
      }
    },
    // api to fetch part release/renewal pending loans
    fetchRenewalPendingLoans() {
      const tempObj = {
        process: 'PART_RELEASE,RELEASE,RENEWAL',
        lightWeight: true,
        pageSize: 1000,
        orderStatus: 'IN_PROGRESS',
      };
      fetchPartReleaseOrdersAPI(tempObj)
        .then((response) => {
          this.lastUpdatedDate = moment().format('hh:mm A');
          this.repledgePendingLoans = response.data;
          this.goldReleasesList = this.repledgePendingLoans.orders.filter((order) => order.type === 'release');
          this.goldDeliveryTracker = this.goldReleasesList.length !== 0;
        })
        .catch((error) => {
          this.$noty.error(errorMessages(error, this.$lang.messages.noresponse));
        });
      this.getDiscrepancyMessage();
    },
    getDiscrepancyMessage() {
      getDiscrepancyMessage()
        .then((response) => {
          this.setDiscrepancyMessage(response.data.message);
        })
        .catch((error) => {
          this.$noty.error(error.message);
        });
      this.auctionMessagesType = [...new Set(this.auctionMessagesType)];
      if (this.loansArray.length && !(this.auctionMessagesType.length === 1 && this.auctionMessagesType.includes('none'))) {
        this.getStaticMessages(this.auctionMessagesType.join(','));
      }
    },
    // api call to get all the loans
    getLoans(filter) {
      const coreIds = [];
      getCustomerLoans(filter)
        .then((response) => {
          if (response.data.code === 200) {
            const InterStage = [];
            this.loanDetailsObj.hasPending = response.data.hasPending;
            this.loanDetailsObj.pendingMesg = response.data.pendingMesg;
            this.rcplRepledgeMessage = response.data.repledgeMessage;
            const lendersArray = [];
            const getFederalbankLoanDetails = [];
            this.loansArray = response.data.mappedloans.map(
              (groupedLoans, index) => {
                groupedLoans.loans.map((key) => key.map((key1) => {
                  const loan = key1;
                  loan.uloanId = this.getuloanId(key);
                  return loan;
                }));
                const groupedLoansArray = groupedLoans;
                if (groupedLoansArray.type === 'N:1') {
                  groupedLoansArray.loans = groupedLoans.loans[0].map((key) => [
                    key,
                  ]);
                }
                const modifiedArray = groupedLoansArray;
                modifiedArray.loans = groupedLoansArray.loans.map(
                  (groupedLoan) => {
                    const loanObj = {};
                    loanObj.loans = groupedLoan.map((loan) => {
                      coreIds.push(loan.coreid);
                      lendersArray.push(loan.display);
                      const loanData = loan;
                      loanData.productType = groupedLoansArray.productType;
                      InterStage.push(loanData.stage);
                      loanData.replegeAmtUpdated = false;
                      loanData.active = true;
                      loanData.groupId = index;
                      loanData.lenders = [];
                      loanData.lenders.push(loanData.lenderid);
                      loanData.lenders = [...loanData.lenders, ..._.get(loanData, 'clmSupportedLender', [])];
                      loanData.lenders = [...new Set(loanData.lenders)];
                      loanData.totalLoanamount = groupedLoan.reduce((amount, item) => amount
                        + item.loanamount, 0);
                      loanData.loanHasDiscrepancy = this.hasDiscrepancy(groupedLoan);
                      const release = loan.closures && loan.closures.release;
                      loanData.closingamount = release ? loan.closures.release : loan.closingamount;
                      const interest = loan.closures && loan.closures.interest;
                      loanData.interest = interest ? loan.closures.interest : loan.interest;
                      loanData.lenderName = this.lendersConfig[loanData.lenderid].name;
                      this.auctionMessagesType.push(_.get(loanData, 'auctionAction.message') ? _.get(loanData, 'auctionAction.message') : 'none');
                      loanObj.bookedDate = groupedLoan[0].loanstartedon;
                      loanObj.isSelected = false;
                      loanObj.isDisabled = false;
                      if (loanData.display) {
                        getFederalbankLoanDetails.push(loan);
                      }
                      return loanData;
                    });
                    return loanObj;
                  },
                );
                return modifiedArray;
              },
            );
            this.federalBankCallUsBack = getFederalbankLoanDetails.length
              && getFederalbankLoanDetails[0];
            if (lendersArray.includes(false)) {
              this.showHideFederalBankMessage = true;
            }
            this.hasShowMissPayingInterestVideo = InterStage.includes('nextinterestdue')
              || InterStage.includes('interestoverdue');
            // excess funding api call
            this.excessFundingApi();
            this.disablingCovid(coreIds.toString());
            this.setLoans(JSON.parse(JSON.stringify(this.loansArray)));
            this.updatedALLLoans(this.loansArray);
          }
          this.fetchRenewalPendingLoans();
          if (Object.keys(this.partReleaseFeatureFlag).length === 1) {
            this.getPartReleaseFeatureFlag();
          }
        })
        .catch((error) => {
          this.$noty.error(errorMessages(error));
        });
    },
    hasDiscrepancy(loans) {
      const tempArray = [];
      loans.forEach((loan) => {
        tempArray.push(_.get(loan, 'discrepancy.prioritySlab') === 'SLAB2' && !_.get(loan, 'discrepancy.discrepancyResolvedDate'));
      });
      return tempArray.includes(true);
    },
    getuloanId(loans) {
      let uloanId = '';
      loans.map((key) => {
        if (!key.netweight) {
          uloanId = key.loanid;
        }
        return true;
      });
      return uloanId;
    },
    // function to get the lender Configuration
    lenderConfiguration() {
      getLenderConfiguration()
        .then((response) => {
          if (response.status === 200) {
            const configResponse = response.data.response;
            this.lenderConfigurationArray = configResponse.map((lenderConfig) => {
              const mergedLenderConfig = { ...lenderConfig };
              const actions = [
                ...lenderConfig.config.primaryactions,
                ...lenderConfig.config.secondaryactions,
              ];
              mergedLenderConfig.config = { actions };
              return mergedLenderConfig;
            });
            this.getLoans();
            this.onBoarding = !(localStorage.getItem('onboardingVisible')
              ? localStorage.getItem('onboardingVisible') : false);
          }
        })
        .catch((error) => {
          this.$noty.error(errorMessages(error));
        });
    },
    onLoansSelectionFromLoanGroup(payload, groupIndex) {
      const { areAllChecked, group, index } = payload;
      if (group) {
        this.allLoans[groupIndex].loans.forEach((item, groupLoanIndex) => {
          this.populateLoanDetails(item.loans, { groupIndex, groupLoanIndex });
        });
        this.trackLoanSelectionEvent(areAllChecked, group);
      } else {
        this.populateLoanDetails(
          this.allLoans[groupIndex].loans[index].loans,
          { groupIndex, groupLoanIndex: index },
        );
        this.trackLoanSelectionEvent(this.allLoans[groupIndex].loans[index].isSelected);
      }
    },
    // function to populate the closing amount and enable/disable the part payment button
    populateLoanDetails(loanObj, selectLoanIndexes) {
      // const loan = loanObj.filter(key => key.netweight);
      this.$nextTick(() => {
        // function call to reset the selected payment options
        this.resetPaymentOptions();
        // function to show/hide the call us back section instead of payment options
        this.showHideLenderPaymentOptions(loanObj[0]);
        this.selectLoans(selectLoanIndexes);
        this.setSelectedLoans();
        this.initialiseSelectionState(false);
        // function call to check multiple lenders
        this.checkMultipleLenders(loanObj);
      });
    },
    // Function to reset the payment options while the end user de-selects all the loans.
    resetPaymentOptions() {
      if (this.selectedLoans.length === 0 && this.quickLinkSelected === 'all') {
        this.paymentOption = null;
      } else if (
        this.paymentOption === 'partPayment'
        && this.selectedLoans.length > 1
        && this.quickLinkSelected === 'all'
      ) {
        this.paymentOption = null;
      } else if (
        this.paymentOption === 'rePledge'
        && this.selectedLoans.length > 1
        && this.quickLinkSelected === 'all'
      ) {
        /* eslint-disable */
        const getNegativeClsingAmountLoans = this.selectedLoans.filter(
          loan => {
            return loan.balanceamount < 100;
          }
        );
        /* eslint-disable */
        if (getNegativeClsingAmountLoans.length >= 1) {
          this.paymentOption = null;
        }
      }
    },
    // function to check unique lenders and disable the loans with other vendors
    checkMultipleLenders(loanObj) {
      const lender = [];
      loanObj.map(key => {
        lender.push(key.lenderid);
      });
      this.orderShowHidePaymentOptions(lender.length && lender[0]);
      this.checkLoansForMultipleLenders(lender);
    },
    // function to order and show/hide the payment options
    orderShowHidePaymentOptions(lender) {
      const tempLenderConfiguration = this.lenderConfigurationArray.filter(
        config => config.name === lender
      );
      /* eslint-disable */
      this.renderPaymentOptionBasedLender = tempLenderConfiguration[0];
    },
    // function to render the payment options order based on configuration
    renderPaymentOptionOrder(configurationArray, type) {
      const getOrderArray = configurationArray.filter(config => {
        if (config.type === type && config.display === true) {
          return config.order;
        }
      });
      return getOrderArray[0].order;
    },
    // function to render the show topup label in repledge payment options
    showTopupLabel(configurationArray) {
      const getOrderArray = configurationArray.filter(config => {
        if (config.type === 'repledge' && config.display) {
          return config.showTopupLabel;
        }
      });
      return getOrderArray[0];
    },
    // function to render the payment options based on configuration
    renderPaymentOption(configurationArray, type) {
      const tempArray = configurationArray.filter(config => {
        if (config.type === type && config.display === true) {
          return config;
        }
      });
      if (tempArray.length === 1) {
        return true;
      } else {
        return false;
      }
    },
    // funtion to show/hide the payments options for federal bank
    showHideLenderPaymentOptions(loanObj) {
      if (loanObj.display === false && this.selectedLoans.length > 0) {
        this.showHidePaymentOptions = false;
        this.federalBankCallUsBack = loanObj;
      } else {
        this.showHidePaymentOptions = true;
      }
    },
    // function to enable/disable the part release radio button when user selects same lender different branches
    enableDisablePartRelease() {
      const branchIds = [];
      let monthlyInterest = [];
      let clmLoan = [];
      this.selectedLoans.map(loanGroup => {
        loanGroup.loans.map(loan => {
          monthlyInterest.push(_.get(loan, 'schemedata.type', ''));
          clmLoan.push(_.get(loan, 'productType', ''));
          loanGroup.isSelected && loan.netweight > 0 && branchIds.push(loan.branch.id);
          return true;
        });
        return true;
      });
      this.hideDisablePartReleaseInfo = (branchIds.length === 0);
      monthlyInterest = [... new Set(monthlyInterest)];
      clmLoan = [... new Set(clmLoan)];
      this.partReleaseMessage = monthlyInterest.includes('monthly') || clmLoan.includes('CLM')
        ? 'Renewal and partial-release options are not available for this loan' : 'Please select loans from same branches for part release';
      this.disablePartRelease = !([...new Set(branchIds)].length === 1)
        || (monthlyInterest.includes('monthly') && monthlyInterest.length === 1)
        || (clmLoan.includes('CLM') && clmLoan.length === 1);
    },
    // function to enable/disable the part payment radio button when user selects multiple loans
    enableDisablePartPayment() {
      if (
        this.selectedLoans.length >= 2 ||
        this.selectedLoans.length === 0
      ) {
        this.disablePartPayment = true;
      } else if (
        this.selectedLoans.length === 1 &&
        this.populateAmounts.partPaymentClosingAmount < 100
      ) {
        this.disablePartPayment = true;
      } else {
        this.disablePartPayment = false;
      }
      this.partPaymentsMessage = this.populateAmounts.partPaymentClosingAmount < 100
        ? `Part payment is not allowed for amount less than ${this.maxPartPaymentAmount.maxPartPaymentAmountRange}. Please close the loan instead.`
        : 'You can not make part payment for multiple loans in a single payment.';
    },
    // function to populate inerest, part interest, close loan, repledge amount
    populateClosingAmount() {
      this.populateLoanAmount(this.selectedLoans);
    },
    /* eslint-disable */
    // function call to enable/disable the repledge amount
    enableDisableRePledge() {
      this.repledgeMessage = '';
      let repledgeFlag = false;
      let digitalFlowFlag = false;
      let rupeekYokSecuresLoans = 0;
      const groupIds = [];
      let monthlyInterest = [];
      let clmLoan = [];
      this.selectedLoans.map(loanGroup => {
        loanGroup.loans.map(loan => {
          loanGroup.isSelected && groupIds.push(loan.groupId);
          monthlyInterest.push(_.get(loan, 'schemedata.type', ''));
          clmLoan.push(_.get(loan, 'productType', ''));
          if((loan.lenderid === 'rupeek' || loan.lenderid === 'yogakshemam') && loan.netweight>0 && !digitalFlowFlag) {
            digitalFlowFlag = false;
          } else {
            digitalFlowFlag = true;
          }
          if (loan.netweight>0 && !(loan.lenderid === 'rupeek' || loan.lenderid === 'yogakshemam')) {
            repledgeFlag = loan.allowRepledgeV2;
          }
          if ((loan.lenderid === 'rupeek' || loan.lenderid === 'yogakshemam') && loan.netweight>0) {
            ++rupeekYokSecuresLoans
          }
          return true;
        });
        return true;
      });
      monthlyInterest = [... new Set(monthlyInterest)];
      clmLoan = [... new Set(clmLoan)];
      if ((([...new Set(groupIds)].length === 1 && repledgeFlag)
        || (this.selectedLoans.length === rupeekYokSecuresLoans))
        && !monthlyInterest.includes('monthly') && !clmLoan.includes('CLM')) {
        this.disableRepledge = false;
      } else if (this.quickLinkSelected === 'all') {
        this.disableRepledge = true;
        this.paymentOption = null;
      }
      if (digitalFlowFlag) {
        this.setRepledgeMessage([...new Set(groupIds)].length !== 1, monthlyInterest, clmLoan);
      } else {
        this.setRepledgeMessage(this.selectedLoans.length > 1, monthlyInterest, clmLoan);
      }
    },
    setRepledgeMessage(otherGroupingSelected, monthlyInterest, clmLoan) {
      if (otherGroupingSelected) {
        this.repledgeMessage = 'Please select loans belonging to the same grouping';
      } else if (monthlyInterest.includes('monthly') || clmLoan.includes('CLM')) {
        this.repledgeMessage = 'Renewal and partial-release options are not available for this loan';
      } else {
        this.repledgeMessage =
          'Selected loan/lender does not support online renewal. Please contact customer support for further assistance';
      }
    },
    // function to show the loan details in a different component
    showLoanDetails(loanObj) {
      this.showHideLoanDetails = false;
      this.disablingRenewalCovid(this.getCoreIds(loanObj), loanObj, { showMore: true });
    },
    // api call to check disabling renewal option for the bank not working because of Covid
    disablingRenewalCovid(coreIds, loans, checkingAction) {
      this.tempLoanDetailsObj = loans;
      disablingRenewalCovidAPI(coreIds)
        .then((response) => {
          if (checkingAction.showMore) {
            this.tempLoanDetailsObj = loans.map((loan) => {
              const loanData = loan;
              response.data.data.loans.map((data) => {
                if (+data.coreid === +loanData.coreid) {
                  loanData.branch.operational = data.branch.operational;
                  loanData.branch.reason = data.branch.reason;
                }
                return true;
              });
              return loanData;
            });
          } else {
            // function call to check renewal covid message
            this.checkRenewalCovidMessage(response.data.data.actions);
          }
          if (checkingAction.showMore) {
            const checkNetWeight = loans.map(loan => loan.netweight > 0);
            checkNetWeight.includes(true) ? this.getJewelsInfo(coreIds, checkingAction) : this.showHideLoanDetails = !this.showHideLoanDetails;
          }
        })
        .catch(() => {
          if (checkingAction.showMore) {
            const checkNetWeight = loans.map(loan => loan.netweight > 0);
            checkNetWeight.includes(true) ? this.getJewelsInfo(coreIds, checkingAction) : this.showHideLoanDetails = !this.showHideLoanDetails;
          }
        });
    },
    // function call to check renewal covid message
    checkRenewalCovidMessage(actionsArray) {
      this.isDisablingRenewalCovid = true;
      this.disablingRenewalCovidMessage = '';
      actionsArray.map((key) => {
        if (key.type === 'repledge' && !this.disableRepledge) {
          this.isDisablingRenewalCovid = key.allowed;
          this.disablingRenewalCovidMessage = key.reason;
        }
        return true;
      });
    },
    // function call to get selected loan coreIds.
    getCoreIds(loan) {
      const coreids = [];
      loan.map(data => coreids.push(data.coreid));
      this.coreIds = coreids.toString();
      return this.coreIds;
    },
    // api to fetch jewels details based on loan id
    getJewelsInfo(coreIds, checkingAction) {
      const tempObj = {
        productCategory: 'GOLD_LOAN',
      };
      if (coreIds) {
        tempObj.fetchUnselectedLoans = !checkingAction.showMore,
        tempObj.loanIds = coreIds;
      }
      this.getJewelsDetails(tempObj);
      if (checkingAction.showMore) {
        this.showHideLoanDetails = !this.showHideLoanDetails;
      } else {
        this.moveToNextScreen();
        this.showPaymentOptions = false;
      }
    },
    // for fetching the new scheme for renewal,
    getScheme(selectedLoans) {
      this.selectedLoansMappedArray = { selectedloans: [], totalloans: [] };
      let scheme;
      let selectedLoanCount = 0;
      let totalLoanCount = 0;
      const totalloans = { loans: [], type: '' };
      const selectedloans = { loans: [], type: '' };
      selectedLoans.map(selectedGroupLoans => {
        selectedGroupLoans.map(key => {
          key.loans.map(loan => {
            if (loan.type === 'N:1' && loan.netweight) {
              scheme = parseInt(loan.scheme);
              totalloans.loans.push({
                loanid: loan.loanid,
                eligibleweight: loan.eligibleweight,
              });
              totalloans.type = loan.type;
              totalLoanCount += 1;
              if (key.isSelected) {
                selectedLoanCount += 1;
                selectedloans.loans.push({
                loanid: loan.loanid,
                eligibleweight: loan.eligibleweight,
              });
              selectedloans.type = loan.type;
              }
            } else if(loan.netweight) {
              scheme = parseInt(loan.scheme);
              this.selectedLoansMappedArray.totalloans.push({
                loans: [],
                uloanid: '',
                type: ''
              });
              this.selectedLoansMappedArray.totalloans[totalLoanCount].loans.push({
                loanid: loan.loanid,
                eligibleweight: loan.eligibleweight
              });
              this.selectedLoansMappedArray.totalloans[totalLoanCount].type = loan.type;
              this.selectedLoansMappedArray.totalloans[totalLoanCount].uloanid = loan.uloanId;
              totalLoanCount += 1;
              if(key.isSelected) {
                this.selectedLoansMappedArray.selectedloans.push({
                  loans: [],
                  uloanid: '',
                  type: ''
                });
                this.selectedLoansMappedArray.selectedloans[selectedLoanCount].loans.push({
                    loanid: loan.loanid,
                    eligibleweight: loan.eligibleweight
                  });
                this.selectedLoansMappedArray.selectedloans[selectedLoanCount].type = loan.type;
                this.selectedLoansMappedArray.selectedloans[selectedLoanCount].uloanid = loan.uloanId;
                selectedLoanCount++;
              }
            }
            return true;
          });
          return true;
        });
        return true;
      });
      if (totalloans.loans.length > 0 && selectedloans.loans.length > 0) {
        this.selectedLoansMappedArray.selectedloans.push(selectedloans);
        this.selectedLoansMappedArray.totalloans.push(totalloans);
      }
      getrenewalScheme(this.selectedLoansMappedArray)
        .then(response => {
          this.schemeComparison = response.data.response;
          this.schemeComparison.selectedLoanCount = selectedLoanCount
          this.schemeComparison.loanCount = totalLoanCount;
          let isSelectedSchemeSame = false;
          isSelectedSchemeSame = this.schemeComparison.newSchemeSelected && this.schemeComparison.newSchemeTotal && (this.schemeComparison.newSchemeSelected.interestCalculation.interestRate
          ===  this.schemeComparison.newSchemeTotal.interestCalculation.interestRate);
          let isPendingSchemeSame = false;
          if (this.schemeComparison.newPendingScheme && this.schemeComparison.newPendingScheme.interestCalculation.interestRate > 0) {
            isPendingSchemeSame = this.schemeComparison.newSchemeSelected && this.schemeComparison.newPendingScheme && (this.schemeComparison.newSchemeSelected.interestCalculation.interestRate
              !== this.schemeComparison.newPendingScheme.interestCalculation.interestRate);
          } else {
            isSelectedSchemeSame = false;
            isPendingSchemeSame = false;
          }
          if (
            (isSelectedSchemeSame || isPendingSchemeSame)
            && totalLoanCount !== selectedLoanCount && this.schemeComparison.newPendingScheme &&
            this.schemeComparison.newPendingScheme.interestCalculation.interestRate
          ) {
            this.schemeSelectionPopup = true;
            this.showPaymentOptions = false;
            const properties = {
              [events.EVENT_NAME] : events.PAYMENT_INTEREST_RATE_CHANGE_POPUP, 
            }
            sendEvent(events.screen.DASHBOARD, events.category.PAYMENT, properties);
          } else {
            this.selectedScheme(this.schemeComparison.newSchemeSelected);
          }
        })
        .catch(error => {
          this.$noty.error(error.response.data.error.error_message);
        });
    },
    async selectedScheme(scheme) {
      this.selectedSchemeData = scheme;
      this.schemeSelectionPopup = false;
      // skip the loan amount selection modal if only one loan is selected and only one renewal option is available.
      // and no loan enhancement option is available.
      // todo : refactor this section -- ref : https://github.com/Rupeek/payment-web/pull/223#discussion_r617365915
      if(this.selectedLoans.length === 1){
        await this.loanAmountSelectionModalOpened(false);
        if(!(this.isMoreRenewalAvailable(this.currentLPLoanID) || this.isLoanIDEligibleForLE(this.currentLPLoanID))){
          this.confirmModalSelection();
          this.moveToNextScreen();
        } else {
          this.setCurrentLPLoanID(null);
          this.showLoanSelectionModal = true;
        }
      } else {
        this.showLoanSelectionModal = true;
      }
      this.showPaymentOptions = false;
    },
    // function to close the summary component
    closeSummaryPopup(eventData) {
      this.showPaymentOptions = eventData;
      this.showHidePaymentSummary = eventData;
      this.showHideExcessFunding = eventData;
      this.updateDisabledContinueBtn(false);
    },
    updatePaymentOption(paymentOption) {
      this.paymentOption = paymentOption;
    },
    unSelectedLoans(data) {
      this.selectedTopUpLoans = data.$attrs.unSelectedLoans;
      this.populateClosingAmount();
    },
    // function call for excess funding pay
    payExcessFunding() {
      this.paymentOption = 'hardrecovery';
      this.$router.push({ name: 'excessFunding' });
    },
    // for open the status cards
    openStatusCardPopup() {
      this.showStatusCard = true;
      this.repledgePendingLoansOrders(this.repledgePendingLoans.orders);
      this.$router.push({ name: 'statusCardComponent' });
      const properties = {
        [events.EVENT_NAME] : events.PAYMENT_STATUS_CARD_FROM_REPAY_LOAN_CLICKED, 
      }
      sendEvent(events.screen.DASHBOARD, events.category.PAYMENT, properties);
    },
    // for closing the status cards
    closeStatusCardPopup() {
      this.showStatusCard = false;
    },
    closeOnboarding(event) {
      this.onBoarding = event;
    },
     // for selection from scheme popup
    OnSchemeSelect() {
      if(this.selectedOption !== '') {
        const properties = {
          [events.EVENT_NAME] : events.PAYMENT_SELECT_SCHEME_CLICKED, 
        }
        sendEvent(events.screen.DASHBOARD, events.category.PAYMENT, properties);
      }
      if (this.selectedOption === 'selectAllLoans') {
        this.schemeSelectionPopup = false;
      } else if(this.selectedOption === 'selectedLoans') {
        this.selectedScheme(this.schemeComparison.newSchemeSelected);
      } else {
        this.$noty.warning('Please select an option to continue');
      }
      this.selectedOption = '';
    },
    // function call to if selected all the jewels then move to the closure screen.
    setLoanClosure(event) {
      this.paymentOption = event.type;
      this.checkSelectedLoan(event);
      this.populateLoanAmount(this.selectedLoans);
    },
    // function call to if user is back to the jewels screen then changes to payment option.
    partialRelease(event) {
      this.paymentOption = 'partialRelease';
      this.checkSelectedLoan(event);
      this.populateLoanAmount(this.selectedLoans);
    },
    // function call to calculated amount the based on selected jewels.
    checkSelectedLoan(event) {
      this.allLoans.map((groupedLoan, groupIndex) => {
        groupedLoan.loans.map((item, groupLoanIndex) => {
          item.loans.map((loan) => {
            event.coreId.map((coreId) => {
              if (+loan.coreid === +coreId) {
                this.selectLoans({ groupIndex, groupLoanIndex })
                this.setSelectedLoans();
              }
              return true;
            });
            return true;
          });
          return true;
        });
        return true;
      });
    },
    onLoanSelectionModalCompleted() {
      this.showLoanSelectionModal = false;
      this.moveToNextScreen();
    },
    // function to show the payment options component
    showPaymentOptionsComponent() {
      this.paymentOption = '';
      // function call to calculate the closing amount
      this.populateClosingAmount();
      this.showPaymentOptions = true;
      let loans = [];
      this.selectedLoans.map((data) => {
        data.loans.map(loan => loans.push(loan));
        return true;
      });
      this.getRenewalEligibilityStatus();
      this.disablingRenewalCovid(this.getCoreIds(loans), loans=[], { showMore: false });
    },
    getRenewalEligibilityStatus() {
      const selectedLoans = this.selectedLoans.map(selectedLoan => {
        const loan = selectedLoan.loans;
        const loanIdsOfSecureComponents = loan.filter(loanComponent => loanComponent.netweight > 0).map(loanComponent => loanComponent.loanid);
        const secureComponentOfLoan = secureComponent(selectedLoan);
        return ({
          loans : loanIdsOfSecureComponents,
          type : secureComponentOfLoan.type,
          uloanid : secureComponentOfLoan.uloanId,
        });
      });
      const requestObj = {selectedLoans};
      renewalEligibilityAPI(requestObj)
        .then((response) => {
          const res = response.data;
          this.isEligibleForRenewal = res.response.enableRenewalForSelection;
          this.renewalEligibilityMessage = !this.isEligibleForRenewal ? res.response.notAllowedMessage : '';
        })
        .catch((error) => {
          this.$noty.error(error.response.data.error.error_message);
        });
    },
    // function to hide the payment options component
    hidePaymentOptionsComponent() {
      this.showPaymentOptions = false;
      this.closeInfoDetails = {};
    },
    // function to show the summary popup
    showPaymentSummaryComponent() {
      this.resetState();
      if (this.paymentOption === 'rePledge') {
        const selectedLoans = [];
        let rupeekYokFlag = false;
        this.allLoans.map(loanGroup => {
          let index = 0;
          loanGroup.loans.map(loan => {
            if (loan.isSelected && index === 0) {
              ++index;
              selectedLoans.push(loanGroup.loans);
            }
            if (
              ((loan.isSelected &&
                loanGroup.loans[0].loans[0].lenderid === 'rupeek') ||
                loanGroup.loans[0].loans[0].lenderid === 'yogakshemam') &&
              loanGroup.loans[0].loans[0].netweight > 0
            ) {
              rupeekYokFlag = true;
            }
            return true;
          });
          return true;
        });
        if (rupeekYokFlag) {
          this.moveToNextScreen();
          this.showPaymentOptions = false;
        } else {
          this.getScheme(selectedLoans);
        }
      } else if (this.paymentOption === 'partialRelease') {
        const coreIds = [];
        this.selectedLoans.forEach((mainLoan) => {
          mainLoan.loans.forEach((loan) => {
            coreIds.push(loan.coreid);
          });
        });
        this.getJewelsInfo(coreIds.join(','), { showMore: false });
      } else if (this.paymentOption === 'closeLoan' && this.selectedLoansDiscrepancy.includes(true)) {
        this.closureDiscrepacyFlow();
      } else {
       this.moveToCloseLoan();
      }
      this.trackPaymentAction();
    },
    closureDiscrepacyFlow() {
      const coreIds = [];
      const loanDetails = [];
      let discrepancyLoansCout = 0;
      this.selectedLoans.forEach((mainLoan) => {
        mainLoan.loans.forEach((loan) => {
          if (loan.loanHasDiscrepancy && loan.netweight) {
            discrepancyLoansCout += 1;
          }
          if (loan.loanHasDiscrepancy) {
            coreIds.push(loan.coreid);
          }
        });
      });
      getJewelsListAPI({
        productCategory: 'GOLD_LOAN',
        fetchUnselectedLoans: false,
        loanIds: coreIds.join(','),
      })
      .then((response) => {
        const jewelsList = setJewelsList(response);
        jewelsList.loans.forEach((loan) => {
          loanDetails.push({
            hasShowHeader: true,
            lendersInfo: loan.lender,
            loanId: loan.loanId,
            loanDate: loan.loanStartDate,
            loanAmount: loan.amount,
            jewelsList: getOrnamentList(loan.jewels),
          });
        });
      })
      .catch((error) => {
        this.$noty.error(error.message);
      });
      this.closeInfoDetails = {
        hasInfo: true,
        nonDiscrepancyoanCount: this.selectedLoans.length - discrepancyLoansCout,
        loanDetails,
      };
    },
    moveToCloseLoan() {
      this.moveToNextScreen();
      this.showPaymentOptions = false;
      this.closeInfoDetails = {};
    },
    moveToNextScreen() {
      if (this.paymentOption === 'rePledge') {
        this.$router.push('/renewal-summary');
      } else if (this.paymentOption === 'partialRelease') {
        this.$router.push('/jewels-selection');
      } else if (this.paymentOption === 'interest') {
        this.$router.push('/interest-payment-summary');
      } else if (this.paymentOption === 'partPayment') {
        this.$router.push('/part-payment-summary');
      } else {
        this.$router.push('/close-loan-summary');
      }
    },
    trackPaymentAction() {
      const coreIds = [];
      const lenders = [];
      this.selectedLoans.map((selectedLoan) => {
        let loans = selectedLoan.loans;
        loans.map((loanComponent) => {
          lenders.push(loanComponent.lenderName);
          coreIds.push(loanComponent.coreid);
          return true;
        });
        return true;
      });

      const eventProperty = mapCleverTapProperty(this.paymentOption, this.populateAmounts);
      const eventProperties = { 
                              [events.EVENT_NAME] : events.PAYMENT_CONTINUE_TO_PAY_REPAY_LOAN_CLICKED,
                              [events.PAYMENT_ACTION] : eventProperty.action, 
                              [events.PAYMENT_CORE_ID] : coreIds.join(','),
                              [events.PAYMENT_LENDER_ID] : _.uniq(lenders).join(' & ')};
      if (this.paymentOption !== 'rePledge') {
        eventProperties[events.PAYMENT_AMOUNT] = eventProperty.amount;
      }
      sendEvent(events.screen.DASHBOARD, events.category.PAYMENT, eventProperties);
    },
    // API call to get the excess funding
    excessFundingApi() {
      let checkingLenders = [];
      getexcessFundingConfing()
        .then(response => {
          //
          const excessFunding = response.data.response;
          checkingLenders = excessFunding.map((key, index) => {
            return key.lenderid;
          });
          const lendersBranchs = [...new Set(checkingLenders)];
          this.excessFundingArray = excessFunding.map((key, index) => {
            const loanObj = {};
            loanObj.loans = [];
            const singleLoan = key;
            singleLoan.active = true;
            singleLoan.loanType = _.get(key, 'takeover.istakeover') ? 'toLoanClosure' : 'hardrecovery';
            singleLoan.lenderName = this.lendersConfig[singleLoan.lenderid].name;;
            loanObj.loans.push(singleLoan);
            loanObj.isSelected = false;
            loanObj.isSameLender = false;
            if (lendersBranchs.length === 1) {
              loanObj.isSameLender = true;
            }
            loanObj.isDisabled = false;
            // Object store the loan object
            const tempObj = Object.assign({}, loanObj);
            const loansObj = {};
            loansObj.loans = [];
            loansObj.loans.push(tempObj);
            return loansObj;
          });
          if (this.excessFundingArray.length) {
           this.loansArray.map((groupedLoans) => {
              const modifiedArray = groupedLoans;
              modifiedArray.loans.map((groupedLoan) => {
                groupedLoan.loans.map((loan) => {
                  const loanData = loan;
                  excessFunding.map((exFundLoan) => {
                    if (loanData.coreid === exFundLoan.coreid) {
                      loanData.recoverytext = exFundLoan.recoverytext;
                    }
                  });
                  return loanData;
                });
                return groupedLoan;
              });
              return modifiedArray;
            });
            this.hideLoanSelection = true;
            this.setHideLoanSelection(this.hideLoanSelection);
            this.updatedALLLoans(this.loansArray);
            this.setLoans(JSON.parse(JSON.stringify(this.excessFundingArray)));
          } else {
            this.hideLoanSelection = false;
            this.setHideLoanSelection(this.hideLoanSelection);
          }
        })
        .catch(error => {
          this.$noty.error(errorMessages(error));
        });
    },
    // api call to check disabling renewal option for the bank not working because of Covid
    disablingCovid(coreIds) {
      disablingRenewalCovidAPI(coreIds)
        .then((response) => {
          this.loansArray.map((mainLoans) => {
            const subMainLoan = mainLoans;
            subMainLoan.loans.map((loanDetails) => {
              const loanInDetails = loanDetails;
              loanInDetails.loans.map((loans) => {
                const loanData = loans;
                response.data.data.loans.forEach((data) => {
                  if (+data.coreid === +loanData.coreid) {
                    subMainLoan.hasBranchWorking = !data.branch.operational;
                    subMainLoan.reason = data.branch.reason;
                    response.data.data.actions.forEach((actions) => {
                      loanData.renewalEligible = !data.branch.operational ? actions.allowed : true;
                      loanData.renewalNotEligibleMessage = !data.branch.operational ? actions.reason : '';
                    })
                  }
                });
                return loanData;
              });
              return loanInDetails;
            });
            return subMainLoan;
          });
          this.updatedALLLoans(this.loansArray);
          if (!this.excessFundingArray.length) {
            this.setLoans(JSON.parse(JSON.stringify(this.loansArray)));
          }
        })
        .catch((error) => {
          this.$noty.error(error.message);
        });
    },
  },
  activated() {
    this.paymentOption = '';
    this.setPaymentOption('');
    this.setQuickLinkSelected('all');
    this.setQuickLinkDispaly('Manage Loans');
    if (!this.allLoans.length) {
      // function call to get the lender configuration on page
      // load (before listing of loans for a customer)
      this.lenderConfiguration();
      this.getPaymentConfig();
      this.getStaticMessages(`${this.closureDiscrepancyInfo},${this.identifierType}`);
    }
  },
};
</script>
<style lang="scss">
@import "@/scss/desktop/dashboard.scss";
@import "@/scss/components.scss";

.loans-list {
  // box-shadow: 0px 3px 6px 1px rgba(0, 0, 0, 0.12);
  .quick-links {
    display: flex;
    gap: 0.5em;
    margin-left: auto;
    background-color: #FFF8EF;
    border-radius: 10rem;
    font-size: clamp(0.8rem, 2.25vw, 1rem);
    text-transform: capitalize;
    :hover {
      cursor: pointer;
    }

    span {
      display: flex;
      align-items: center;
      padding: 0.8em 1.75em;
      font-weight: 500;
      &:first-child {
        padding-right: 0.5em;
      }
      &.dropdown {
        padding-left: 0;
        img {
          transform: rotate(0deg);
          transition: transform 100ms linear;

          &.hide {
            transform: rotate(180deg);
          }
        }
      }
    }
    > div {
      margin-top: 1em;
      display: flex;
      flex-direction: column;
      top: 100%;
      right: 0;
      background-color: white;
      box-shadow: 0px 1px 10px 1px rgba(0, 0, 0, 0.16);
    }
  }
}
.z-index-999 {
  z-index: 999;
}
.bgnd-yellow{
  background-color: #ffeed9;
}
.top-up {
  position: relative;
  top: -5px;
}
.disabled {
  .top-up {
    background-color: #9f9f9f;
  }
}
.new-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  .repay-btn {
    background: linear-gradient(0.07deg, #1287e5 0.06%, #6cb9f5 99.94%);
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    color: #ffffff;
  }
}
.video {
  h4 {
    font-size: 16px;
    color: #1E2D4B;
    letter-spacing: -0.01em;
    @media screen and (max-width: 600px) {
      font-size: 14px;
    }
  }
  p {
    font-size: 14px;
    font-weight: 600;
    color: #1E2D4B;
    letter-spacing: -0.01em;
    @media screen and (max-width: 600px) {
      font-size: 12px;
      font-weight: 500;
    }
  }
  .video-section {
    p {
      color: #1E2D4B;
    }
  }
}
.show-more-loans-release {
  margin-bottom: 13rem;
}
.show-gold-Tracker {
  margin-bottom: 12rem;
}
.sticky-footer-wraper {
  &.show-more-loans-release {
    margin: 0;
    bottom: 200px;
    @media screen and (max-width: 390px) {
      bottom: 235px;
    }
  }
  &.show-gold-Tracker {
    margin: 0;
    bottom: 130px;
    @media screen and (max-width: 600px) {
      bottom: 140px;
    }
  }
}
.branch-closed {
  color: #0076D0;
  background: rgba(61, 190, 247, 0.1);
  border-radius: 12px 12px 0px 0px;
  margin: 0 20px;
  padding: 9px 16px;
  font-size: 12px;
}
</style>
