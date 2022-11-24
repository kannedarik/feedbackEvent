<template>
  <div>
    <div class="payments-body">
      <Container :screenType="'body-bg'">
        <div class="header-main p-6 mt-2">
          <div class="md:flex md:items-center">
            <div>
              <img src="@/assets/icons/left_arrow.svg" alt="back_arrows"
                class="cursor-pointer" @click="toBack"/>
            </div>
            <div class="sm:mt-3 md:mt-0 md:ml-3">
              <h2 class="font-semibold text-lg">
                {{$t('select_your_bank_account')}}
              </h2>
            </div>
          </div>
        </div>
        <div class="esign-container p-0 d-flex flex-wrap align-content-between">
          <div class="offset-lg-2 col-lg-8 col-md-12 px-4 py-3">
            <p class="mb-3 select-bank-text">
              <span>
                {{$t('receive_top_up_amount')}}
              </span>
            </p>
            <div class="payment-options" v-for="(accounts, index) in AccountList" :key="index">
              <div class="d-flex align-items-center w-100" v-if="accounts.isDisplay">
                <label class="form-check-label cursor-pointer"
                :for="`bankName-${index}-${accounts.bankName}`"
                :class="{'active' : selectedAccount === accounts}">
                  <div class="d-flex align-items-center py-2 border-bottom">
                    <span class="ml-1">
                      {{$t('account_holder_name')}}
                    </span>
                    <p class="bold-font">
                      {{accounts.beneficiaryName ? accounts.beneficiaryName : '--'}}
                    </p>
                  </div>
                  <div class="d-flex align-items-center py-2 border-bottom">
                    <span class="ml-1">
                      {{$t('bank_name')}}
                    </span>
                    <p class="bold-font">
                      {{accounts.bankName ? accounts.bankName : '--'}}
                    </p>
                  </div>
                  <div class="d-flex align-items-center py-2 border-bottom">
                    <span class="ml-1">
                      {{$t('account_number')}}
                    </span>
                    <p class="bold-font">
                      {{accounts.accountNumber
                      ? accounts.accountNumber.replace(/\d(?=\d{4})/g, "*") : '--'}}
                    </p>
                  </div>
                  <div class="d-flex align-items-center py-2">
                    <span class="ml-1">
                      {{$t('ifsc')}}
                    </span>
                    <p class="bold-font">
                      {{accounts.ifsc ? accounts.ifsc : '--'}}
                    </p>
                  </div>
                </label>
                <div>
                  <div class="edit-option cursor-pointer"
                    @click="editAccount(accounts, index)" v-if="!accounts.verified">
                    <img src="@/assets/icons/edit_icon.svg" alt="edit_icon"/>
                  </div>
                  <div class="radio-button-wrapper d-flex align-items-center">
                    <input type="radio" class="form-check-input cursor-pointer" :value="accounts"
                    v-model="selectedAccount" :id="`bankName-${index}-${accounts.bankName}`"
                    name="bankDetails" :checked="+index === 0"
                    @change="chackingAccountDisplay"/>
                    <div class="radio-button"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="new-bank-details mt-4" v-if="isAddAnotherAccount">
              <b-container fluid class="p-0">
                <b-row class="my-1 p-0 mx-0 d-flex align-items-center">
                  <b-col cols="4 p-0">
                    <label class="m-0" for="account-holder-name">
                      {{$t('account_holder_name')}}
                    </label>
                  </b-col>
                  <b-col offset="1" cols="7 p-0">
                    <b-form-input id="account-holder-name" type="text" placeholder="Name Surname"
                      v-model="selectedAccount.beneficiaryName"></b-form-input>
                  </b-col>
                </b-row>
                <b-row class="my-1 p-0 mx-0 d-flex align-items-center">
                  <b-col cols="4 p-0">
                    <label class="m-0" for="bank-name">
                      {{$t('bank_name')}}
                    </label>
                  </b-col>
                  <b-col offset="1" cols="7 p-0">
                    <b-form-input id="bank-name" type="text"
                    placeholder="Type Bank Name" v-model="selectedAccount.bankName"></b-form-input>
                  </b-col>
                </b-row>
                <b-row class="my-1 p-0 mx-0 d-flex align-items-center">
                  <b-col cols="4 p-0">
                    <label class="m-0" for="account-number">
                      {{$t('account_number')}}
                    </label>
                  </b-col>
                  <b-col offset="1" cols="7 p-0">
                    <b-form-input id="account-number" type="text" placeholder="12341234"
                      v-model="selectedAccount.accountNumber" min="5" maxlength="22"
                      :class="{'error-message' : validateAccountNumber}">
                    </b-form-input>
                      <span id="account-number" class="font-12 error-message"
                      v-if="validateAccountNumber">
                        Number of digits must be between 5 to 22 digits
                      </span>
                  </b-col>
                </b-row>
                <b-row class="my-1 p-0 mx-0 d-flex align-items-center">
                  <b-col cols="4 p-0">
                    <label class="m-0" for="ifsc-code">
                      {{$t('ifsc')}} <br><span>(Min char count - 11)</span>
                    </label>
                  </b-col>
                  <b-col offset="1" cols="7 p-0">
                    <b-form-input id="ifsc-code" type="text" placeholder="Ex SBI76007123"
                      min="0" maxlength="11" v-model="selectedAccount.ifsc"
                      :class="{'error-message' : validateIfscCode}">
                    </b-form-input>
                    <span class="font-12 error-message" v-if="validateIfscCode">
                      Invalid IFSC code
                    </span>
                  </b-col>
                </b-row>
              </b-container>
            </div>
            <div class="pt-4 text-center" v-if="!isAddAnotherAccount">
              <button class="btn btn-primary-rupeek btn-add" @click="addAnotherAccount">
                Add another bank account
              </button>
            </div>
            <div class="pt-4 text-center" v-if="isAddAnotherAccount">
              <button class="btn btn-primary-rupeek w-35 mr-md-5 btn-add"
              @click="cancelEditAccount">
                {{$t('cancel')}}
              </button>
            </div>
          </div>
        </div>
      </Container>
    </div>
    <div class="footer-new">
      <Container>
        <div class="confirm-bank-details p-6" v-if="!isAddAnotherAccount">
          <h4 class="pb-3 bold-font">Confirm Bank account</h4>
          <div class="d-flex">
            <label class="container-checkbox pl-4">
              <input type="checkbox" @click="checkBoxClicked"/>
              <span class="checkmark cursor-pointer"></span>
            </label>
            <p class="ml-3 confirm-info bold-font">
              I hereby confirm that I have verified / provided the bank account details
              where you may transfer my top up loan amount.<br>
              I indemnify RFPL from any claims or disputes arising,
              or which may arise in this regard
            </p>
          </div>
        </div>
        <div class="py-2 px-4 md:p-7 d-flex col-sm col-sm-auto justify-content-end">
          <button class="btn-primary-rupeek px-5 py-2" @click="bankAccountVerify"
            :class="{'disabled-btn':!isChecked || !Object.keys(selectedAccount).length}"
            v-if="!isAddAnotherAccount">
            {{ $t("continue") }}
          </button>
          <button class="btn-primary-rupeek px-5 py-2" v-else @click="AddNewAccount"
          :class="{'disabled-btn': checkDisable}">
            {{ $t("add_account") }}
          </button>
        </div>
      </Container>
    </div>
    <b-modal id="otpVerifyModal" ref="otpVerifyModal" class="text-center"
    size="sm" centered no-close-on-esc no-close-on-backdrop
    hide-header-close hide-header hide-footer>
      <div class="otp-verifyed">
        <img class="mb-2" src="@/assets/icons/icon_Fail.svg" alt="fail icon"/>
        <h3>Bank Account<br>Verification Failed</h3>
        <span class="py-2 d-block messages">Please check all the details<br>and try again</span>
        <button class="btn btn-primary-rupeek my-3 border-none" @click="retry()">
          Retry
          <span v-if="pendingAccountEntryAttempts > 0">
            {{(pendingAccountEntryAttempts)}}
          </span>
          <span v-if="pendingAccountEntryAttempts <= 0">
            (0)
          </span>
        </button>
      </div>
    </b-modal>
  </div>
