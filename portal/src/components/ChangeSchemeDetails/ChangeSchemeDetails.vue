<template>
  <div class="scheme-details">
    <div class="d-flex mb-2">
      <p class="row-label mr-0">Tenure</p>
      <p class="row-data">{{schemes.tenure || ''}} Months</p>
    </div>
    <div class="d-flex mb-2">
      <p class="row-label mr-0">Scheme Name</p>
      <p class="row-data">{{
        schemes.schemeName ? schemes.schemeName.replace(/rupeek/gi, ' ') : ''
      }} <br>{{schemes.type === 'jumping' ? 'Non-Fixed (ROI)' : 'Fixed ROI'}}
      </p>
    </div>
    <div class="d-flex" v-if="schemes && schemes.type === 'jumping'">
      <p class="row-label terms w-100 mr-0">
        *Effective ROI, if due interest is fully paid online within every
      </p>
    </div>
    <div class="d-flex">
      <div class="interest-slab d-flex">
        <div class="interest-slab-label row-label mr-0">
          <p>Days</p>
          <p>ROI (P.M.)</p>
          <p>ROI (P.A.)</p>
        </div>
        <!-- [TODO] Use for loop -->
        <div
          v-for="
            (scheme, index) in
            schemes.interestCalculation && schemes.interestCalculation.interestSlabs"
          :key="index"
        >
          <p class="interest-jumping-date">{{scheme.toDay ? scheme.toDay : scheme.formDay}}</p>
          <p class="interest-percentage"><b>{{toMonthlyInterestRate(scheme.interestRate)}}%</b></p>
          <p class="interest-percentage-pa">{{scheme.interestRate}}%</p>
        </div>
      </div>
    </div>
</div>
</template>

<script>
import { toMonthlyInterestRate } from '@/utils/string';

export default {
  props: {
    schemes: Object,
  },
  data() {
    return {};
  },
  methods: {
    toMonthlyInterestRate,
  },
};
</script>

<style lang="scss" scoped>
  .scheme-details {
    padding: 24px;
    margin-top: 1px;
    background-color: #f2f2f2;
    border-radius: 0 0 10px 10px;

    .row-label,
    .interest-slab {
      color: #727272;
      font-size: 9px;
    }
    .row-label {
      width: 90px;
      &.terms {
          font-size: 8px;
      }
    }

    .interest-slab {
      div:not(:last-child) {
        margin-right: 2rem;
      }
    }

    .row-data {
      font-size: 11px;
      font-weight: 600;
      color: black;
    }
    b {
      font-weight: 600;
      color: black;
    }
  }
</style>
