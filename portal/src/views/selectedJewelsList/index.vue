<template>
  <div>
    <div class="payments-body">
      <Container :screenType="'body-bg'">
        <div class="header sm:px-4 sm:py-4 md:p-6 mt-2">
          <div class="md:flex md:items-center">
            <div>
              <img src="@/assets/icons/left_arrow.svg" alt="back_arrows"
                class="cursor-pointer" @click="backToJewels()"/>
            </div>
            <div class="mt-4 md:mt-0 md:ml-4">
              <h1 class="font-semibold">
                {{$t('selected_jewels')}}
              </h1>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap my-4 jewels-selection px-4">
          <JewelsCard
            :loanInfo="{
              showCheckBox: false,
              id: 'selected-jewels',
              selectedLoan: false,
            }"
            :jewelsList="{  jewels: jewelsList }"
          />
        </div>
      </Container>
    </div>
    <div class="footer">
      <Container>
        <div class="text-right py-2 px-4 md:p-7 bg-white">
          <button class="float-right btn btn-primary-rupeek text-base px-5 py-3 rounded-full"
            @click="modifyJewels()">
            {{ $t('modify_jewels')}}
          </button>
        </div>
      </Container>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import JewelsCard from '@/components/partRelease/JewelsCard.vue';
import Container from '@/components/CommonComponents/Container.vue';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';
import PaymentType from '@/mixins/PaymentType';

export default {
  name: 'PartialReleaseSummary',
  components: {
    Container,
    JewelsCard,
  },
  computed: {
    ...mapGetters({
      jewelsList: 'jewels/selectedJewelsList',
      orderId: 'jewels/orderId',
      paymentOption: 'loans/paymentOption',
    }),
  },
  mixins: [PaymentType],
  methods: {
    backToJewels() {
      this.$router.push(`/partial-release-summary?orderId=${this.orderId}`);
    },
    modifyJewels() {
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_PART_RELEASE_SUMMARY_PAGE_MODIFY_JEWELS_CLICKED,
      };
      sendEvent(events.screen.PART_RELEASE_SUMMARY, events.category.PAYMENT, properties);
      this.$router.push('/jewels-selection');
    },
  },
  mounted() {
    this.checkPaymentOption();
  },
};
</script>
<style lang='scss'>
  .px-5 {
    padding-left: 1.25rem !important;
    padding-right: 1.25rem !important;
  }
</style>
