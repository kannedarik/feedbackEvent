<template>
  <div class="container-fluid">
    <div v-if="!showLoanDetails">
      <div class="row m-0 d-flex flex-align-bottom">
        <div class="col-10">
          <div class="row">
            <div class="col-3">
              <div class="fields_div">
                <label>Phone Number</label>
                <input class="date-style form-control" v-model="phoneNumber" placeholder="Phone Number" type="text"/>
              </div>
            </div>
            <div class="col-3">
              <div class="fields_div">
                <label>Payment Id</label>
                <input class="date-style form-control" v-model="paymentId" placeholder="Payment Id" type="text"/>
              </div>
            </div>
            <div class="col-3">
              <div class="fields_div">
                <label>From Date</label>
                <input type="date" class="date-style form-control" v-model="fromDate"/>
              </div>
            </div>
            <div class="col-3">
              <div class="fields_div">
                <label>To Date</label>
                <input type="date" class="date-style form-control" v-model="toDate"/>
              </div>
            </div>
          </div>
        </div>
        <div class="col-2">
          <button type="submit" class="btn rupeek-btn btn-block mt-bt" @click="filedByCustomer()">Submit</button>
        </div>
      </div>
      <div>
        <b-card no-body class="my-3">
          <b-tabs pills card class="van-payments">
            <b-tab title="Payment Not Resolved" @click="getUnsuccesfulTransfers">
              <vue-good-table
                :columns="unsuccesfulTransfersColumns"
                :rows="unsuccesfulTransfersRows"
                :search-options="{ enabled: false}"
                :sort-options="{ enabled: false }"
                :fixed-header="true"
                @on-page-change="onPageChange"
                :pagination-options="{ enabled: true}"
                :totalRows="totalRecords">
                <template slot="table-row" slot-scope="props">
                  <span v-if="props.column.field === 'paymentrequestid'">
                    <b-badge variant="info" class="p-2 btn-info" @click="showPaymentFetch({'requestid':props.row.order_id})">{{props.row.order_id}}</b-badge>
                  </span>
                  <span v-if="props.column.field === 'payid'">
                    {{props.row.pay_id}}
                  </span>
                  <span v-if="props.column.field === 'customername'">
                    {{props.row.name}}
                  </span>
                  <span v-if="props.column.field === 'phoneNumber'">
                    {{props.row.contactno}}
                  </span>
                  <span v-if="props.column.field === 'dateofpayments'">
                    {{moment(props.row.createdat).utc().format('DD-MM-YYYY hh:mm a')}}
                  </span>
                  <span v-if="props.column.field === 'payamount'">
                    {{props.row.amount ? `&#8377; ${(props.row.amount).toLocaleString('en-IN')}` : '-'}}
                  </span>
                  <span v-if="props.column.field === 'paymenttype'" class="text-capitalize">
                    {{props.row.type}}
                  </span>
                  <span v-if="props.column.field === 'actions'">
                    <b-button class="btn-outline-rupeek"  @click="viewDetails(props.row)">View</b-button>
                  </span>
                </template>
              </vue-good-table>
            </b-tab>
            <b-tab title="Disputed VAN Payment" @click="disputedVANPayment">
              <vue-good-table
                :columns="vanPayment"
                :rows="disputedVanPayment"
                :search-options="{ enabled: false}"
                :sort-options="{ enabled: false }"
                :fixed-header="true"
                @on-page-change="onPageChange"
                :pagination-options="{ enabled: true}"
                :totalRows="disputedTotalRecords">
                <template slot="table-row" slot-scope="disputedProps">
                  <span v-if="disputedProps.column.field === 'payid'">
                    {{disputedProps.row.paymentid}}
                  </span>
                  <span v-if="disputedProps.column.field === 'dateofpayments'">
                    {{moment(disputedProps.row.createdAt).utc().format('DD-MM-YYYY hh:mm a')}}
                  </span>
                  <span v-if="disputedProps.column.field === 'payamount'">
                    {{disputedProps.row.amount ? `&#8377; ${(disputedProps.row.amount).toLocaleString('en-IN')}` : '-'}}
                  </span>
                  <span v-if="disputedProps.column.field === 'actions'">
                    <b-button class="btn-outline-rupeek"  @click="checkPhoneNumber(disputedProps.row)">Link Phone</b-button>
                  </span>
                </template>
              </vue-good-table>
            </b-tab>
            <b-tab title="Temp VAN Transfers" @click="tempVANPayment">
              <vue-good-table
                :columns="vanPayment"
                :rows="tempVanPayment"
                :search-options="{ enabled: false}"
                :sort-options="{ enabled: false }"
                @on-page-change="onPageChange"
                :pagination-options="{ enabled: true}"
                :totalRows="tempTotalRecords">
                <template slot="table-row" slot-scope="tempProps">
                  <span v-if="tempProps.column.field === 'payid'">
                    {{tempProps.row.paymentid}}
                  </span>
                  <span v-if="tempProps.column.field === 'dateofpayments'">
                    {{moment(tempProps.row.createdAt).utc().format('DD-MM-YYYY hh:mm a')}}
                  </span>
                  <span v-if="tempProps.column.field === 'payamount'">
                    {{tempProps.row.amount ? `&#8377; ${(tempProps.row.amount).toLocaleString('en-IN')}` : '-'}}
                  </span>
                  <span v-if="tempProps.column.field === 'actions'">
                    <b-button class="btn-outline-rupeek"  @click="checkPhoneNumber(tempProps.row)">Link Phone</b-button>
                  </span>
                </template>
              </vue-good-table>
            </b-tab>
          </b-tabs>
        </b-card>
      </div>
    </div>
    <div v-else>
      <VANAttributeDetails v-if="showLoanDetails" :userSelectedData='userSelectedData' v-on:goBack='closeLoanDetails($event)'></VANAttributeDetails>
    </div>
    <b-modal id="transferModal" ref="transferModal" centered hide-footer hide-header>
      <!-- close button -->
      <button type="button" aria-label="Close" class="close" @click="$bvModal.hide('transferModal')">
        <img src="../../assets/img/error-checked.png" alt="close" width="30"/>
      </button>
      <b-table striped hover borderless class="m-0" :items="transferMapping"></b-table>
      <div class="footer mt-3" v-if="transferMappingReasoning">
        <!-- <h4>Reasoning</h4> -->
        <p>{{transferMappingReasoning}}</p>
      </div>
    </b-modal>

    <b-modal id="vanPaymentModal" size="sm" ref="vanPaymentModal" title="fill the phone number" centered hide-footer no-close-on-backdrop>
      <div>
        <div class="header p-0 pb-3 border-0">
          <!-- close button -->
          <button type="button" aria-label="Close" class="close" @click="closeModal">
            <img src="../../assets/img/error-checked.png" alt="close" width="25"/>
          </button>
        </div>
        <b-form @submit="onSubmitMobile" class="phone-number position-relative">
          <span>+91</span>
          <b-form-input type="tel" maxlength="10" minlength="10" autofocus v-model="mobileNumber" required placeholder="Enter Phone number">
          </b-form-input>
          <b-button type="submit" class="btn rupeek-btn mt-3 px-4 py-2 float-right text-lowercase" :disabled="!(mobileNumber.length === 10) ">submit</b-button>
        </b-form>
      </div>
    </b-modal>
  </div>
