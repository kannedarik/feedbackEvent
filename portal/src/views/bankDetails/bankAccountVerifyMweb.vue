<template>
  <div>
    <div class="bank-details" :class="{'bank-details-desktop': ($resize && $mq.above(992))}">
      <div class="esign-container">
        <div class="white-background d-flex align-items-center p-3 header">
          <img src="@/assets/icons/icon_back_grey.svg" alt="back icon" @click="toBack"/>
          <p class="ml-3">Please select your Bank Account</p>
        </div>
        <div class="p-3">
          <div class="new-bank-details mt-3 w-100" v-if="!($resize && $mq.above(992))">
            <div class="d-flex align-items-center py-3 px-2 border-bottom">
              <span>Account Holder Name</span>
              <p class="bold-font">
                {{selectedAccount && selectedAccount.beneficiaryName
                ? selectedAccount.beneficiaryName : '--'}}
              </p>
            </div>
            <div class="d-flex align-items-center py-3 px-2 border-bottom">
              <span>Bank Name</span>
              <p class="bold-font">
                {{selectedAccount && selectedAccount.bankName
                ? selectedAccount.bankName : '--'}}
              </p>
            </div>
            <div class="d-flex align-items-center py-3 px-2 border-bottom">
              <span>Account Number</span>
              <p class="bold-font">
                {{selectedAccount && selectedAccount.accountNumber
                ? selectedAccount.accountNumber : '--'}}
              </p>
            </div>
            <div class="d-flex align-items-center py-3 px-2">
              <span>IFSC</span>
              <p class="bold-font">
                {{selectedAccount && selectedAccount.ifsc
                ? selectedAccount.ifsc : '--'}}
              </p>
            </div>
          </div>
          <div class="otp-section mt-4 mx-auto"
          :class="($resize && $mq.above(992)) ? 'w-40' : 'w-100'">
            <div class="mobile-number">
              <p v-if="!($resize && $mq.above(992))">
                An OTP is sent to +91 {{customerNumber}}.
                Enter the OTP to confirm account details
              </p>
              <h5 class="bold-font" v-if="($resize && $mq.above(992))">
                Enter your OTP
              </h5>
              <p v-if="($resize && $mq.above(992))">
                We have sent you SMS with an OTP to +91 {{customerNumber}}
              </p>
            </div>
            <div class="otp-input-container" :class="{'active': otp, 'error-border' : isWrongOTP}">
              <input type="text" min="0" @keypress="checkSpecialCharacters" maxlength="4"
                placeholder="Enter your OTP here" class="form-control" v-model="otp"/>
                <img src="@/assets/payment-status/ack_pending.svg" alt="ack pending"
                v-if="isWrongOTP && $resize && $mq.above(992)" />
            </div>
            <div v-if="isWrongOTP && !($resize && $mq.above(992))">
              <p class="error-message">Wrong OTP entered </p>
            </div>
            <div v-else-if="isWrongOTP && ($resize && $mq.above(992))">
              <p class="error-message text-right">Invalid OTP Entered</p>
            </div>
            <div class="timer" :class="{ invisible: !timeRemaining }">
              <div class=" d-flex align-items-center justify-content-between">
                <span>Time remaining to enter OTP</span>
                <p>0:{{count}}</p>
              </div>
            </div>
            <div class="request-otp-container" :class="($resize && $mq.above(992))
            ? 'text-center mt-4' : 'mt-3 d-flex align-items-center justify-content-between'">
              <p class="enable-otp cursor-pointer" v-if="!timeRemaining"
              @click="resendOtpToCustomer('sms')">
                <img src="@/assets/otp/message_highlighted.svg" alt="icon" class="mr-1" />
                {{ $t("request_another_otp") }}
              </p>
              <p v-else>
                <img src="@/assets/otp/message_disabled.svg" alt="icon" class="mr-1" />
                {{ $t("request_another_otp") }}
              </p>
              <div class="d-flex justify-content-center align-items-center"
              v-if="$resize && $mq.above(992)">
                <div></div>
                <p class="my-3 mx-2">{{ $t("or") }}</p>
                <div></div>
              </div>
              <div v-else>
                <span>{{ $t("or") }}</span>
              </div>
              <p class="enable-otp cursor-pointer" v-if="!timeRemaining"
              @click="resendOtpToCustomer('call')">
                <img src="@/assets/otp/phone_highlighted.svg" alt="icon" class="mr-1" />
                {{ $t("get_otp_on_call") }}
              </p>
              <p v-else>
                <img src="@/assets/otp/phone_disabled.svg" alt="icon" class="mr-1" />
                {{ $t("get_otp_on_call") }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <footer class="footer position-fixed bottom-0 d-flex justify-content-end w-100">
      <button class="btn-primary-rupeek" :disabled="otp<4" @click="verifiyAccount()">
        {{ $t("submit") }}
      </button>
    </footer>
  </div>
</template>
<script>
import bankAccountVerify from '../../components/bankDetails/bankAccountVerifyMweb.vue';

export default {
  extends: bankAccountVerify,
};
</script>
<style scoped lang="scss">
@import "../../scss/common/_mixins.scss";
.w-40 {
  width: 40%;
}
.header {
  p {
    font-weight: 600;
    line-height: 1.69;
  }
}
.bank-details {
  padding-bottom: 7rem;
  &.bank-details-desktop {
    background-color: #ffffff;
    max-width: 1170px;
    min-width: 980px;
    margin: 0 auto;
    border-radius: 6px;
    -webkit-box-shadow: 0px 3px 10px 0 rgba(0, 0, 0, 0.08);
    box-shadow: 0px 3px 10px 0 rgba(0, 0, 0, 0.08);
    margin-top: 30px;
    .esign-container {
      .header {
        img {
          display: none;
        }
        p {
          font-size: 24px;
        }
      }
      .select-bank-text {
        font-weight: normal;
        color:#969696;
      }
    }
    .otp-section {
      h5 {
        font-size: 16px;
        color: #484848;
      }
      .otp-input-container {
        position: relative;
        img {
          position: absolute;
          z-index: 999;
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
        }
      }
      .form-control {
        border: 2px solid #ced4da;
        border-top: 1px solid #ced4da;
        &:focus {
          border-color: #fe9411;
        }
      }
    }
  }
}
.select-bank-text {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.93;
}
.esign-container {
  padding: 15px 0;
  margin-top: 16px;
}
.new-bank-details {
  border-radius: 7px;
  box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
  padding: 5px 10px;
  opacity: 0.6;
  span {
    font-size: 10px;
    color: #727272;
    width: 60%;
  }
  p {
    font-size: 12px;
    color: #484848;
    width: 40%;
  }
}
.otp-section {
  .otp-input-container {
    border: none !important;
    &.active {
      .form-control {
        border-color: #fe9411;
      }
    }
  }
  .mobile-number {
    font-size: 12px;
    color: #969696;
    line-height: 1.33;
  }
  .otp {
    input {
      box-shadow: 0 2px 16px 0 #ececec;
      border: solid 1px #fe9411;
      background-color: #ffffff;
      height: 48px;
      border-radius: 5px;
      font-size: 18px;
    }
  }
  .timer {
    font-size: 16px;
    color: #969696;
    p {
      color:#484848;
    }
  }
  .request-otp-container {
    p {
      color: #b3b3b3;
      font-size: 13px;
      &.enable-otp {
        color: #1292e9;
      }
    }
    div {
      div {
        border: 1px solid #b3b3b3;
        width: 88px;
      }
    }
    span {
      font-size: 12px;
      color: #969696;
    }
  }
  .otp-text {
    margin-top: 7px;
    font-size: 12px;
  }
  .otp-input-container {
    border: 1px solid #b3b3b3;
    box-shadow: 0 2px 16px 0 #ececec;
    margin: 20px 0;
    input {
      font-size: 20px;
      outline: none;
      border-radius: 2px;
      &:focus {
        border-color: #fe9411;
        outline: none !important;
        box-shadow: none;
      }
    }
  }
}
.error-message {
  color: #ff0b0b;
}
.error-border {
  border-color: #ff0b0b;
}
</style>
