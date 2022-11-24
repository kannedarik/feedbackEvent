<!-- eslint-disable max-len -->
<template>
    <Container class="mt-3" :screenType="'body-bg'">
      <div class="header-main py-6 sm:px-3 md:px-4 bg-white">
        <div class="md:flex md:items-center">
          <div>
            <img src="@/assets/icons/left_arrow.svg" alt="back_arrows"
              class="cursor-pointer" @click="closeSummaryPopup"/>
          </div>
          <div class="sm:mt-3 md:mt-0 md:ml-3">
            <h2 class="font-semibold text-lg">
              Total Pending Payments
            </h2>
          </div>
        </div>
        <div class="mb-0 amount-details flex items-center justify-between p-2">
          <div>
            <h3>Total Payable Amount</h3>
            <h4 class="bold-font">
              <span v-if='!isTakeover'>
                {{formatRupeeAmount(populateAmounts.hardrecovery)}}
              </span>
              <span v-else>
                {{formatRupeeAmount(populateAmounts.toClosureAmount)}}
              </span>
            </h4>
          </div>
          <div>
            <h3>Number of Loans</h3>
            <h4 class="bold-font text-right">
              <span v-if="selectedLoans.length >= 1">
                {{selectedLoans.length}}
              </span>
              <span v-else>--</span>
            </h4>
          </div>
        </div>
      </div>
      <div class="block py-2 mb-16">
        <div class="block pl-3 pr-3">
          <div class="excess-funding-summary">
            <h4 class="py-2 medium-font-weight">Loans with Pending payments</h4>
            <div class="loans mb-3 bg-white d-flex flex-wrap"
              v-for='(excessFund, groupIndex) in excessFunding' :key="groupIndex"
              :class="{'disabled':(_.get(excessFund, 'loans[0].isDisabled')
                || (selectedLoanType !== _.get(excessFund, 'loans[0].loans[0].loanType')
                  && selectedLoansList.length > 0) )}">
              <div class="block p-3 px-4 transition border-transparent"
                :class="{'selected': _.get(excessFund, 'loans[0].isSelected')}">
                <div class="py-3 flex items-center justify-between border-bottom">
                  <div class="flex items-start">
                    <div class="icon">
                      <img :src="lendersConfig[_.get(excessFund, 'loans[0].loans[0].lenderid')].iconLink"
                        :alt="_.get(excessFund, 'loans[0].loans[0].lenderid')"/>
                    </div>
                    <div>
                      <p class="bold-font">
                        {{_.get(excessFund, 'loans[0].loans[0].lenderName')}}
                      </p>
                      <span v-if="_.get(excessFund, 'loans[0].loans[0].takeover.istakeover')">
                        {{_.get(excessFund, 'loans[0].loans[0].takeover.schemename')}}
                      </span>
                      <span v-else>
                        {{_.get(excessFund, 'loans[0].loans[0].schemedata')
                          ? (_.get(excessFund, 'loans[0].loans[0].schemedata.jumping')
                            ? 'One Shot Repay' : 'Monthly Repay')
                          : '--'
                        }}
                      </span>
                    </div>
                  </div>
                  <div class="text-center">
                    <p>
                      {{moment(_.get(excessFund, 'loans[0].loans[0].loanstartedon')).format('DD/MM/YYYY')}}
                    </p>
                    <span v-if="_.get(excessFund, 'loans[0].loans[0].schemedata')">
                      {{_.get(excessFund, 'loans[0].loans[0].schemedata.tenure')}} Months
                    </span>
                    <span v-else>--</span>
                  </div>
                </div>
                <div class="flex items-center justify-between loan-header py-4 border-bottom">
                  <div class="col-6 p-0">
                    <h5>Loan Amount</h5>
                    <h6>{{formatRupeeAmount(_.get(excessFund, 'loans[0].loans[0].loanamount'))}}</h6>
                  </div>
                  <div class="col-6 p-0 text-right">
                    <h5>Payable Amount</h5>
                    <h6 class="bold-font" v-if="_.get(excessFund, 'loans[0].loans[0].takeover.istakeover')">
                      {{formatRupeeAmount(_.get(excessFund, 'loans[0].loans[0].closingamount'))}}
                    </h6>
                    <h6 class="bold-font" v-else>
                      {{formatRupeeAmount(_.get(excessFund, 'loans[0].loans[0].hardrecovery'))}}
                    </h6>
                  </div>
                </div>
                <div class="block pt-3" >
                  <div class="custom-radios"
                    @change="getSelectExcessFundingLoan({groupIndex, groupLoanIndex: 0}, _.get(excessFund, 'loans[0].loans[0].takeover.istakeover') ? 'toLoanClosure' : 'hardrecovery')">
                    <input type="checkbox" :id='"selected-loan-"+groupIndex' v-model='selectedLoansList' :value='excessFund' name="selected-loan">
                    <label :for='"selected-loan-"+groupIndex'>
                      <div class='checkbox-text text-center cursor-pointer flex-align-center justify-content-center' >
                        <span class='imag'>
                          <img src="@/assets/check-icn.svg" alt="Checked Icon" />
                        </span>
                        <span v-if="_.get(excessFund, 'loans[0].isSelected')">Selected</span>
                        <span v-else>Select Loan</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div class="message display-flex w-100"
                v-if="_.get(excessFund, 'loans[0].loans[0].recoverytext') || _.get(excessFund, 'loans[0].loans[0].takeover.takeovermessage')">
                <div class="mr-2">
                  <img src="@/assets/excess_funding.svg" alt="icon-info-colored"/>
                </div>
                <div>
                  <p class="normal-font" v-if="_.get(excessFund, 'loans[0].loans[0].takeover.istakeover') && _.get(excessFund, 'loans[0].loans[0].takeover.takeovermessage')">
                    {{_.get(excessFund, 'loans[0].loans[0].takeover.takeovermessage')}}
                  </p>
                  <p class="normal-font" v-if="_.get(excessFund, 'loans[0].loans[0].recoverytext')">
                    {{_.get(excessFund, 'loans[0].loans[0].recoverytext')}}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    <div class="sticky-footer-wraper">
      <Container>
        <div class="bg-white py-2 px-4 md:p-7 flex justify-between">
          <div class="payment-info flex items-center">
            <span>Pay:</span>
            <h4 class="ml-2" v-if='!isTakeover'>
              <span class="currency">
                {{toRupeeAmount(populateAmounts.hardrecovery).currency}}
              </span>
              {{toRupeeAmount(populateAmounts.hardrecovery).amount}}
            </h4>
            <h4 class="ml-2" v-else>
              <span class="currency">
                {{toRupeeAmount(populateAmounts.toClosureAmount).currency}}
              </span>
              {{toRupeeAmount(populateAmounts.toClosureAmount).amount}}
            </h4>
          </div>
          <button class="float-right btn btn-primary-rupeek p-3 rounded-full"
          @click="payNow">
            Pay
          </button>
        </div>
      </Container>
    </div>
  </Container>
