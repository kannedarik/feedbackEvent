<!-- eslint-disable max-len -->
<template>
  <div class="renewal-summary-card">
    <div class="loan-details">
      <div class="summary-row">
        <div class="renewal-number-of-loans receipt-component">
          <div>
            Number of Loans
            <b-icon-info-circle class="info-icon" id="info-number-of-loans"
              @click="toggleNumberOfLoansHint()"/>
            <b-popover target="info-number-of-loans" triggers="click" placement="top"
              custom-class="summary-popover" :show.sync="showNumberOfLoansHint">
              <div class="flex justify-between items-baseline">
                <h2>Selected Loans</h2>
                <div>
                  <img src="@/assets/icons/closing_block_icon.svg" alt="close icon"
                    @click="showNumberOfLoansHint = false">
                </div>
              </div>
              <div v-for="(repledgeLoan, index) in summaryOptions.loans.selectedLoans"
                :key="index">
                <div class="flex justify-between loan-row">
                  <div>
                    <h3>{{repledgeLoan.lenders}}</h3>
                    <p class="mt-1">Loan Date : {{repledgeLoan.loanDate}}</p>
                  </div>
                  <div class="flex flex-row justify-between">
                    <h2 class="mr-1">{{toRupeeAmount(repledgeLoan.loanAmount).currency}}</h2>
                    <h2>{{toRupeeAmount(repledgeLoan.loanAmount).amount}}</h2>
                  </div>
                </div>
              </div>
            </b-popover>
          </div>
        </div>
        <div class="renewal-number-of-loans">
          {{summaryOptions.loans.numberOfLoans}}
        </div>
      </div>
      <div class="summary-row">
        <div class="receipt-component">
          Total Current Loan
        </div>
        <div class="amount">
          {{toRupeeAmount(summaryOptions.totalCurrentLoanAmount).currency}}
          {{toRupeeAmount(summaryOptions.totalCurrentLoanAmount).amount}}
        </div>
      </div>
      <div class="summary-row pb-0">
        <div class="receipt-component">
          <div>
            <p>Total New Loan</p>
          </div>
        </div>
        <div class="amount">
          {{toRupeeAmount(summaryOptions.totalNewLoanAmount).currency}}
          {{toRupeeAmount(summaryOptions.totalNewLoanAmount).amount}}
        </div>
      </div>
      <div class="summary-row m-0 pt-0">
        <div class="receipt-component">
          <p> (calculated as per today’s gold rate)</p>
        </div>
      </div>
      <div class="summary-row" v-if="summaryOptions.isTopupOptionSelected">
        <div class="receipt-component">
          <div>
            Total Topup Amount
            <b-icon-info-circle class="info-icon" id="info-top-up-amount" />
            <b-popover target="info-top-up-amount" triggers="click" placement="top" custom-class="summary-popover">
              <div class="d-flex">
                <div><img src="@/assets/icons/icon_info_Orange.svg" class="mr-2" alt="info"></div>
                <div>Top up amount shown is post adjusting the existing loan outstanding.</div>
              </div>
            </b-popover>
          </div>
        </div>
        <div :class="summaryOptions.totalTopUpAmount > 0 ? 'amount text-success' : 'amount'">
          {{toRupeeAmount(summaryOptions.totalTopUpAmount).currency}}
          {{toRupeeAmount(summaryOptions.totalTopUpAmount).amount}}
        </div>
      </div>
    </div>
    <div class="receipt-details">
      <div class="summary-row">
          <div class="receipt-component renewal-payable">
            PAYABLE
          </div>
      </div>
      <div class="summary-row pb-0"
        v-if="summaryOptions.totalDifferenceAmount !== 0 && summaryOptions.totalAmountPayable !== 0 && totalPayableAmountCheck">
        <div class="receipt-component">
          <div>
            Gold Price Adjustment
            <b-icon-info-circle class="info-icon" id="info-difference-amount" @click="toggleGoldPriceAdjustmentHint()"/>
            <b-popover target="info-difference-amount" triggers="click" placement="top" custom-class="summary-popover" :show.sync="showGoldPriceAdjustmentHint">
              <div class="d-flex justify-content-between align-items-baseline">
                <h3>{{summaryOptions.assets.title}}</h3>
                <div><img src="@/assets/icons/closing_block_icon.svg" alt="close icon" @click="showGoldPriceAdjustmentHint = false"></div>
              </div>
              <div>{{summaryOptions.assets.description}}</div>
            </b-popover>
          </div>
        </div>
        <div class="amount">
          <span v-if="summaryOptions.totalDifferenceAmount < 0">-</span>
          {{toRupeeAmount(summaryOptions.totalDifferenceAmount).currency}}
          {{toRupeeAmount(Math.abs(summaryOptions.totalDifferenceAmount)).amount}}
        </div>
      </div>
      <div class="summary-row m-0 py-0 pr-0" style="height:72px"
        v-if="summaryOptions.totalDifferenceAmount !== 0
          && summaryOptions.assets.showGoldPriceAdjustmentThumbnail
          && totalPayableAmountCheck">
        <div class="receipt-component player">
          <div class="video_container">
            <img :src="summaryOptions.assets.thumbnailImageUrl" class="imageThumbnail" />
            <PlayButton @PlayVideo="openVideoPlayer()" :isVideoBanner="false"/>
            <div class="duration-chip">{{summaryOptions.assets.duration}}</div>
          </div>
          <VideoPlayerModal
            :assets="summaryOptions.assets"
            @videoPlayerClosed="isVideoPlayerOpened = false"
            v-if="isVideoPlayerOpened"
          />
        </div>
      </div>
      <div class="summary-row pb-0">
        <div class="receipt-component">
          <div>
            Total Interest Amount
            <b-icon-info-circle class="info-icon" id="info-total-interest-amount" @click="toggleTotalInterestAmountHint()"/>
            <b-popover target="info-total-interest-amount" triggers="click" placement="top" custom-class="summary-popover" :show.sync="showTotalInterestAmountHint">
              <div class="d-flex">
                <div>
                  <img src="@/assets/icons/icon_info_Orange.svg" class="mr-2" alt="info">
                </div>
                <div>
                  {{summaryOptions.nextWorkingDaysText}}
                </div>
              </div>
            </b-popover>
          </div>
        </div>
        <div class="amount">
          {{toRupeeAmount(summaryOptions.totalInterestAmount).currency}}
          {{
            toRupeeAmount(totalPayableAmountCheck
            ? summaryOptions.totalInterestAmount : 0).amount
          }}
        </div>
      </div>
      <div class="summary-row pb-0" v-if="summaryOptions.processingFee > 0 && summaryOptions.totalAmountPayable !== 0">
        <div class="receipt-component">
          Processing Fee
        </div>
        <div class="amount">
          {{toRupeeAmount(summaryOptions.processingFee).currency}}
          {{toRupeeAmount(summaryOptions.processingFee).amount}}
        </div>
      </div>
      <div class="summary-row pb-0" v-if="summaryOptions.excessFundingAmount > 0 && summaryOptions.totalAmountPayable !== 0">
        <div class="receipt-component">
          Excess Funding
        </div>
        <div class="amount">
          {{toRupeeAmount(summaryOptions.excessFundingAmount).currency}}
          {{toRupeeAmount(summaryOptions.excessFundingAmount).amount}}
        </div>
      </div>
      <div class="summary-row pb-0" v-if="summaryOptions.lenderRenewalCharges > 0 && summaryOptions.totalAmountPayable !== 0 && summaryOptions.renewalForICICILender">
        <div class="receipt-component">
          Lender Renewal Charges
        </div>
        <div class="amount">
          {{toRupeeAmount(summaryOptions.lenderRenewalCharges).currency}}
          {{toRupeeAmount(summaryOptions.lenderRenewalCharges).amount}}
        </div>
      </div>
      <div class="summary-row summary-total mt-3">
        <div class="total-receipt-component">
          Total Amount Payable
        </div>
        <div class="total-amount">
          {{toRupeeAmount(summaryOptions.totalAmountPayable).currency}}
          {{
            toRupeeAmount(totalPayableAmountCheck ? summaryOptions.totalAmountPayable : 0).amount
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { BIconInfoCircle } from 'bootstrap-vue';
import VideoPlayerModal from '@/components/ReleaseTracker/VideoInfo/VideoPlayerModal.vue';
import PlayButton from '@/components/ReleaseTracker/VideoInfo/PlayButton.vue';
import events from '@/utils/clevertap/eventconstants';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import { toRupeeAmount } from '@/utils/string';

export default {
  name: 'RenewalSummaryCard',
  data() {
    return {
      showGoldPriceAdjustmentHint: false,
      showNumberOfLoansHint: false,
      showTotalInterestAmountHint: false,
      isVideoPlayerOpened: false,
    };
  },
  props: {
    summaryOptions: null,
  },
  computed: {
    totalPayableAmountCheck() {
      return this.summaryOptions.totalAmountPayable >= 100;
    },
  },
  components: {
    BIconInfoCircle,
    VideoPlayerModal,
    PlayButton,
  },
  methods: {
    openVideoPlayer() {
      this.isVideoPlayerOpened = true;
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_GOLD_PRICE_ADJUSTMENT_THUMBNAIL_CLICKED,
      };
      sendEvent(events.screen.VIDEO_PLAYER_MODAL, events.category.PAYMENT, properties);
    },
    toggleNumberOfLoansHint() {
      if (!this.showNumberOfLoansHint) {
        const properties = {
          [events.EVENT_NAME]: events.PAYMENT_RENEWAL_I_ICON_CLICKED,
        };
        sendEvent(events.screen.RENEWAL_SUMMARY_CARD, events.category.PAYMENT, properties);
      }
      this.showNumberOfLoansHint = !this.showNumberOfLoansHint;
    },
    toggleGoldPriceAdjustmentHint() {
      if (!this.showGoldPriceAdjustmentHint) {
        const properties = {
          [events.EVENT_NAME]: events.PAYMENT_GOLD_PRICE_ADJUSTMENT_INFO_CLICKED,
        };
        sendEvent(events.screen.RENEWAL_SUMMARY_CARD, events.category.PAYMENT, properties);
      }
      this.showGoldPriceAdjustmentHint = !this.showGoldPriceAdjustmentHint;
    },
    toggleTotalInterestAmountHint() {
      if (!this.showTotalInterestAmountHint) {
        const properties = {
          [events.EVENT_NAME]: events.PAYMENT_TOTAL_INTEREST_AMOUNT_INFO_CLICKED,
        };
        sendEvent(events.screen.RENEWAL_SUMMARY_CARD, events.category.PAYMENT, properties);
      }
      this.showTotalInterestAmountHint = !this.showTotalInterestAmountHint;
    },
    toRupeeAmount(number) {
      const { amount, currency } = toRupeeAmount(number);
      const formattedAmount = { amount, currency };
      if (amount === '--') {
        formattedAmount.amount = 0;
      }
      return formattedAmount;
    },
  },
};
</script>

<style lang="scss" scoped>
.summary-popover {
  width: 350px;
  padding: 10px;
  box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.16);
  border: solid 1px #cccccc;
  background-color: #fafafa;
  .loan-row {
    border-bottom: 1px dashed #cccccc;
    padding: 8px 0;
  }
  h2 {
    color: #484848;
    font-size: 16px;
    margin-bottom: 10px;
  }
  h3 {
    color: #484848;
    font-size: 12px;
  }
  p {
    color:#484848;
    font-size: 9px;
  }
  @media screen and (min-width: 961px){
    h2 {
      font-size: 20px;
    }
    h3 {
      font-size: 14px;
    }
    p {
      font-size: 12px;
    }
  }
}
.player {
  position: relative;
  .video_container {
    position: absolute;
    top:0;
    left:-15px;
    height: 72px;
    width: 220px;
    .imageThumbnail {
      height: 80px;
      width: 225px;
      border-radius: 8px;
    }
    .duration-chip {
      background: rgba(196, 196, 196, 0.3);
      border-radius: 4px;
      width: 36px;
      height: 19px;
      position: absolute;
      bottom: 5px;
      right: 10px;
      z-index: 50;
      color: #fff;
      font-size: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0.7;
    }
  }
}
</style>