</template>

<script>
/* eslint-disable no-underscore-dangle */
import { VueGoodTable } from 'vue-good-table';
// importing moment for date and time manipulations
import moment from 'moment';
import { mapActions } from 'vuex';
import VANAttributeDetails from '@/components/VANAttribution/VANAttributeDetails';
import {
  getUnsuccesfulTransfers, getPaymentsfetch, getUnlinkedVanPayment, getTempVanPayment, checkUserLoans,
} from '../../api/VANAttribution.api';
import constants from '../../constants';

export default {
  name: 'vanattribution',
  data() {
    return {
      // variable is used to store phone number
      phoneNumber: '',
      // variable is used to store payment id
      paymentId: '',
      // string is used to store user selected end date
      toDate: moment().format('YYYY-MM-DD'),
      // string is used to store user selected from date
      fromDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
      // variable used to unsuccesful transfers columns data
      unsuccesfulTransfersColumns: constants.unsuccesfulTransfers,
      // variable is used to store disputed and temp van payment Columns data
      vanPayment: constants.vanPayment,
      // variable used to unsuccesful transfers rows data
      unsuccesfulTransfersRows: [],
      // boolean is used display the van attribution details component
      showLoanDetails: false,
      // Object is used to store user selected data
      userSelectedData: {},
      // variable used to store unsuccesful transfers total records
      totalRecords: 0,
      // variable used to store disputed payments total records
      disputedTotalRecords: 0,
      // variable used to store temp transfers total records
      tempTotalRecords: 0,
      // Object is used to store server side pagination
      serverParams: {
        page: 1,
        perPage: 10,
      },
      // Array is used to store transfer mapping data
      transferMapping: [],
      // Variable is used to store reason for transder mapping
      transferMappingReasoning: '',
      // Array is used to store disputed van payments data
      disputedVanPayment: [],
      // Array is used to store temp van payments data
      tempVanPayment: [],
      // Variable is used to store Mobile number
      mobileNumber: '',
      // Variable is used to store active tab name
      activeTab: 'paymentNotResolved',
      // Object body for storing filter data which will be appended to API
      requestObj: {},
    };
  },
  components: {
    VueGoodTable,
    VANAttributeDetails,
  },
  methods: {
    ...mapActions({
      getLenderOptions: 'data/getLenderOptions',
    }),
    // Moment function
    moment(data) {
      return moment(data);
    },
    // Function call to view the van attribution details component
    viewDetails(data) {
      this.showLoanDetails = true;
      this.userSelectedData = data;
      this.userSelectedData.userFound = true;
      this.userSelectedData.activeTab = this.activeTab;
    },
    // Function call to close the van attribution details component
    closeLoanDetails(eventData) {
      this.showLoanDetails = eventData;
      // API call for get unsuccessfulTrancsfers data
      this.getUnsuccesfulTransfers();
      this.userSelectedData = {};
    },
    // function call to submit filter data on submit
    filedByCustomer() {
      this.requestObj = {
        phoneno: this.phoneNumber,
        orderid: this.paymentId,
        datestart: moment(this.fromDate).format('YYYY-MM-DD'),
        dateend: moment(this.toDate).format('YYYY-MM-DD'),
      };
      if (this.activeTab === 'paymentNotResolved') {
        // API call for get unsuccessfulTrancsfers data
        this.getUnsuccesfulTransfers();
      } else if (this.activeTab === 'disputedVANPayment') {
        // API call for get disputed van payments data
        this.disputedVANPayment();
      } else if (this.activeTab === 'tempVANTransfers') {
        // API call for get temp van payments data
        this.tempVANPayment();
      }
    },
    // API call for get unsuccessfulTrancsfers data
    getUnsuccesfulTransfers() {
      this.activeTab = 'paymentNotResolved';
      /* Checking phone Number format
       * API will be called either phone number is blank or in 10 digit format
       */
      if (this.phoneNumber === '' || this.phoneNumber.match(/^\d{10}$/)) {
        getUnsuccesfulTransfers(this.requestObj).then((response) => {
          this.totalRecords = response.data.response.length;
          this.unsuccesfulTransfersRows = response.data.response;
        }).catch((err) => {
          this.$noty.error(err.response.data.error.error_message);
        });
      }
    },
    // function call for pagination in vue good table
    updateParams(newProps) {
      this.serverParams = Object.assign({}, this.serverParams, newProps);
    },
    // Function call for change the next page
    onPageChange(params) {
      // function call for pagination in vue good table
      this.updateParams({ page: params.currentPage });
      // API call for get unsuccessfulTrancsfers data
      this.getUnsuccesfulTransfers();
    },
    // API call for fetch the transfer mapping data based on RPK ID
    showPaymentFetch(data) {
      this.transferMapping = [];
      getPaymentsfetch(data)
        .then((response) => {
          if (response.status === 200) {
            this.$refs.transferModal.show();
            this.transferMappingReasoning = response.data.response.reasoning;
            response.data.response.transferMapping.map((key) => {
              const transfers = {
                lender_id: key.lenderid,
                _cellVariants: { lender_id: key.lenderid },
                loan_id: key.loanid,
                amount: key.amount,
              };
              this.transferMapping.push(transfers);
              return this.transferMapping;
            });
          }
        }).catch((err) => {
          this.$noty.error(err.response.data.error.error_message);
        });
    },
    // API call for get disputed van payments data
    disputedVANPayment() {
      this.activeTab = 'disputedVANPayment';
      /* Checking phone Number format
       * API will be called either phone number is blank or in 10 digit format
       */
      if (this.phoneNumber === '' || this.phoneNumber.match(/^\d{10}$/)) {
        getUnlinkedVanPayment(this.requestObj)
          .then((response) => {
            if (response.status === 200) {
              this.disputedTotalRecords = response.data.response.length;
              this.disputedVanPayment = response.data.response;
            }
          }).catch((err) => {
            this.$noty.error(err.response.data.error.error_message);
          });
      }
    },
    // API call for get temp van payments data
    tempVANPayment() {
      this.activeTab = 'tempVANTransfers';
      /* Checking phone Number format
       * API will be called either phone number is blank or in 10 digit format
       */
      if (this.phoneNumber === '' || this.phoneNumber.match(/^\d{10}$/)) {
        getTempVanPayment(this.requestObj)
          .then((response) => {
            if (response.status === 200) {
              this.tempTotalRecords = response.data.response.length;
              this.tempVanPayment = response.data.response;
            }
          }).catch((err) => {
            this.$noty.error(err.response.data.error.error_message);
          });
      }
    },
    // function call for link the mobile number to loan
    checkPhoneNumber(data) {
      this.userSelectedData = data;
      this.$refs.vanPaymentModal.show();
    },
    // Function call for submit the Mobile number in modal
    onSubmitMobile(evt) {
      evt.preventDefault();
      /* Checking phone Number format
       * API will be called either phone number is blank or in 10 digit format
       */
      if (this.mobileNumber === '' || this.mobileNumber.match(/^\d{10}$/)) {
        const tempObj = {
          phone: this.mobileNumber,
        };
        this.userSelectedData.contactno = this.mobileNumber;
        checkUserLoans(tempObj)
          .then((response) => {
            if (response.data.response) {
              this.userSelectedData.userFound = true;
              this.userSelectedData.activeTab = this.activeTab;
            } else {
              this.userSelectedData.userFound = false;
            }
            this.$refs.vanPaymentModal.hide();
            this.mobileNumber = '';
            this.showLoanDetails = true;
          }).catch((err) => {
            this.$noty.error(err.response.data.error.error_message);
          });
      } else {
        this.$noty.error('Please enter valide phone number');
      }
    },
    // Function call for close the modal
    closeModal() {
      this.$refs.vanPaymentModal.hide();
      this.mobileNumber = '';
    },
  },
  mounted() {
    this.getLenderOptions();
    // Calling function to fetch default table data
    this.filedByCustomer();
  },
};
</script>
<style lang="scss">
@import '../../scss/components/VANAttribution.scss';
</style>
