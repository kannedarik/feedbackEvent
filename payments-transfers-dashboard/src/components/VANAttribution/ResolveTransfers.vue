<template>
  <div class="container-fluid">
    <div role="tablist">
      <b-card no-body class="my-3">
        <b-card-header header-tag="header" class="p-0 border-0" role="tab">
          <b-button block href="#" v-b-toggle.accordion-user class="text-capitalize text-left btn-rupeek">
            Transfers Attribution Form
          </b-button>
        </b-card-header>
        <b-collapse id="accordion-user" visible accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <!--form block starts-->
            <form class="payment-data-form">
              <div class="px-0 row m-0">
                <div class="d-flex align-items-center p-2 col-5">
                  <label for="amntPaid" class="col-4 px-0">
                    Amount Paid
                    <sup class="important">*</sup>
                  </label>
                  <input type="number" placeholder="Enter Amount" v-model="loanAmount" disabled class="date-style form-control py-2 px-3 col-6"/>
                </div>
              </div>
              <!--payment data block starts-->
              <div class="table px-2 col-7" id="#table">
                <h4 class="mb-4">Payment Data</h4>
                <div class="table-layout col-12 px-0">
                  <div class="table-header d-flex border-bottom">
                    <div class="col-4 border-right py-2">
                      <label class="table-label">Lender</label>
                      <sup class="important top-up">*</sup>
                    </div>
                    <div class="col-6 border-right py-2">
                      <label class="table-label">Amount to be Transferred</label>
                      <sup class="important top-up">*</sup>
                    </div>
                    <div class="col-2 pr-0 py-2">
                      <button type="button" class="icon-round add-btn" @click="addRow()">+</button>
                    </div>
                  </div>
                  <ul class="row-table-data d-flex flex-wrap">
                    <li v-for="(input, index) in fieldItems" :key='index' class="col-12 px-0 d-flex border-bottom">
                      <div class="col-4 border-right py-3 position-relative">
                          <select class="select-dropdown date-style form-control w-100 text-capitalize" v-model="input.lenderid">
                            <option value="null" disabled>Select Lender</option>
                            <option v-for="(option, lenderIndex) in lenderOptions" :key="lenderIndex" :value="option.value">
                              {{option.name}}
                            </option>
                          </select>
                        </div>
                      <div class="col-6 border-right py-3">
                        <input type="text" class="px-3 date-style form-control" placeholder="Enter Amount Paid" v-model="input.amount"/>
                      </div>
                      <div class="col-2 pr-0 py-3">
                        <button type="button" class="icon-round remove-btn" @click="deleteRow(index)" v-if="fieldItems.length > 1">-</button>
                      </div>
                    </li>
                  </ul>
                  <div class="text-right">
                    <button type="button" class="validate-btn" :disabled="buttonText === 'Validate'" @click="createMultiLender()" :class="{'submit':buttonText === 'Submit'}">
                      {{buttonText}}
                    </button>
                  </div>
                </div>
              </div>
              <!--payment data block starts-->
            </form>
            <!--form block ends-->
          </b-card-body>
        </b-collapse>
      </b-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { createMultiLenderTransfers } from '../../api/VANAttribution.api';

export default {
  name: 'resolveTransfers',
  data() {
    return {
      // Variable is used to store loan amount
      loanAmount: Number,
      // Array is used to store user selected details
      fieldItems: [
        {
          lenderid: null,
          amount: null,
        },
      ],
    };
  },
  props: {
    userSelectedData: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters({
      lenderOptions: 'data/getLenderOptions',
    }),
    buttonText() {
      let amount = 0;
      let isValid = true;
      let buttonText = '';
      this.fieldItems.map((key) => {
        amount += +key.amount;
        isValid = (key.lenderid === null);
        return amount;
      });

      if (this.userSelectedData.amount === amount && !isValid) {
        buttonText = 'Submit';
      } else {
        buttonText = 'Validate';
      }
      return buttonText;
    },
  },
  methods: {
    // API call to get the create multi lender
    createMultiLender() {
      const tempObj = {
        payid: this.userSelectedData.paymentid,
        transferMapping: this.fieldItems,
      };
      createMultiLenderTransfers(tempObj)
        .then(() => {
          this.$emit('goToVanAttribution', false);
        })
        .catch((err) => {
          this.$noty.error(err.response.data.error.error_message);
        });
    },
    // add row function when we click on '+' mark
    addRow() {
      this.fieldItems.push({
        lenderid: null,
        amount: null,
      });
    },
    // delete row function when we click on '-' mark
    deleteRow(index) {
      this.fieldItems.splice(index, 1);
    },
  },
  mounted() {
    this.loanAmount = this.userSelectedData.amount;
  },
};
</script>
