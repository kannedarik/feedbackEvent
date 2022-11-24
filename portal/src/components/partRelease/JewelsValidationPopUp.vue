<template>
  <b-modal id="errorMessages" ref="errorMessages" no-close-on-esc
    no-close-on-backdrop centered hide-footer hide-header>
    <div class="header p-3 text-center">
        <img src="@/assets/icons/warning_circle.svg" alt="warning_circle"
          class="mb-2 mx-auto"/>
        <h4>
          <span v-if="validationError.includes('multi_process_pr')">
            Important Information
          </span>
          <span v-else>
            Attention Required
          </span>
        </h4>
        <p class="header-info pt-2 font-bold color-red"
          v-if="validationError.includes('multi_process_pr')">
          Part-release & loan closure cannot be <br />
          performed together.<br />
          Please select either of the options
        </p>
        <p class="inter-font-family text-sm pb-2
          font-secondary white-space-pre-wrap"
          v-if="getHeaderText">
          {{getHeaderText}}
        </p>
      </div>
    <div class="error-messages-body p-3">
        <div v-for="(validation, vIndex) in validatedLoans" :key="vIndex">
          <template v-if="validation.errorCode">
            <div class="coustom-bb" v-if="vIndex !== 0">
              <span v-if="validationError.includes('multi_process_pr')">or</span>
            </div>
            <p class="inter-font-family text-sm pb-2 font-secondary white-space-pre-wrap"
              v-if="validation.header">
              {{validation.header}}
            </p>
            <div class="flex items-center pt-2 justify-between">
              <div :class="[validationError.includes('multi_process_pr') ? 'w-3/5' : 'w-full ']">
                <div v-for="(mainLoan, mainIndex) in validation.loans" :key="mainIndex"
                  :class="{'mt-3': mainIndex !== 0}">
                  <div v-for="(loan, loanIndex) in mainLoan" :key="loanIndex"
                    class="flex items-center" :class="{'pt-3': loanIndex !== 0}">
                    <div class="flex items-inherit lenders p-0"
                      :class="[validationError.includes('multi_process_pr') ? 'w-8/12': 'w-5/12']">
                      <span class="icon icon-small mt-2" v-for="lender in loan.lenders"
                        :key="lender" :class="[loanIndex !== 0 ? 'visibility-hidden': '']">
                        <img :src="lendersConfig[lender].iconLink" :alt="lender"/>
                      </span>
                      <div>
                        <span class="block title" v-if="loanIndex === 0">Loan Amount</span>
                        <span class="font-bold">
                          {{formatRupeeAmount(loan.loanAmount)}}
                        </span>
                      </div>
                    </div>
                    <div class="text-center w-4/12 p-0"
                      v-if="validationError.includes('multi_process_pr')">
                      <span class="title" v-if="loanIndex === 0">Date</span>
                      <span class="block font-bold">
                        {{moment(loan.loanDate).format("DD MMM, YY")}}
                      </span>
                    </div>
                    <div class="text-center w-4/12 p-0"
                      v-if="!validationError.includes('multi_process_pr')">
                      <span class="title" v-if="loanIndex === 0">
                        {{$t('jewels_selected')}}
                      </span>
                      <span class="block font-bold">
                        {{ loan.noOfJewels }}
                      </span>
                    </div>
                    <div class="text-center w-3/12 p-0"
                      v-if="loan.errorCode === 'jewel_weight'">
                      <span class="title" v-if="loanIndex === 0">
                        {{$t('total_weight')}}
                      </span>
                      <span class="font-bold color-red block">
                        {{loan.totalWeight}} Gms
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="validationError.includes('multi_process_pr')">
                <button class="btn btn-primary-rupeek rounded-full"
                  @click="closeLoanPartReleases({type: validation.dialog.positive.label})">
                  {{ validation.dialog.positive.label }}
                </button>
              </div>
            </div>
            <div class="body-info flex items-center p-3 my-3"
              v-if="validation.info || validation.description">
              <div class="info-icon">
                <img src="@/assets/icons/warning_trapezium.svg" alt="warning_trapezium">
              </div>
              <div class="message ml-3">
                <p>
                  {{validation.info ? validation.info : validation.description}}
                </p>
              </div>
            </div>
          </template>
        </div>
      </div>
    <div class="popup-footer p-3">
      <div class="flex items-center justify-between"
        v-if="dialog && dialog.positive && validationError.includes('closure')">
        <button class="btn-rounded-secondary text-sm md:text-base rounded-full w-5/12"
          @click="backToJewels()">
          Cancel
        </button>
        <button class="btn btn-primary-rupeek rounded-full w-1/2 ml-3" @click="addLoanClosure">
          {{ dialog.positive.label }}
        </button>
      </div>
      <div class="text-right" v-else>
        <button class="btn-transparent" @click="backToJewels()">
          Go Back
        </button>
      </div>
      </div>
  </b-modal>
