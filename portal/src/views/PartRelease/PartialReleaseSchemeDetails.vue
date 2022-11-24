<template>
  <div class="summary-wrapper loan-details">
    <div class="leadform z-index-999" v-if="hasShowJewelsInfo"></div>
    <Container>
      <div class="header sm:mt-4 md:mt-8 sm:px-3 sm:py-2 md:px-8 md:py-4 bg-white">
        <div class="md:flex md:items-center">
          <div>
            <img src="@/assets/icons/left_arrow.svg" alt="back_arrows"
              class="cursor-pointer" @click="backToSummary()"/>
          </div>
          <div class="sm:mt-2 md:ml-4">
           <h2 class="font-semibold text-lg">
              {{$t('loan_update_details')}}
            </h2>
          </div>
        </div>
      </div>
      <div class="bg-white sm:px-3 md:px-8 interest-payment-summary repledge-summary">
        <InfoMessageWithTitle
          :infoMessage="newLoanDetailsMessage"
        />
        <div class="flex grey-bgnd">
          <LoanSummary
            :loanDetails="jewelsInDetails.loanDetails"
            :totalJewelsCount="jewelsInDetails.jewelRemaining.length
              + jewelsInDetails.jewelSelected.length"
            :type="'current_loan'"
          />
          <LoanSummary
            :loanDetails="jewelsInDetails.newLoanDetails"
            :totalJewelsCount="jewelsInDetails.jewelRemaining.length"
            :type="'new_loan'"
            @viewRemainingJewels="viewRemainingJewels($event)"
          />
        </div>
      </div>
    </Container>
    <transition
      name="custom-classes-transition"
      enter-active-class="animated slideInUp"
      leave-active-class="animated slideOutDown">
      <BottomPopUpInfo
        :goldRelease="goldRelease"
        :hasPartReleaseSummary="true"
        v-on:closeOnboarding="closeOnboarding()"
        v-if="hasShowJewelsInfo"
      />
    </transition>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import Container from '@/components/CommonComponents/Container.vue';
import InfoMessageWithTitle from '@/components/InfoMessagesBoxs/InfoMessageWithTitle.vue';
import BottomPopUpInfo from '@/components/CommonComponents/BottomPopUpInfo.vue';
import LoanSummary from '@/components/LoanSummary/LoanSummary.vue';
import PaymentType from '@/mixins/PaymentType';
import infoIcon from '@/assets/icons/additiona_info_icon.svg';

export default {
  name: 'PartialReleaseSchemeInDetails',
  components: {
    Container,
    InfoMessageWithTitle,
    LoanSummary,
    BottomPopUpInfo,
  },
  data() {
    return {
      newLoanDetailsMessage: {
        infoIcon,
        title: '',
        message: 'new_loan_details_message',
        size: 'small',
      },
      hasShowJewelsInfo: false,
      goldRelease: [],
    };
  },
  mixins: [PaymentType],
  computed: {
    ...mapGetters({
      paymentOption: 'loans/paymentOption',
    }),
  },
  props: {
    jewelsInDetails: {
      type: Object,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
  },
  methods: {
    backToSummary() {
      this.$router.push(`/partial-release-summary?orderId=${this.orderId}`);
    },
    viewRemainingJewels(data) {
      this.hasShowJewelsInfo = true;
      this.goldRelease = data;
    },
    closeOnboarding() {
      this.goldRelease = [];
      this.hasShowJewelsInfo = false;
    },
  },
  mounted() {
    this.checkPaymentOption();
  },
};
</script>
