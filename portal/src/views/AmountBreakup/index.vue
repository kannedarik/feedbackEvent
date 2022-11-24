<template>
  <div>
    <div class="leadform z-index-999" v-if="hasShowJewelsInfo"></div>
    <div class="payments-body mb-24">
      <Container :screenType="'body-bg'">
        <div class="header-main sm:px-4 sm:py-4 md:p-8 mt-4 bg-white">
          <div class="md:flex md:items-center">
            <div>
              <img src="@/assets/icons/left_arrow.svg"
                alt="back_arrows" class="cursor-pointer"
                @click="backToPreviousScreen()" />
            </div>
            <div class="sm:mt-3 md:mt-0 md:ml-4">
              <h2 class="font-semibold text-lg">
                {{$t('closure_amount_breakup')}}
              </h2>
            </div>
          </div>
        </div>
        <div class="p-3">
          <b-card header-tag="header" footer-tag="footer"
            class="loan-card">
            <template #header>
              <div class="d-flex p-1 inter-font-family">
                <span class="label text-sm font-semibold">
                  {{$t('closure_amount')}}
                </span>
                <h6 class="font-secondary text-sm ml-2 font-semibold">
                  {{formatRupeeAmount(loansInfo.payableAmount)}}
                </h6>
              </div>
            </template>
            <div class="p-3 d-flex justify-between inter-font-family main-loans-section">
              <div v-for="(loanInfo, index) in getMainLoansInfo" :key="index">
                <label class="text-xs">
                  {{$t(`${loanInfo.key}`)}}
                </label>
                <p class="font-secondary text-sm font-semibold">
                  {{$t(`${loanInfo.data}`)}}
                </p>
              </div>
            </div>
            <div class="jewels-info p-3 d-flex align-items-center">
              <img src="@/assets/icons/jewels_new_icon.svg" alt="jewels_icon">
              <p class="text-xs ml-2">
                {{
                  _.join(
                  _.map(loansInfo.jewelsList, (ornament) => `${ornament.ornamentCount}
                  ${ornament.ornamentType ? ornament.ornamentType : 'jewels'}`),
                  ' , ')
                }}
              </p>
            </div>
            <div class="p-3 inter-font-family">
              <div v-for="(loanInfo, mainIndex) in loansInfo.loanDetails"
                :key="mainIndex">
                <div class="d-flex align-items-center border-bottom">
                  <div class="icon icon-small">
                    <img :src="lendersConfig[loanInfo.lender].iconLink" :alt="loanInfo.lender">
                  </div>
                  <p class="font-semibold font-secondary text-sm my-2">
                    {{ lendersConfig[loanInfo.lender].name }}
                  </p>
                </div>
                <div v-for="(loan, index) in getDetails(loanInfo.details)" :key="index"
                  class="px-3 py-2 d-flex justify-between text-sm font-tertiary"
                  :class="{'cashback' : loan.key === 'rebate_amount'}">
                  <div class="d-flex flex-row">
                    {{$t(`${loan.key}`)}}
                    <img :src="loan.infoIcon" alt="additional_charges"
                      @click="openChargesInfo(loan.charges)"
                      v-if="loan.infoIcon" width="15px" class="ml-2"/>
                  </div>
                  <div>
                    <span v-if="loan.key === 'rebate_amount'">-</span>
                    {{formatRupeeAmount(loan.amount)}}
                  </div>
                </div>
              </div>
            </div>
            <div class="px-3">
              <div class="pl-3 py-3.5 d-flex justify-between border-top
                inter-font-family font-secondary font-semibold">
                <div>
                  {{$t('closure_amount')}}
                </div>
                <div class="text-lg">
                  {{formatRupeeAmount(loansInfo.payableAmount)}}
                </div>
              </div>
            </div>
          </b-card>
        </div>
      </Container>
      <transition
        name="custom-classes-transition"
        enter-active-class="animated slideInUp"
        leave-active-class="animated slideOutDown">
        <CustomerAddressJewels
          :hasChangeAddress="false"
          :additionalCharges="charges"
          :hasShowCharges="hasShowJewelsInfo"
          :hasUpdateSelectedAddress="false"
          v-on:closeOnboarding="hasShowJewelsInfo = false"
          v-if="hasShowJewelsInfo"
        />
      </transition>
    </div>
    <div class="new-footer">
      <Container>
        <div class="sm:px-3 md:px-8 py-3 bt box-shadow text-right">
          <button class="btn-rounded-secondary w-full md:w-1/2"
           @click="backToPreviousScreen()">
            Back To Payments
          </button>
        </div>
      </Container>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
import { mapGetters } from 'vuex';
import Container from '@/components/CommonComponents/Container.vue';
import CustomerAddressJewels from '@/components/CommonComponents/CustomerAddressJewelsInfo.vue';
import { formatRupeeAmount } from '@/utils/string';

export default {
  name: 'AmountBreakup',
  data() {
    return {
      hasShowJewelsInfo: false,
      charges: [],
    };
  },
  props: {
    loansInfo: {
      type: Object,
    },
  },
  components: {
    Container,
    CustomerAddressJewels,
  },
  computed: {
    _() {
      return _;
    },
    ...mapGetters({
      lendersConfig: 'loans/lendersConfig',
      populateAmounts: 'loans/populateAmounts',
    }),
    getMainLoansInfo() {
      return [
        {
          key: 'loan_amount',
          data: formatRupeeAmount(this.loansInfo.loanAmount),
        },
        {
          key: 'lender',
          data: _.join(
            _.map(this.loansInfo.lendersInfo, (loan) => this.lendersConfig[loan].name), ' & ',
          ),
        },
        {
          key: 'loan_date',
          data: moment(this.loansInfo.loanDate).format('DD/MM/YYYY'),
        },
      ];
    },
  },
  methods: {
    formatRupeeAmount,
    moment: (date) => moment(date),
    backToPreviousScreen() {
      this.$router.go(-1);
    },
    getDetails(details) {
      return details.filter((loan) => (loan.amount || loan.key === 'interest_amount'));
    },
    openChargesInfo(data) {
      this.charges = data;
      this.hasShowJewelsInfo = true;
    },
  },
  activated() {
    if (!this.loansInfo) {
      this.$router.push('/dashboard');
    }
  },
};
</script>
<style lang='scss'>
  @import '@/scss/payments-summary/payments-summary.scss';
  .loan-card {
    .card-header {
      background-color: #FDEEE8;
    }
  }
  .jewels-info {
    background: #FAFAFA;
    border-width: 0.5px 0px;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.12);
  }
  .font-tertiary {
    color: #4B576F;
    &.cashback {
      color: #5DA513;
    }
  }
  .label {
    color: #4B576F;
    letter-spacing: -0.0001em;
  }
  .main-loans-section {
    label {
      color: #788193;
    }
  }
</style>