</template>
<script>
import moment from 'moment';
import { mapGetters } from 'vuex';
import { closeLoanPartRelease } from '@/utils/partRelease';
import { formatRupeeAmount } from '@/utils/string';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';

export default {
  name: 'errorMessagesModal',
  props: {
    validatedLoans: {
      type: Array,
      required: true,
    },
    validationError: {
      type: Array,
      required: true,
    },
    dialog: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters({
      lendersConfig: 'loans/lendersConfig',
    }),
    getHeaderText() {
      return this.validatedLoans && this.validatedLoans[0].headerText;
    },
  },
  methods: {
    moment: (date) => moment(date),
    formatRupeeAmount,
    // funtion call to reset modal hide
    closeModal() {
      this.$refs.errorMessages.hide();
    },
    backToJewels() {
      this.closeModal();
      this.$emit('backToJewels');
    },
    addLoanClosure() {
      this.closeModal();
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_ADD_TO_LOAN_CLOSURE_OPTION_CLICKED,
      };
      sendEvent(events.screen.JEWELS_VALIDATION_POPUP, events.category.PAYMENT, properties);
      this.$emit('addLoanClosure');
    },
    closeLoanPartReleases(loan) {
      this.closeModal();
      const tempObj = {
        type: loan.type.replace(/\s+/g, ''),
      };
      let properties = {};
      if (tempObj === 'CloseLoan') {
        properties = {
          [events.EVENT_NAME]: events.PAYMENT_PART_RELEASE_CLOSURE_POPUP_CLOSURE_OPTION_CLICKED,
        };
      } else {
        properties = {
          [events.EVENT_NAME]:
            events.PAYMENT_PART_RELEASE_CLOSURE_POPUP_PART_RELEASE_OPTION_CLICKED,
        };
      }
      sendEvent(events.screen.JEWELS_VALIDATION_POPUP, events.category.PAYMENT, properties);
      closeLoanPartRelease(tempObj);
    },
  },
  mounted() {
    this.$refs.errorMessages.show();
    const properties = {
      [events.EVENT_NAME]: events.JEWEL_SELECTION_ERROR_POPUP,
      [events.PAYMENT_ERROR_TAGS]: this.validationError.join(','),
    };
    sendEvent(events.screen.JEWELS_VALIDATION_POPUP, events.category.PAYMENT, properties);
  },
};
</script>
<style lang='scss' scoped>
.errorMessages {
  .header {
    background-color: #fff8ef;
    border-radius: 7px;
    font-weight: 700;
    font-size: 1.0625rem;
    color: #484848;
  }
}
.color-red {
  color: #e20000;
}
.body-info {
  background: #FEF6E6;
  border: 1px solid #FBC441;
  border-radius: 4px;
  .message {
    font-size: 12px;
    color: #727272;
  }
}
.header h4 {
  font-weight: bold;
  font-size: 1.0625rem;
  color: #484848;
}
.popup-footer {
  border-top: solid 1px #e5e5e5;
}
.coustom-bb {
  width: 100%;
  text-align: center;
  border-bottom: 1px solid #f5f5f5;
  line-height: 0.1em;
  margin: 20px 0;
  span {
    background:#fff;
    padding:0 20px;
  }
}
.error-messages-body {
  @media screen and (max-width: 400px) {
    padding: 1rem;
  }
}
</style>
