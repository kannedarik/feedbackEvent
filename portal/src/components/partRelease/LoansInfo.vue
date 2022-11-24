<template>
  <div class="position-relative">
    <div class="divider-horizontal" v-if="loan.hasShowLenderInfo">
      <div class="divider-text">
        <span class="icon icon-small" v-for="lender in loan.lender"
          :key="lender">
           <img :src="lendersConfig[lender].iconLink" :alt="loan.lender"/>
        </span>
        <h4 class="font-bold text-sm">
          <span v-for="(lender, lenderIndex) in loan.lender" :key="lenderIndex">
            {{lendersConfig[lender].name}}
            <span v-if="lenderIndex !== loan.lender.length - 1">&</span>
          </span>
          ({{loan.branchName}})
        </h4>
      </div>
    </div>
    <template v-if="loan.jewels.length">
      <div class="flex items-center loan-details my-4"
        :class="{'justify-between md:justify-start': loan.isLoanClosure}">
        <p class="font-bold">
          <span class="font-normal">Loan Amount:</span>
          {{formatRupeeAmount(loan.amount)}}
        </p>
        <p class="ml-3 font-bold">
          <span class="font-normal">Date:</span>
          {{moment(loan.loanStartDate).format("DD MMM YYYY")}}
        </p>
        <span class="loan-closure rounded-full md:rounded-lg md:ml-3"
          v-if="loan.isLoanClosure">
          Selected for<br />Loan Closure
        </span>
      </div>
      <InfoMessageWithTitle v-if="((!loan.enableDigitalPartRelease && !_.get(loan, 'auctionAction'))
        || (_.get(loan, 'auctionAction') && _.get(loan, 'auctionAction.message') !== 'none'))"
        :infoMessage="infoMessage(_.get(loan, 'auctionAction.message'))"
      />
      <JewelsCard
        :jewelsList="loan"
        :loanInfo="loanInfo"
      />
    </template>
  </div>
</template>
<script>
import _ from 'lodash';
import moment from 'moment';
import { mapGetters } from 'vuex';
import InfoMessageWithTitle from '@/components/InfoMessagesBoxs/InfoMessageWithTitle.vue';
import infoIcon from '@/assets/icons/additiona_info_red_icon.svg';
import { formatRupeeAmount } from '@/utils/string';
import JewelsCard from './JewelsCard.vue';

export default {
  name: 'JewelsSelection',
  data() {
    return {
      infoIcon,
    };
  },
  props: {
    loan: {
      type: Object,
      required: true,
    },
    loanInfo: {
      type: Object,
      required: true,
    },
  },
  components: {
    InfoMessageWithTitle,
    JewelsCard,
  },
  computed: {
    ...mapGetters({
      lendersConfig: 'loans/lendersConfig',
      actionMessages: 'jewels/actionMessages',
    }),
    _() {
      return _;
    },
  },
  methods: {
    formatRupeeAmount,
    moment: (date) => moment(date),
    infoMessage(type = 'jewels-list-disabled') {
      const messageType = this.actionMessages[type];
      const message = _.get(messageType, 'content.description')
        ? _.get(messageType, 'content.description')
        : _.get(messageType, 'content.message');
      const messageInfo = {
        infoIcon,
        title: '',
        message,
        size: type === 'jewels-list-disabled' ? 'small' : 'very-big',
        hasAuction: true,
      };
      return messageInfo;
    },
  },
};
</script>
