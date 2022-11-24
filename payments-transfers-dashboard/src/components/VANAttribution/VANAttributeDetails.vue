<template>
  <div class="container-fluid">
    <div class="row my-4 d-flex flex-align-center">
      <div class="col-10">
        <h2 v-if="userSelectedData.userFound">List of Customer Loans</h2>
        <h2 v-else>Resolve Transfers</h2>
      </div>
      <div class="col-2 float-right">
        <button type="submit" class="btn rupeek-btn btn-block p-2" @click="goBack()">Go Back</button>
      </div>
    </div>
    <div v-if="userSelectedData.userFound">
      <div v-for="(loansRow, loansRowIndex) in loansRows" :key="loansRowIndex" class="mb-4">
        <vue-good-table ref="table" :columns="loansColumns" :rows="loansRow" :pagination-options="{ enabled: false}" theme="black-rhino">
          <template slot="table-column" slot-scope="props">
            <span v-if="props.column.field ==='actions'">{{loansRowIndex + 1 }}</span>
          </template>
          <template slot="table-row" slot-scope="props">
            <span v-if="props.column.field === 'actions'">
              <div class="custom-control custom-checkbox mb-3">
                <input type="checkbox" class="custom-control-input" :id="`customCheck-${loansRowIndex}-${props.row.originalIndex}`"
                  name="checkbox" @change="userIsSelected(loansRow, loansRowIndex, props.row.originalIndex)"
                  :disabled="props.row.isSelected" :checked="props.row.isCheck">
                <label class="custom-control-label" :for="`customCheck-${loansRowIndex}-${props.row.originalIndex}`"></label>
              </div>
            </span>
            <span v-if="props.column.field === 'loanid'">
              {{props.row.loanid}}
            </span>
            <span v-if="props.column.field === 'losid'">
              {{props.row.coreid}}
            </span>
            <span v-if="props.column.field === 'lenderid'" :class="`${props.row.lender}`">
              {{props.row.lender}}
            </span>
            <span v-if="props.column.field === 'loanamount'">
              {{ props.row.loanamount ? `&#8377; ${(props.row.loanamount).toLocaleString('en-IN')}` : '&#8377; 0'}}
            </span>
            <span v-if="props.column.field === 'balanceamount'">
              {{ props.row.balanceamount ? `&#8377; ${(props.row.balanceamount).toLocaleString('en-IN')}` : '&#8377; 0'}}
            </span>
            <span v-if="props.column.field === 'interestamount'">
              {{ props.row.interest ? `&#8377; ${((props.row.schemedata && props.row.schemedata.cashback) ? props.row.interest - props.row.cashbackamount:props.row.interest).toLocaleString('en-IN')}` : '&#8377; 0'}}
            </span>
            <span v-if="props.column.field === 'closingamount'" class="align-items-center d-flex">
              {{ props.row.closingamount ? `&#8377; ${((props.row.schemedata && props.row.schemedata.cashback) ? props.row.closingamount - props.row.cashbackamount:props.row.closingamount).toLocaleString('en-IN')}` : '&#8377; 0'}}
            </span>
            <span v-if="props.column.field === 'netweight'">
              {{props.row.netweight}}
            </span>
          </template>
        </vue-good-table>
      </div>
      <div role="tablist">
        <b-card no-body class="my-3" v-for="(loan, indexValue) in selectedLoans" :key="indexValue">
          <b-card-header header-tag="header" class="p-0 border-0" role="tab">
            <b-button block href="#" v-b-toggle="`accordion-${indexValue}`" class="text-capitalize text-left btn-rupeek">
              Payments Attribution Form
            </b-button>
          </b-card-header>
          <b-collapse :id="'accordion-'+indexValue" visible accordion="my-accordion" role="tabpanel">
            <b-card-body>
              <!--form block starts-->
              <form class="payment-data-form">
                <div class="px-0 row m-0">
                  <div class="d-flex align-items-center p-2 col-5">
                    <label for="selectLender" class="col-4 px-0">Main lender Type
                      <sup class="important">*</sup>
                    </label>
                    <select class="select-dropdown ml-4 date-style form-control col-6 text-capitalize" @change='userUpdatedValues()' v-model="loan.lender">
                      <option v-for="(option, lenderIndex) in lenderOptions" :key="lenderIndex" :value="option.value">
                        {{option.name}}
                      </option>
                    </select>
                  </div>
                  <div class="d-flex align-items-center p-2 offset-1 col-5">
                    <label for="selectPaymentType" class="col-6 px-0">
                      Select Payment Type
                      <sup class="important">*</sup>
                    </label>
                    <select class="select-dropdown ml-4 date-style form-control col-6 text-capitalize"  v-model="loan.paymentType" @change="selectedPaymentType(indexValue)">
                      <option v-for="(paytype, paymentsindex) in paymentsTypes" :key="paymentsindex" :value="paytype.type">
                        {{paytype.name}}
                      </option>
                    </select>
                  </div>
                  <div class="d-flex align-items-center p-2 col-5">
                    <label for="amntPaid" class="col-4 px-0">
                      Amount Paid
                      <sup class="important">*</sup>
                    </label>
                    <input type="number" placeholder="Enter Amount" v-model="loan.loanAmount" disabled class="date-style form-control ml-4 py-2 px-3 col-6"/>
                  </div>
                  <div class="d-flex align-items-center p-2 offset-1 col-5">
                    <label for="transactionDate" class="col-6 px-0">
                      Transaction Date
                      <sup class="important">*</sup>
                    </label>
                    <input type="date" class="date-style form-control ml-4 py-2 px-3 col-6" @change='userUpdatedValues()' v-model="loan.date" :max="new Date().toISOString().split('T')[0]"/>
                  </div>
                  <div class="d-flex align-items-center col-12 p-2">
                    <label for="Description" class="col-2 px-0">Description
                      <sup class="important">*</sup>
                    </label>
                    <textarea cols="3" rows="3" placeholder="Write the description here" class="form-control py-2 px-3 col-9" v-model="loan.description"></textarea>
                  </div>
                </div>
                <!--payment data block starts-->
                <div class="table px-2" id="#table">
                  <h4 class="mb-4">Payment Data</h4>
                  <div class="table-layout col-12 px-0">
                    <div class="table-header d-flex border-bottom">
                      <div class="col-3 border-right py-2">
                        <label class="table-label">Lender</label>
                        <sup class="important top-up">*</sup>
                      </div>
                      <div class="col-4 border-right py-2">
                        <label class="table-label">Loan Id</label>
                        <sup class="important top-up">*</sup>
                      </div>
                      <div class="col-4 border-right py-2">
                        <label class="table-label">Amount Paid</label>
                        <sup class="important top-up">*</sup>
                      </div>
                      <div class="col-1 pr-0 py-2">
                        <button type="button" class="icon-round add-btn" @click="addNewRowInPaymentTable(indexValue)">+</button>
                      </div>
                    </div>
                    <ul class="row-table-data d-flex flex-wrap">
                      <li v-for="(input, fieldindex) in loan.fieldItems" :key="fieldindex" class="col-12 px-0 d-flex border-bottom">
                        <div class="col-3 border-right py-3 position-relative">
                          <select class="select-dropdown date-style form-control w-100 text-capitalize" v-model="input.selectLender" @change='userUpdatedValues()'>
                            <option v-for="(option, lenderIndex) in lenderOptions" :key="lenderIndex" :value="option.value">
                              {{option.name}}
                            </option>
                          </select>
                        </div>
                        <div class="col-4 border-right py-3">
                          <input type="text" class="px-3 date-style form-control" placeholder="Enter Loan ID" v-model="input.loanId" @change='userUpdatedValues()'/>
                        </div>
                        <div class="col-4 border-right py-3">
                          <input type="text" class="px-3 date-style form-control" placeholder="Enter Amount Paid" v-model="input.paidAmount" @change='userUpdatedValues()'/>
                        </div>
                        <div class="col-1 pr-0 py-3">
                          <button type="button" class="icon-round remove-btn" @click="deleteRowInPaymentTable(indexValue, fieldindex)" :disabled="loan.fieldItems.length === 1">-</button>
                        </div>
                      </li>
                    </ul>
                    <div class="text-right">
                      <button type="button" class="validate-btn" @click="buildPaymentAPIParams()" :class="{'submit':buttonText === 'Submit'}" :disabled="!loan.description">{{buttonText}}</button>
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
    <div v-else>
      <ResolveTransfers :userSelectedData="userSelectedData" v-on:goToVanAttribution="goBack"></ResolveTransfers>
    </div>
  </div>
