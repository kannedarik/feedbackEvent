<template>
  <div>
    <div class="payments-body">
      <Container :screenType="'body-bg'">
        <div id="otp-verification">
          <div class="p-0 d-flex flex-wrap align-content-between">
            <div class="header w-100">
              <div class="container-fluid p-0">
                <header class="custom-mobile-header">
                  <div class="back-icon-container d-flex
                    justify-content-between align-items-center">
                    <div>
                      <img src="@/assets/icons/icon_back_grey.svg"
                        alt="back icon" @click="toBack"/>
                      <h3 class="bold-font font-primary">
                        {{$t("OTP Confirmation")}}
                      </h3>
                  </div>
                    <button class="btn-rounded-secondary text-base px-4"
                      @click="getDocument($route.params.id)">
                      {{ $t("view_document") }}
                    </button>
                  </div>
                </header>
                <div class="repledge-otp-wrappper bg-white py-8 sm:px-4 md:px-8">
                  <div class="md:w-9/12 md:m-auto">
                    <h2 class="bold-font font-primary">
                      {{ $t("enter_otp") }}
                    </h2>
                    <p class="otp-text font-tertiary">
                      {{ $t("otp_sms_sent_msg") }} +91 {{ customerNumber }}
                    </p>
                    <div class="otp-input-container">
                      <input
                        type="text"
                        min="0"
                        @keypress="checkSpecialCharacters"
                        maxlength="4"
                        placeholder="Enter your OTP here"
                        class="form-control"
                        v-model="otp"
                      />
                    </div>
                    <div class="d-flex justify-content-between otp-timer normal-font">
                      <div class="request-otp-container">
                        <h3 class="font-tertiary mb-3" v-if="+count === 30">
                          {{ $t("otp_timer_msg") }}
                        </h3>
                        <p class="mb-3" v-else
                          :class="[timeRemaining ? 'disable-otp' : 'enable-otp cursor-pointer']"
                          @click="resendOtpToCustomer('sms')">
                          {{ $t("resend_another_otp") }}
                        </p>
                        <p :class="[timeRemaining ? 'disable-otp' : 'enable-otp cursor-pointer']"
                          @click="resendOtpToCustomer('call')">
                          {{ $t("get_otp_on_call") }}
                        </p>
                      </div>
                      <p class="enable-otp" :class="{ invisible: !timeRemaining }">
                        <span>0:{{ count }}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="multipleOtpFailure">
            <div class="back-drop"></div>
            <!--  otp verification failure  -->
            <transition
              name="custom-classes-transition"
              enter-active-class="animated slideInUp"
              leave-active-class="animated slideOutDown"
            >
              <section class="w-100 otp-failure-section ">
                <div>
                  <div class="white-background padding-16 header-section">
                    <h3 class=" bold-font">{{ $t("otp_verification_issue") }}</h3>
                  </div>
                  <div class="body-section padding-16">
                    <p class="otp-failure normal-font mb-2">
                      {{$t("otp_verification_issue_message")}}
                    </p>
                    <h3 class="font-primary medium-font-weight">{{ $t("continue_to_payment") }}</h3>
                  </div>
                </div>
                <div
                  class="padding-16 footer block text-right position-relative white-background
                  d-flex
                  justify-content-between align-items-center"
                >
                  <p class="font-secondary">
                    {{ $t("pay") }} Now:
                    <span class="font-primary"
                      >
                      <b v-if="orderDetails.amount < 100" class="font-12">
                        {{ $t("renew_at_no_cost") }}
                      </b>
                      <b v-else>{{ orderDetails.amount >= 100
                    ? `&#8377; ${orderDetails.amount.toLocaleString("en-IN")}`
                    : "0"}}</b>
                      </span
                    >
                  </p>
                  <button class="btn btn-primary-rupeek" @click="toPayments">
                    {{ $t("continue") }}
                  </button>
                </div>
              </section>
            </transition>
            <!-- otp verification failure -->
          </div>
        </div>
      </Container>
    </div>
    <div class="footer-new">
      <Container>
        <div class="offline-verification d-flex justify-content-between"
          v-if="OfflineVerification" @click="toOfflineVerification">
          <div class="d-flex">
            <div>
              <img src="@/assets/otp/emoji.svg" alt="image" />
            </div>
            <div class="ml-3 mr-3">
              <h4 class="normal-font font-primary">
                {{$t("go_offline_verification") }}
              </h4>
              <p class="font-secondary">
                {{ $t("ack_message") }}
              </p>
            </div>
          </div>
          <div>
            <img src="@/assets/otp/path.svg" alt="image" />
          </div>
        </div>
        <div class="py-2 px-4 md:p-7">
          <div class="d-flex justify-content-end send-otp-container">
            <button class="btn btn-primary-rupeek w-10/12 md:w-1/2"
              :disabled="otp.length !== 4"
              @click="verifyEnteredOtp"
            >
              {{ $t("continue") }}
            </button>
          </div>
        </div>
      </Container>
    </div>
  </div>
</template>
<script>
import Container from '@/components/CommonComponents/Container.vue';
import OTPBasedRenewal from '@/components/OTPBasedRenewal/index.vue';

export default {
  extends: OTPBasedRenewal,
  components: {
    Container,
  },
};
</script>
<style lang="scss">
.footer-new {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
}
.offline-verification {
  padding: 16px;
  background: #f2f2f2;
  margin: 0;
  h4 {
    font-size: 15px;
  }
  p {
    font-size: 10px;
  }
}
#otp-verification {
  .height-100 {
    height: 100vh;
  }
  header {
    p {
      border-radius: 35px;
      border: solid 1px #d4d4d4;
      font-size: 13px;
      color: #b3b3b3;
      padding: 11px 16px;
    }
  }
  .request-otp-container {
    p {
      color: #b3b3b3;
      font-size: 13px;
      text-decoration: underline;
      &.enable-otp {
        color: #EA5518;
      }
      &.disable-otp {
        color: #FBDDD1;
        pointer-events: none;
      }
    }
    div {
      div {
        border: 1px solid #b3b3b3;
        width: 88px;
      }
    }
  }
  .repledge-otp-wrappper {
    margin-top: 16px;
    h2 {
      font-size: 16px;
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
    .otp-timer {
      h3 {
        font-size: 16px;
      }
      p {
        font-size: 16px;
        &.enable-otp {
          color: #EA5518;
        }
      }
    }
  }
  .otp-failure-section {
    position: absolute;
    bottom: 0;
    z-index: 100;
    .header-section {
      border-radius: 8px 8px 0 0;
      padding: 24px 15px;
      h3 {
        font-size: 18px;
      }
    }
    .body-section {
      background-color: #fafafa;
      padding: 32px 15px;
      .otp-failure {
        color: #d1544c;
        font-size: 13px;
      }
      h3 {
        font-size: 16px;
      }
    }
    .footer {
      p {
        font-size: 12px;
        span {
          font-size: 18px;
        }
      }
    }
  }
  .font-12{
    font-size: 12px;
  }
}
</style>