</template>
<script>
import moment from 'moment';
import _ from 'lodash';
import { mapGetters } from 'vuex';
import store from '@/store';
import Container from '@/components/CommonComponents/Container.vue';
import { formatRupeeAmount, toRupeeAmount } from '@/utils/string';
// eslint-disable-next-line
import { getPaymentMethodsBasedOnLoansLender } from '@/utils/getPaymentMethods';

export default {
  name: 'excessFunding',
  data() {
    return {
      // array to store the selected loans
      selectedLoansList: [],
      selectedLoanType: '',
      isTakeover: false,
    };
  },
  components: {
    Container,
  },
  computed: {
    _() {
      return _;
    },
    ...mapGetters({
      selectedLoans: 'loans/selectedLoans',
      populateAmounts: 'loans/populateAmounts',
      lendersConfig: 'loans/lendersConfig',
      excessFunding: 'loans/allLoans',
      paymentOption: 'loans/paymentOption',
    }),
  },
  watch: {
    isTakeover(value) {
      store.dispatch('loans/hasTakeover', value);
    },
  },
  methods: {
    toRupeeAmount,
    formatRupeeAmount,
    moment: (date) => moment(date),
    // Function call for select the excess funding loans
    getSelectExcessFundingLoan(index, selectedLoanType) {
      this.selectedLoanType = selectedLoanType;
      store.dispatch('loans/selectLoans', index);
      store.dispatch('loans/setSelectedLoans');
      // function call to check multiple lenders
      this.checkLoansForMultipleLenders();
      // function to populate hardrecovery amount
      this.populateClosingAmount();
      this.isTakeover = selectedLoanType === 'toLoanClosure';
    },
    closeSummaryPopup() {
      if (!this.selectedLoansList.length) {
        this.$router.push({ path: '/dashboard' });
      } else {
        this.selectedLoansList.length = 0;
        this.excessFunding.map((loans, groupIndex) => {
          if (loans.loans[0].isSelected) {
            store.dispatch('loans/selectLoans', { groupIndex, groupLoanIndex: 0 });
            store.dispatch('loans/setSelectedLoans');
            this.checkLoansForMultipleLenders();
            // function to populate hardrecovery amount
            this.populateClosingAmount();
          }
          return true;
        });
        this.isTakeover = false;
        this.$router.go(-1);
      }
    },
    // function to check unique lenders and disable the loans with other vendors
    checkLoansForMultipleLenders() {
      let lendersArray = [];
      this.selectedLoansList.map((key) => {
        key.loans.map((data) => {
          lendersArray = [];
          data.loans.filter((loan) => {
            lendersArray.push(loan.lenderid);
            return true;
          });
          return true;
        });
        return true;
      });
      store.dispatch('loans/checkLoansForMultipleLenders', lendersArray);
    },
    // function to populate hardrecovery amount
    populateClosingAmount() {
      const selectedLoans = [];
      this.selectedLoansList.map((key) => {
        key.loans.map((data) => {
          selectedLoans.push(data);
          return selectedLoans;
        });
        return true;
      });
      store.dispatch('loans/populateLoanAmount', selectedLoans);
    },
    payNow() {
      getPaymentMethodsBasedOnLoansLender(this.selectedLoans, this.paymentOption,
        this.isTakeover);
    },
    checkExcessFundingFlow() {
      // checking the excess funding array for if same lender then active the all loans
      this.excessFunding.map((key, index) => {
        const selectLoanIndexes = {};
        let loanType = '';
        selectLoanIndexes.groupIndex = index;
        key.loans.map((data, indexValue) => {
          const loanData = data;
          selectLoanIndexes.groupLoanIndex = indexValue;
          if (loanData.isSameLender) {
            if (loanData.isSelected) {
              store.dispatch('loans/selectLoans', selectLoanIndexes);
            }
            loanType = loanData.loans[0].loanType;
            this.selectedLoansList.push(key);
            // Function call for select the excess funding loans
            this.getSelectExcessFundingLoan(selectLoanIndexes, loanType);
          }
          return this.selectedLoansList;
        });
        return true;
      });
      // reset the selected loans
      if (this.selectedLoans.length >= 1 && !this.selectedLoans[0].isSameLender) {
        const index = localStorage.getItem('indexValue')
          ? JSON.parse(localStorage.getItem('indexValue')) : null;
        // Function call for select the excess funding loans
        this.getSelectExcessFundingLoan(index);
      }
    },
  },
  activated() {
    store.dispatch('loans/setPaymentOption', this.paymentOption);
    this.checkExcessFundingFlow();
  },
};
</script>
<style lang='scss'>
.loans {
  .selected {
    border: 2px solid #fe9411!important;
  }
}
.excess-funding-summary {
  h4 {
    font-size: 1rem;
  }
}
.amount-details {
  h3 {
    font-size: .8125rem;
    color: #727272;
    margin-bottom: 8px;
  }
  h4 {
    font-size: 3rem;
  }
  h5 {
    font-size: 2rem;
  }
}
.loans{
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
  border: none;
  border-radius: 7px;
  p{
    font-size: 1rem;
  }
  span{
    font-size: 0.825rem;
    color: #969696;
  }
  .message{
    clear: both;
    padding: 10px 8px;
    background-color: #f8dfdf;
    border-radius: 0 0 7px 7px;
    p {
      font-size: 10px;
      color: #484848;
    }
  }
}
.loan-header {
  h5{
    font-size: 0.75rem;
    color: #727272;
    margin-bottom: 4px;
  }
  h6{
    font-size: 1rem;
  }
}
.custom-radios {
  div {
    display: inline-block;
  }
  input[type='checkbox'] {
    display: none;
    + label {
      font-size: 0.825rem;
      .checkbox-text {
        width: 120px;
        height: 32px;
        vertical-align: middle;
        border-radius: 16px;
        border: 1px solid #fe9411;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.33);
        background-repeat: no-repeat;
        background-position: center;
        line-height: 34px;
        color: #fe9411;
        display: flex;
        background-color: #ffffff;
        .imag{
          width: 14px;
          margin-right: 3px;
          display:none;
          transition: all .3s ease;
          img {
            width: 100%;
          }
        }
      }
      span{
        color: #fe9411;
      }
    }
    &:checked + label .checkbox-text{
      background-color: #fe9411;
      .imag{
        display:block;
      }
      span{
        color:#ffffff;
      }
    }
  }
  .checkbox-selected {
    input[type='checkbox'] {
       &:checked + label .checkbox-text{
      background-color: #fe9411;
      .imag{
        display:block;
      }
      span{
        color:#ffffff;
      }
    }
    }
  }
}
.border-transparent{
  border: 2px solid transparent;
}
</style>
