<template>
  <div class="renewal-loan-details flex justify-between">
    <div>
      <span class="label-span normal-font">
        Loan Date
      </span>
      <span class="medium-font-weight">
        {{ moment(loanDetails.loanDate).format("DD/MM/YYYY")}}
      </span>
    </div>
    <div>
      <span class="label-span normal-font">
        Loan Amount
      </span>
      <span class="medium-font-weight">
        {{
          formatRupeeAmount(loanDetails.loanAmount
            ? loanDetails.loanAmount : loanDetails.loanamount)
        }}
      </span>
    </div>
  </div>
</template>
<script>
import moment from 'moment';
import _ from 'lodash';
import { formatRupeeAmount } from '@/utils/string';

export default {
  name: 'statusCardLoanDetails',
  data() {
    return {};
  },
  computed: {
    _() {
      return _;
    },
  },
  props: {
    // recieving props data from parent
    loanDetails: {
      type: Object,
    },
  },
  methods: {
    formatRupeeAmount,
    moment: (date) => moment(date),
  },
};
</script>
