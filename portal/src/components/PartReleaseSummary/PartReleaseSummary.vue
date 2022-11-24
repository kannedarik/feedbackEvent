<template>
  <div>
    <div class="summary-loans mt-4">
      <div class="bg-white md:p-4">
        <div v-for="(orders, oderIndex) in ordersList" :key="oderIndex">
          <div class="px-3" v-for="(item, index) in orders.orderItems"
            :key="index">
            <h2 class="font-bold text-base font-secondary pt-4">
              Loan Details {{ordersList.length >= 2 ? `-${index+1}` : ''}}
            </h2>
            <InfoMessageWithTitle v-if="item.loanType === 'N:1' && item.loanDetails.length > 1"
              :infoMessage="{
                infoIcon: '@/assets/icons/icon_info_Orange.svg',
                title: '',
                message: getMessage(item.loanDetails)
              }"
            />
            <InfoMessageWithTitle
              :infoMessage="schemeChangeInfoMessage"
              v-if="checkSchemeChange(item)" />
            <InfoMessageWithTitle
              :infoMessage="newLoanDetailsMessage" />
            <div class="flex grey-bgnd">
              <LoanSummary
                :loanDetails="item.loanDetails"
                :totalJewelsCount="item.jewelRemaining.length + item.jewelSelected.length"
                :type="'current_loan'"
              />
              <LoanSummary
                :loanDetails="item.newLoanDetails"
                :totalJewelsCount="item.jewelRemaining.length"
                @viewRemainingJewels="viewRemainingJewels($event)"
                :type="'new_loan'"
                v-if="item.newLoanDetails && item.newLoanDetails.length"
              />
            </div>
            <div class="sm:px-3 sm:py-4 md:px-4 md:py-6 text-right m-0">
              <button class="btn-transparent" @click="viewRepledgeLoanDetails(item)">
                {{ $t('view_scheme_details') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import schemesInfo from '@/assets/img/info_icons/schemes_info.svg';
import InfoIcon from '@/assets/icons/additiona_info_icon.svg';
import InfoMessageWithTitle from '@/components/InfoMessagesBoxs/InfoMessageWithTitle.vue';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';
import LoanSummary from './LoanSummary.vue';

export default {
  name: 'PartReleaseSummary',
  components: {
    InfoMessageWithTitle,
    LoanSummary,
  },
  data() {
    return {
      schemeChangeInfoMessage: {
        infoIcon: schemesInfo,
        title: 'scheme_change_details',
        message: 'scheme_change_details_message',
        size: 'big',
      },
      newLoanDetailsMessage: {
        infoIcon: InfoIcon,
        title: '',
        message: 'new_loan_details_message',
        size: 'small',
      },
    };
  },
  props: {
    ordersList: {
      type: Array,
      required: true,
    },
    excessFundingAmount: {
      type: Number,
      required: true,
    },
    payableAmount: {
      type: Number,
      required: true,
    },
  },
  computed: {
    ...mapGetters({
      lendersConfig: 'loans/lendersConfig',
    }),
  },
  methods: {
    checkSchemeChange(item) {
      let isDifferentSchemes = false;
      const currentInterestRate = _.get(item, 'loanDetails[0].schemes.interestCalculation.interestRate');
      const newLoanInterestRate = _.get(item, 'newLoanDetails[0].schemes.interestCalculation.interestRate');
      isDifferentSchemes = currentInterestRate !== newLoanInterestRate;
      return isDifferentSchemes;
    },
    showSelectedJewels() {
      const properties = {
        [events.EVENT_NAME]:
          events.PAYMENT_PART_RELEASE_SUMMARY_PAGE_VIEW_SELECTED_JEWELS_CLICKED,
      };
      sendEvent(events.screen.PART_RELEASE_SUMMARY, events.category.PAYMENT, properties);
      this.$router.push('/selected-jewels-list');
    },
    // for viewing the repledge loan details
    viewRepledgeLoanDetails(loandata) {
      const properties = {
        [events.EVENT_NAME]:
          events.PAYMENT_PART_RELEASE_SUMMARY_PAGE_VIEW_SCHEME_DETAILS_CLICKED,
      };
      sendEvent(events.screen.PART_RELEASE_SUMMARY, events.category.PAYMENT, properties);
      this.$router.push({
        name: 'PartialReleaseDetails',
        params: {
          jewelsInDetails: loandata,
          orderId: this.$route.query.orderId,
        },
      });
    },
    getMessage(loanDetails) {
      return `The loan you have selected consists of both "${this.lendersConfig[loanDetails[0].lender].name}} 6M" and "${this.lendersConfig[loanDetails[1].lender].name}} SGL" loan components`;
    },
    viewRemainingJewels(data) {
      this.$emit('viewRemainingJewels', data);
    },
  },
};
</script>
<style lang='scss'>
  @import '@/scss/payments-summary/payments-summary.scss';
   .grey-bgnd {
    background-color: $grey-color;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    .current-loan {
      border-right: 1px solid $white-color;
    }
    h4 {
      font-size: 12px;
      color: $secondary-color;
    }
    .loan-amount-card {
      border: 1px dashed $unselected-radio-button-color;
      border-radius: 6px;
      min-height: 70px;
      h2 {
        font-size : 15px;
      }
      p {
        font-size: 12px;
        color: #788193;
      }
    }
    .card-min-height {
      min-height: 70px;
    }
    .loan-card {
      border-radius: 7px;
      box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.25);
      background: $white-color;
      margin-top: 8px;
      .get-more-amount {
        color: $theme-color;
        font-size: 12px;
      }
      label {
        color: $tertiary-color;
        font-size: 12px;
      }
      h5 {
        color: #1E2D4B;
        font-size: 14px;
        small{
          color: $secondary-color;
        }
      }
      .slab-container {
        p {
          color: $tertiary-color;
          font-size: 11px;
        }
        .slab-header{
          font-size: 12px;
          color: $tertiary-color;
        }
        .days {
          font-size: 12px;
          color: $tertiary-color;
        }
        .interest-percent {
          font-size: 12px;
          color: $secondary-color;
        }
      }
    }
  }
  .renewal-footer {
    border-top: 2px solid $white-color;
    background-color: rgba(254, 148, 17, 0.1);
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    p {
      font-size: 11px;
      color: $tertiary-color;
    }
    h3 {
      color: $light-blue-color;
      font-size: 13px;
    }
  }
  .loan-details {
    background-color: #fafafa;
    .el-drawer__body {
      padding: 0;
      height: 100vh;
      overflow-y: scroll;
    }
  }
.excess-funding {
  border-radius: 7px;
  box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.25);
  .excess-funding-footer {
    background-color: #fef5e8;
  }
  .bg-grey {
    background-color: #f7f8fa;
  }
  h5 {
    font-size: 10px;
    color: #939496;
  }
}
</style>
