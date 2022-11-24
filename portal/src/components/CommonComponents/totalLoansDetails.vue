<template>
  <div class="renewal-summary-card">
    <div class="loan-details bg-transparent">
      <div class="summary-row" v-if="totalLoansDetails.totalSelectedLoans">
        <div class="renewal-number-of-loans receipt-component">
          <div class="font-secondary">
            {{$t('total_number_of_loans')}}
            <span class="total-loans inter-font-family ml-2">
              {{totalLoansDetails.totalSelectedLoans}}
            </span>
          </div>
        </div>
        <div class="renewal-number-of-loans">
          <button class="btn-transparent" @click="openJewelsInfo">
            {{$t('view_gold')}}
          </button>
        </div>
      </div>
      <div class="total" v-if="totalLoansDetails.totalSelectedLoans"></div>
      <div v-for="(loan, index) in getDetails(totalLoansDetails.details)" :key="index"
        class="summary-row pb-0 inter-font-family new-summary-row"
        :class="{'cashback' : loan.key === 'total_rebate_amount'}">
        <div class="receipt-component flex-row">
          {{$t(`${loan.key}`)}}
          <img :src="loan.infoIcon" alt="additional_charges"
            @click="openChargesInfo(loan.charges)"
            v-if="loan.infoIcon" width="15px" class="ml-2" />
        </div>
        <div class="normal-font text-sm">
          <span v-if="loan.key === 'total_rebate_amount'">-</span>
          {{formatRupeeAmount(loan.amount)}}
        </div>
      </div>
      <div class="summary-row total mb-4 pt-3 mt-3">
        <div class="font-secondary inter-font-family font-semibold">
          {{$t('total_payable_amount')}}
        </div>
        <div class="text-lg font-secondary font-semibold inter-font-family">
          {{formatRupeeAmount(totalLoansDetails.totalPayableAmount)}}
        </div>
      </div>
      <InfoMessageWithTitle class="mt-3 mb-5 w-100" v-if="!_.isEmpty(totalInfoMessage)"
        :infoMessage="totalInfoMessage"
      />
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import InfoMessageWithTitle from '@/components/InfoMessagesBoxs/InfoMessageWithTitleImge.vue';
import { formatRupeeAmount } from '@/utils/string';

export default {
  name: 'totalLoansDetails',
  data() {
    return {};
  },
  components: {
    InfoMessageWithTitle,
  },
  props: {
    totalLoansDetails: {
      type: Object,
      required: true,
    },
    totalInfoMessage: {
      type: Object,
    },
  },
  computed: {
    _() {
      return _;
    },
  },
  methods: {
    formatRupeeAmount,
    openJewelsInfo() {
      this.$emit('openJewelsInfo');
    },
    openChargesInfo(data) {
      this.$emit('openChargesInfo', data);
    },
    getDetails(details) {
      return details.filter((loan) => (loan.amount || loan.key === 'interest_amount' || loan.key === 'part_release_amount'));
    },
  },
};
</script>

<style lang="scss">
</style>
