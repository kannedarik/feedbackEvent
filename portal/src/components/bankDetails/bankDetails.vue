<script>
import { sendEvent } from '../../utils/clevertap/EventTracker';
import events from '../../utils/clevertap/eventconstants';
import store from '../../store';
import {
  getCustomerBankDetails,
  updateCustomerBankDetails,
  checkVerificationStatus,
} from '../../api/repledge.api';

export default {
  data() {
    return {
      // Object to store selected Account details
      selectedAccount: {},
      // Array to store account list
      AccountList: [],
      // Boolean is used to dispaly add another account form
      isAddAnotherAccount: false,
      // Boolean is used to check checkbox is checked or not
      isChecked: false,
      // variable to store order id
      orderId: '',
      // variable to store edit account index
      indexValue: null,
      // variable to store pending account entry attempts
      pendingAccountEntryAttempts: null,
      // variable to store IFSC reg
      regIFSC: /^[A-Za-z]{4}0[0-9]{6}$/,
    };
  },
  computed: {
    // function call validate IFSC Code
    validateIfscCode() {
      let isInvalidIFSCCode = false;
      if (!this.selectedAccount.ifsc) {
        isInvalidIFSCCode = false;
      } else if (!(this.selectedAccount.ifsc
      && this.selectedAccount.ifsc.match(this.regIFSC))) {
        isInvalidIFSCCode = true;
      } else {
        isInvalidIFSCCode = false;
      }
      return isInvalidIFSCCode;
    },
    // function call validate bank account number
    validateAccountNumber() {
      let isInvalidAccount = false;
      if (!this.selectedAccount.accountNumber) {
        isInvalidAccount = false;
      } else if (!(this.selectedAccount.accountNumber
        && this.selectedAccount.accountNumber.match(/^[0-9]{5,22}$/))) {
        isInvalidAccount = true;
      } else {
        isInvalidAccount = false;
      }
      return isInvalidAccount;
    },
    // function call check add new account disable
    checkDisable() {
      let isDisable = true;
      if (!(this.selectedAccount.ifsc
      && this.selectedAccount.ifsc.match(this.regIFSC))
      || !(this.selectedAccount.accountNumber
      && this.selectedAccount.accountNumber.match(/^[0-9]{5,22}$/))
      || (!this.selectedAccount.beneficiaryName)
      || !(this.selectedAccount.bankName)) {
        isDisable = true;
      } else {
        isDisable = false;
      }
      return isDisable;
    },
  },
  methods: {
    // function go back main screen
    toBack() {
      this.$router.push('/dashboard');
    },
    // function call to dispaly add account form
    addAnotherAccount() {
      this.selectedAccount = {};
      this.isAddAnotherAccount = true;
      this.indexValue = null;
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_BANK_ADD_NEW_ACCOUNT_FLOATING_CLICKED,
      };
      sendEvent(events.screen.BANK_DETAILS, events.category.PAYMENT, properties);
    },
    // API call get customer bank details
    async getCustomerBankDetails() {
      try {
        const response = await getCustomerBankDetails();
        this.AccountList = response.data.accounts.map((key) => {
          const data = key;
          data.isDisplay = true;
          return data;
        });
      } catch (error) {
        this.$noty.error(error.message);
      }
    },
    // API call verify bank account and update bank details
    async bankAccountVerify() {
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_BANK_CONTINUE_CLICKED,
      };
      sendEvent(events.screen.BANK_DETAILS, events.category.PAYMENT, properties);
      this.pendingAccountEntryAttempts = null;
      if (Object.keys(this.selectedAccount).length) {
        const data = {
          orderId: this.orderId,
          bankAccount: {
            ifsc: this.selectedAccount.ifsc,
            accountNumber: this.selectedAccount.accountNumber,
            beneficiaryName: this.selectedAccount.beneficiaryName,
          },
        };
        try {
          const response = await updateCustomerBankDetails(data);
          this.pendingAccountEntryAttempts = response.data.pendingAccountEntryAttempts;
          // function call to check account status based on status move to next screen
          this.checkStatus(response.data.accounts);
        } catch (error) {
          this.$noty.error(error.message);
        }
      } else {
        this.$noty.error('Selecte/Added Bank Account!');
      }
    },
    // API call to verify penny testing status
    async checkVerificationStatus(transactionId) {
      try {
        const response = await checkVerificationStatus(transactionId);
        this.pendingAccountEntryAttempts = response.data.pendingAccountEntryAttempts;
        // function call to check account status based on status move to next screen
        this.checkStatus(response.data.accounts);
      } catch (error) {
        this.$noty.error(error.message);
      }
    },
    // function call to check account status based on status move to next screen
    checkStatus(account) {
      if ((account.status).toLowerCase() === 'verification_successful') {
        this.$router.push({ name: 'paymentStatus', params: { orderid: this.orderId } });
      } else if (account.status.toLowerCase() === 'otp_sent') {
        const selectedAccountDetails = this.selectedAccount;
        selectedAccountDetails.bankTransactionId = account.transactionId;
        store.dispatch('data/setSelectedAccount', selectedAccountDetails);
        this.$router.push({ name: 'bankAccountVerify', params: { id: this.orderId } });
      } else if (account.status.toLowerCase() === 'verification_pending') {
        store.dispatch('loader/setLoading', { esign: false, loader: true });
        setTimeout(() => { this.checkVerificationStatus(account.transactionId); }, 10000);
      } else if (this.pendingAccountEntryAttempts > 0) {
        this.$refs.otpVerifyModal.show();
        const properties = {
          [events.EVENT_NAME]: events.PAYMENT_BANK_VERIFICATION_FAILED_POPUP,
        };
        sendEvent(events.screen.BANK_DETAILS, events.category.PAYMENT, properties);
      } else if (this.pendingAccountEntryAttempts <= 0) {
        this.$router.push({ name: 'paymentStatus', params: { orderid: this.orderId } });
      }
    },
    // function call click edit account
    editAccount(accounts, index) {
      /* the function call to check if check any other account
        is editing then remove that account in editing.
      */
      this.chackingAccountDisplay();
      this.indexValue = index;
      // function call to edit selected account
      this.chackingAccountDisplay();
      this.isAddAnotherAccount = true;
      this.selectedAccount = {
        ifsc: accounts.ifsc ? accounts.ifsc : '--',
        accountNumber: accounts.accountNumber ? accounts.accountNumber : '--',
        beneficiaryName: accounts.beneficiaryName ? accounts.beneficiaryName : '--',
        bankName: accounts.bankName ? accounts.bankName : '--',
      };
    },
    // function click cancel edit account button
    cancelEditAccount() {
      // function call to remove edit account
      this.chackingAccountDisplay();
      this.indexValue = null;
    },
    // function call to edit/remove selected account
    chackingAccountDisplay() {
      this.isAddAnotherAccount = false;
      this.AccountList.map((key, accountsIndex) => {
        const data = key;
        if (this.indexValue === accountsIndex) {
          data.isDisplay = !data.isDisplay;
        }
        return data;
      });
    },
    // function call add new account
    AddNewAccount() {
      const data = this.selectedAccount;
      data.isDisplay = true;
      this.AccountList.push(data);
      this.isAddAnotherAccount = false;
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_BANK_ADD_ACCOUNT_CLICKED,
      };
      sendEvent(events.screen.BANK_DETAILS, events.category.PAYMENT, properties);
    },
    // function call to retry new account
    retry() {
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_BANK_VERIFICATION_FAILED_POPUP_RETRY_CLICKED,
      };
      sendEvent(events.screen.BANK_DETAILS, events.category.PAYMENT, properties);
      this.$refs.otpVerifyModal.hide();
    },
    checkBoxClicked() {
      this.isChecked = true;
      const properties = {
        [events.EVENT_NAME]: events.PAYMENT_BANK_CHECKBOX_CLICKED,
      };
      sendEvent(events.screen.BANK_DETAILS, events.category.PAYMENT, properties);
    },
  },
  mounted() {
    const properties = {
      [events.EVENT_NAME]: events.PAYMENT_BANK_VERIFICATION_LIST_PAGE,
    };
    sendEvent(events.screen.BANK_DETAILS, events.category.PAYMENT, properties);
    this.orderId = this.$route.params.id;
    // API call get customer bank details
    this.getCustomerBankDetails();
  },
};
</script>
