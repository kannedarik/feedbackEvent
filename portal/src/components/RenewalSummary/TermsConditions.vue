<template>
  <div class="bg-white pb-3">
    <div>
      <h1 class="medium-font-weight py-3">
        Terms & Conditions
      </h1>
    </div>
    <div class="flex flex-col gap-4 md:flex-row">
      <div class="repledge-terms-and-conditions p-3"
        v-for="(term, index) in terms" :key="index">
        <div class="mb-1">
          <h5 class="medium-font-weight ">
            <span class="lender-interest-tenure d-flex">
              <span class="icon icon-small">
                <img :src="lendersConfig[term.lender].iconLink" :alt="term.lender"/>
              </span>
              <span class="">{{ lendersConfig[term.lender].name }}</span>
            </span>
          </h5>
        </div>
        <div class="terms-condions-text ">
          <p class="normal-font">
            {{_.get(term, 'terms.terms', "").substring(0, 130)}}
          </p>
          <p class="terms-text bold-font" v-if="_.get(term, 'terms.declarations')">
            Declaration and Undertakings
          </p>
          <p class="terms-text normal-font" v-if="_.get(term, 'terms.declarations')">
            {{_.get(term, 'terms.declarations', "").substring(0, 130)}}
          </p>
          <span @click="showHideTermsAndConditions(term)">Read More...</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import events from '@/utils/clevertap/eventconstants';
import { sendEvent } from '@/utils/clevertap/EventTracker';

export default {
  name: 'termsconditions',
  props: {
    terms: {
      type: Array,
      required: true,
    },
  },
  computed: {
    _() {
      return _;
    },
    ...mapGetters({
      lendersConfig: 'loans/lendersConfig',
    }),
  },
  methods: {
    // showTermsAndConditions
    showHideTermsAndConditions(terms) {
      const lender = terms.lenderName;
      const eventProperty = lender === 'Rupeek'
        ? events.PAYMENT_RENEWAL_READ_MORE_TC_RUPEEK_CLICKED
        : events.PAYMENT_RENEWAL_READ_MORE_TC_LENDER_CLICKED;
      const properties = {
        [events.EVENT_NAME]: eventProperty,
      };
      sendEvent(events.screen.REPLEDGE_LOAN_SUMMARY, events.category.PAYMENT, properties);
      this.$router.push({
        name: 'TermsAndConditions',
        params: { terms },
      });
    },
  },
};
</script>