</template>
<script>
import bankDetails from '@/components/bankDetails/bankDetails.vue';
import Container from '@/components/CommonComponents/Container.vue';

export default {
  extends: bankDetails,
  components: {
    Container,
  },
};
</script>
<style scoped lang="scss">
@import "../../scss/common/_mixins.scss";
.footer-new {
  position: fixed;
  bottom: 0;
  width: 100%;
}
.w-35 {
  width: 35% !important;
}
.error-message {
  color: #ff0000 !important;
}
.font-12 {
  font-size: 12px;
}
.w-60 {
  width: 60%;
}
.header {
  p {
    font-weight: 600;
    line-height: 1.69;
  }
}
.btn-primary {
  &.disabled {
    pointer-events: none;
    opacity: 0.5;
  }
}
.bank-details {
  padding-bottom: 7rem;
 .header{
    width: 100%;
    margin-top: 25px;
 }
}
.select-bank-text {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.93;
}
.esign-container {
  .esign-status-card {
    border-radius: 7px;
    padding: 20px;
    .status-text {
      font-size: 12px;
    }
    &.completed {
      background-color: #fff8ef;
      .status-text {
        color: #55bb7d;
      }
      img {
        width: 24px;
      }
    }
    &.active {
      border: solid 1px #fe9411;
      background-color: #ffffff;
      .status-text {
        color: #969696;
      }
    }
    &.disabled {
      opacity: 0.7;
      border: none;
      background-color: #f2f2f2;
      pointer-events: none;
      .status-text {
        color: #969696;
      }
    }
    .icon {
      margin-right: 10px;
    }
  }
}
.payment-options {
  margin-bottom: 16px;
  position: relative;
  .form-check-label {
    line-height: 1.83;
    width: 80%;
    margin-right: 30px;
    padding: 10px 20px 10px 17px;
    border-radius: 7px;
    box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.08);
    background-color: #ffffff;
    border: 1px solid transparent;
    &.active {
      border-color: #fe9411;
    }
    span {
      font-size: 10px;
      color: #727272;
      width: 60%;
    }
    p {
      font-size: 12px;
      width: 40%;
    }
  }
  .radio-button-wrapper {
    input:checked ~ .radio-button {
      border-color: #fe9411;
      background-color: transparent;
    }
    .radio-button {
      background-color: #c1c1c1;
      border-color: #fafafa;
      &::after {
        width: 8px;
        height: 8px;
      }
    }
  }
  &.active {
    border-color: $theme-color;
    box-shadow: 0 0 4px 0 rgba(254, 148, 17, 0.5);
  }
  &.disabled {
    pointer-events: none;
    background-color: $form-element-border;
    border-color: $form-element-border;
    .radio-button {
      // border-color: $theme-color;
      &:after {
        background-color: $secondary-color;
      }
    }
  }
  .info-icon-wrapper {
    pointer-events: initial;
  }
  .edit-option {
    position: relative;
    top: -60px;
  }
}
.new-bank-details {
  padding: 16px 16px 17px 17px;
  border-radius: 4px;
  border: solid 1px #fe9411;
  background-color: #ffffff;
  label {
    font-size: 10px;
    color:#727272;
    span {
      font-size: 12px;
      color:#c7c7c7;
      font-style: italic;
    }
  }
  input {
    display: block;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    padding: .4rem;
    border: none;
    border-radius: 0;
    background-color: #fefefe;
    font-size: 12px;
    font-weight: bold;
    color: #484848;
    border-bottom: 1px solid;
    height: 45px;
    &.form-control:focus {
      box-shadow: none;
    }
    &::placeholder {
      color: #c7c7c7;
      opacity: 1; /* Firefox */
    }
    &:-ms-input-placeholder { /* Internet Explorer 10-11 */
      color: #c7c7c7;
    }
    &::-ms-input-placeholder { /* Microsoft Edge */
      color: #c7c7c7;
    }
  }
}
.confirm-bank-details {
  background-color: #faf9f9;
  h4 {
    font-size: 16px;
    line-height: 1.38;
  }
  .confirm-info {
    font-size: 12px;
    color: #969696;
  }
}
@media only screen and (min-width: 768px) {
  .bank-details {
    .btn-add {
      border-radius: 6px;
      width: 80%;
    }
  }
}
</style>