</template>

<script>

import moment from 'moment';
import { VueGoodTable } from 'vue-good-table';
import { mapGetters } from 'vuex';
import ResolveTransfers from '@/components/VANAttribution/ResolveTransfers';
import constants from '../../constants';
import {
  getcustomerloans, validatingLoans, updatePaymentCustomer, getPaymentStageInfo,
} from '../../api/VANAttribution.api';

export default {
  name: 'VANAttributeDetails',
  components: {
    VueGoodTable,
    ResolveTransfers,
  },
  props: {
    userSelectedData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      // Array is used to store user selected loans
      selectedLoans: [],
      // Array is used to store loans columns data
      loansColumns: constants.consolidatedPendingColumns,
      // Array is used to store payment type
      paymentsTypes: constants.paymentsTypes,
      // Array is used to store loans rows data
      loansRows: [],
      // variable is used to store button text
      buttonText: 'Validate',
      // variable is used to store count
      count: 0,
      // Array is used to store payment stage info data
      paymentStageInfo: [],
      // Array is used to store user selected loans indexs values
      selectedLoansIndexs: [],
    };
  },
  computed: {
    ...mapGetters({
      lenderOptions: 'data/getLenderOptions',
    }),
  },
  methods: {
    // Moment function
    moment(data) {
      return moment(data);
    },
    // Function call for go back the van attribution conponents
    goBack() {
      this.$emit('goBack', false);
    },
    // Function call for updating the buttion text if user is change any value in the form
    userUpdatedValues() {
      this.buttonText = 'Validate';
    },
    // API call to get the customer loans
    getCustomerLoans() {
      // Object is used to store the customer phone number
      const tempObj = {};
      tempObj.phone = this.userSelectedData.contactno;
      getcustomerloans(tempObj).then((response) => {
        if (response.data.user.loans.length >= 1) {
          // Function call for clear selected flag and put default 'false'
          this.clearSelectedFlag(response.data.user.loans);
        } else {
          this.$noty.error(response.data.UserMsg);
        }
      }).catch((err) => {
        this.$noty.error(err.response.data.error.error_message);
      });
      if (this.userSelectedData.activeTab === 'paymentNotResolved') {
        // API call for get interest and closing amount based on RPK ID
        this.getPaymentStageInfo();
      }
    },
    // API call for get interest and closing amount based on RPK ID
    getPaymentStageInfo() {
      const tempObj = {
        requestid: this.userSelectedData.order_id,
      };
      getPaymentStageInfo(tempObj)
        .then((response) => {
          this.paymentStageInfo = response.data.response.data;
        }).catch((err) => {
          this.$noty.error(err.response.data.error.error_message);
        });
    },
    // Function call for clear selected flag and put default 'false'
    clearSelectedFlag(loans) {
      this.loansRows = loans.map((key) => {
        key.map((loan) => {
          const loanDetails = loan;
          loanDetails.isSelected = false;
          loanDetails.isCheck = false;
          return loanDetails;
        });
        return key;
      });
    },
    // Function call to add new row when we click on '+' mark and change button text
    addNewRowInPaymentTable(index) {
      this.buttonText = 'Validate';
      this.selectedLoans[index].fieldItems.push({});
    },
    // Function call to delete the row when we click on '-' mark and change button text
    deleteRowInPaymentTable(index, fieldindex) {
      this.buttonText = 'Validate';
      this.selectedLoans[index].fieldItems.splice(fieldindex, 1);
    },
    // Function call for user selecte loan
    userIsSelected(selectedLoan, loansRowIndex, selectedLoanIndex) {
      // Function call to seleted data push to selected loans array and if uncheck remove the value in selected loans array
      this.addMoreLoansToSelectedLoans(selectedLoan[selectedLoanIndex], (`${loansRowIndex}${selectedLoanIndex}`));
      if (this.selectedLoansIndexs.indexOf(`${loansRowIndex}${selectedLoanIndex}`) === -1) {
        this.selectedLoansIndexs.push(`${loansRowIndex}${selectedLoanIndex}`);
        selectedLoan.map((key, loanIndex) => {
          if (loanIndex !== selectedLoanIndex && (!key.netweight) && key.lender === 'Rupeek' && !key.isCheck) {
            this.loansRows.map((loan, rowsIndex) => {
              if (+rowsIndex === +loansRowIndex) {
                loan.map((loanData, loanDataIndex) => {
                  const loanDetails = loanData;
                  if (+loanDataIndex === +selectedLoanIndex || ((!loanDetails.netweight) && loanDetails.lender === 'Rupeek')) {
                    loanDetails.isCheck = true;
                  }
                  return loanDetails;
                });
              }
              return loan;
            });
            // Function call to seleted data push to selected loans array and if uncheck remove the value in selected loans array
            this.addMoreLoansToSelectedLoans(key, (`${loansRowIndex}${loanIndex}`));
          }
          return true;
        });
      }
      if (!this.selectedLoans.length) {
        this.selectedLoansIndexs = [];
      }
    },
    // Function call to seleted data push to selected loans array and if uncheck remove the value in selected loans array
    addMoreLoansToSelectedLoans(selectedData, index) {
      let isSameLender = false;
      let isChecked = true;
      // Function call to check lenders
      this.checkingLender(selectedData, this.count);
      // if checking selectedLoans array is empty or not
      if (this.selectedLoans.length) {
        this.selectedLoans.map((key) => {
          const selectedLoan = key;
          // checking the index value if find the same index value then remove loan
          if (selectedLoan.indexList.indexOf(index) !== -1) {
            if (selectedLoan.fieldItems.length === 1) {
              // Function call for clear selected flag and put default 'false'
              this.clearSelectedFlag(this.loansRows);
              this.selectedLoans = [];
              this.count = 0;
            }
            selectedLoan.fieldItems = selectedLoan.fieldItems.filter(removeData => +removeData.index !== +index);
            selectedLoan.indexList = selectedLoan.indexList.filter(removeData => +removeData !== +index);
            isChecked = false;
            // else checking lenders if same lenders updating the values
          } else if ((selectedLoan.lender === selectedData.lender || (selectedData.netweight >= 0))) {
            selectedLoan.indexList.push(index);
            const data = {
              selectLender: selectedData.lender.toLowerCase(),
              loanId: selectedData.loanid,
              interest: 0,
              closingAmount: 0,
              index,
            };
            selectedLoan.fieldItems.push(data);
            isSameLender = true;
            this.count = 1;
          }
          return selectedLoan;
        });
        // function call for set interest and closing amount based on payments stage info
        this.setInterestClosingAmount();
      }
      // if checking the isChecked and isSameLender then pushing the loan details to selectedLoans array
      if (isChecked && !isSameLender) {
        const paymentData = {
          selectLender: selectedData.lender.toLowerCase(),
          loanId: selectedData.loanid,
          interest: 0,
          closingAmount: 0,
          index,
        };
        const loans = {
          loanAmount: this.userSelectedData.amount,
          lender: selectedData.lender.toLowerCase(),
          date: moment().format('YYYY-MM-DD'),
          paymentType: 'interest',
          fieldItems: [paymentData],
          indexList: [index],
        };
        this.selectedLoans.push(loans);
        this.count = 1;
        // function call for set interest and closing amount based on payments stage info
        this.setInterestClosingAmount();
      }
    },
    // Function call to check lender and disabled other lender
    checkingLender(selectedData, count) {
      this.loansRows.map((key) => {
        key.map((loan) => {
          const loans = loan;
          if (count === 0) {
            loans.isSelected = (loans.netweight > 0 && loans.lender !== selectedData.lender);
          }
          return loans;
        });
        return key;
      });
    },
    // Function call to user will selected payments type loan amount change based on payment type
    selectedPaymentType(index) {
      this.buttonText = 'Validate';
      this.selectedLoans.map((selected, selectedIndex) => {
        const select = selected;
        if (selectedIndex === index) {
          this.setDefaultPaidAmount(select);
        }
        return select;
      });
    },
    // Function call to populate the paid amount based on payment type
    setDefaultPaidAmount(select) {
      select.fieldItems.map((data) => {
        const loan = data;
        if (select.paymentType === 'interest') {
          loan.paidAmount = loan.interest;
        } else if (select.paymentType === 'closing') {
          loan.paidAmount = loan.closingAmount;
        } else {
          loan.paidAmount = 0;
        }
        return loan;
      });
    },
    // function call for set interest and closing amount based on payments stage info
    setInterestClosingAmount() {
      this.selectedLoans.map((key) => {
        key.fieldItems.map((data) => {
          const item = data;
          if (this.paymentStageInfo.length) {
            this.paymentStageInfo.map((payInfo) => {
              if (item.loanId === payInfo.loanid) {
                item.interest = payInfo.interestamount - payInfo.cashbackgiven;
                item.closingAmount = payInfo.closingamount - payInfo.cashbackgiven;
              }
              return true;
            });
          }
          item.paidAmount = item.interest;
          return item;
        });
        return key;
      });
    },
    // function call to creat body for validate and update API and call the validate API are update API
    buildPaymentAPIParams() {
      // Object is used to store payment data
      let paymentDataObj = {};
      this.selectedLoans.map((loan) => {
        paymentDataObj = {
          lender: [(loan.lender).toLowerCase()],
          paymentamount: loan.loanAmount,
          description: loan.description ? loan.description : '',
          type: (loan.paymentType).toLowerCase(),
          txn_date: moment(loan.date).format('DD/MM/YYYY'),
          paymentdata: {
            loans: [],
          },
        };
        let paymentLoan = {};
        loan.fieldItems.map((key) => {
          paymentLoan = {
            lender: (key.selectLender).toLowerCase(),
            loanid: key.loanId,
            // convert to string to number using +
            paidamount: +key.paidAmount,
          };
          // Object store the paymentLoanObject object
          const tempObj = Object.assign({}, paymentLoan);
          paymentDataObj.paymentdata.loans.push(tempObj);
          return paymentLoan;
        });
        return paymentDataObj;
      });
      // if checking the button text if text will be 'submit' call to updatepayments API else call to validatingData API
      if (this.buttonText === 'Submit') {
        // API call to submit the data
        this.updatePaymentCustomer(paymentDataObj);
      } else {
        // API call to validate the data
        this.validatingData(paymentDataObj);
      }
    },
    // API call to validate the data
    validatingData(paymentDataObj) {
      validatingLoans(paymentDataObj).then((response) => {
        if (response.data.response.isValid) {
          this.buttonText = 'Submit';
        } else {
          this.$noty.error(response.data.response.message);
        }
      }).catch((err) => {
        this.$noty.error(err.response.data.error.error_message);
      });
    },
    // API call to submit the data
    updatePaymentCustomer(paymentDataObj) {
      const paymentObj = paymentDataObj;
      paymentObj.rzp_pay_id = this.userSelectedData.pay_id ? this.userSelectedData.pay_id : this.userSelectedData.paymentid;
      updatePaymentCustomer(paymentObj).then(() => {
        this.$emit('goBack', false);
      }).catch((err) => {
        this.$noty.error(err.response.data.error.error_message);
      });
    },
  },
  mounted() {
    if (this.userSelectedData.userFound) {
      // API call to get the customer loans
      this.getCustomerLoans();
    }
  },
};
</script>
<style scoped>

.Federal, .Rupeek {
  text-transform: capitalize;
}
.Kvb, .Icici {
  text-transform: uppercase;
}
</style>
