<template>
  <div>
    <div v-if="Object.keys(paymentData).length" class="payments-body">
      <Container>
        <div class="repledge-status-container d-flex justify-content-center flex-column"
          v-if="_.get(paymentData, 'paymentstatus') === 'success'
            && _.get(paymentData, 'signingstatus') === 'success'
            && _.get(paymentData, 'signingmethod.name') !== 'physical'">
          <img src="@/assets/payment-status/renewal_success.svg" alt="success icon"
            class="renewal__status__icon"/>
          <h3 class="text-center bold-font font-primary">
            {{$t("renewal_request_successful")}}
          </h3>
          <div v-if="_.get(paymentData, 'hasLoanEnhancementLoans')
            && _.get(paymentData, 'signingstatus') === 'success'
            && _.get(paymentData,
              'bankAccount.verificationStatus', '').toLowerCase() === 'verification_successful'">
            <p class="text-center le-loan bold-font">
              {{$t("le_success_message")}}
            </p>
          </div>
          <div v-else>
            <p class="normal-font text-center" v-if="
              _.get(paymentData, 'signingmethod.name') === 'digital'
              && !_.get(paymentData, 'hasLoanEnhancementLoans')">
              {{$t("otp_verification_success")}}
            </p>
            <p class="normal-font text-center"
              v-if="_.get(paymentData, 'signingmethod.name') === 'esign'
              && !_.get(paymentData, 'hasLoanEnhancementLoans')">
              {{$t("esign_verification_success")}}
            </p>
          </div>
        </div>
        <div class="repledge-status-container d-flex justify-content-center flex-column" v-else>
          <img src="@/assets/payment-status/renewal_pending.svg" alt="pending icon"
            class="renewal__status__icon" />
          <h3 class="text-center bold-font font-primary"
            v-if="_.get(paymentData, 'signingmethod.name') !== 'physical'">
            {{$t("renewal_pending")}}
          </h3>
          <h3 v-else class="text-center bold-font font-primary">
            {{$t("offline_renewal_pending")}}
          </h3>
          <p class="normal-font text-center"
            v-if="_.get(paymentData, 'signingmethod.name') === 'physical'">
            {{$t("offline_msg")}}
          </p>
          <p class="normal-font text-center"
            v-else-if="_.get(paymentData, 'signingmethod.name') === 'digital'">
            {{$t("otp_msg")}}
          </p>
          <p class="normal-font text-center" v-else>
            {{$t("esign_failure_msg")}}
          </p>
        </div>
        <!-- payment summary starts here -->
        <div class="renewal-summary">
          <h4 class="font-primary bold-font"
          v-if="_.get(paymentData, 'paymentstatus') === 'success'
            && _.get(paymentData, 'signingstatus') === 'success'
            && _.get(paymentData, 'signingmethod.name') !== 'physical'">
            {{$t("renewal_summary")}}
          </h4>
          <h4 class="font-primary bold-font" v-else>
            {{$t("payment_successful")}}
          </h4>
          <p class="font-tertiary normal-font">
            {{$t("paid_amount")}}:
            <span class="font-secondary">
              {{
                _.get(paymentData, 'amount') >= 100
                ? formatRupeeAmount(_.get(paymentData, 'amount'))
                : '0'
              }}
            </span>
          </p>
          <p class="font-tertiary normal-font">
            {{$t("reference")}} #:
            <span class="font-secondary">
              {{_.get(paymentData, 'payment.requestId')}}
            </span>
          </p>
          <div class="renewal-loan-update d-flex justify-content-between align-items-baseline">
            <img src="@/assets/payment-status/refresh.svg" alt="sync" />
            <div class="ml-2">
              <h5 class="medium-font-weight font-primary">
                {{$t("loan_update")}}
              </h5>
              <p class="normal-font">
                {{$t("renewal_inprogress")}}
              </p>
              <p class="bold-font"
                v-if="(_.get(paymentData, 'hasLoanEnhancementLoans')
                && _.get(paymentData, 'signingstatus') === 'success'
                && _.get(paymentData, 'bankAccount.verificationStatus', '').toLowerCase()
                !== 'verification_successful')">
                Bank details could not be verified online. Please send cancelled cheque to this
                <a @click="openGoogleFormLink" class="google-link">link</a>.
                Our customer care team will contact you for further steps.
              </p>
            </div>
          </div>
        </div>
        <!-- payment summary ends here -->
        <div class="d-flex justify-content-center"
          :class="{'mb-24': _.get(paymentData, 'paymentstatus') === 'success'
            && _.get(paymentData, 'signingstatus') === 'success'}">
          <div v-if="_.get(paymentData, 'paymentstatus') === 'success'
            && _.get(paymentData, 'signingstatus') === 'success'">
            <div class="signed-pledgecard" v-if="signedDoc.secured"
              @click="trackDownLoadPCEvent({summary : false, lender: signedDoc.lender.secure[0]})">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex">
                  <img src="@/assets/payment-status/pdf.svg" alt="pdf" />
                  <p class="medium-font-weight font-primary">
                    <span>
                      {{lendersConfig[_.get(signedDoc, 'lender.secure[0]')].name}}
                    </span>
                    Signed <br />Document
                  </p>
                </div>
                <a class="theme-secondary-color medium-font-weight flex"
                  :href="signedDoc.secured" target="_blank" download>
                  {{$t("download_receipt")}}
                  <img src="@/assets/payment-status/download_arrow.svg"/>
                </a>
              </div>
            </div>
            <div class="signed-pledgecard" v-if="signedDoc.unsecured"
              @click="trackDownLoadPCEvent({summary: false, lender: signedDoc.lender.unsecure[0]})">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex">
                  <img src="@/assets/payment-status/pdf.svg" alt="pdf" />
                  <p class="medium-font-weight font-primary">
                    <span>
                      {{lendersConfig[_.get(signedDoc, 'lender.unsecure[0]')].name}}
                    </span>
                    Signed<br />Document
                  </p>
                </div>
                <a class="theme-secondary-color medium-font-weight flex"
                  :href="signedDoc.unsecured" target="_blank" download>
                  {{$t("download_receipt")}}
                  <img src="@/assets/payment-status/download_arrow.svg"/>
                </a>
              </div>
            </div>
            <div class="signed-pledgecard" v-if="signedDoc.summary"
              @click="trackDownLoadPCEvent({summary : true, isLE : false})">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex">
                  <img src="@/assets/payment-status/pdf.svg" alt="pdf" />
                  <p class="medium-font-weight font-primary">
                    Summary of Loans
                    <br />-Renewal
                  </p>
                </div>
                <a class="theme-secondary-color medium-font-weight flex"
                  :href="signedDoc.summary" target="_blank" download>
                  {{$t("download_receipt")}}
                  <img src="@/assets/payment-status/download_arrow.svg"/>
                </a>
              </div>
            </div>
            <div class="signed-pledgecard" v-if="signedDoc.lesummary"
              @click="trackDownLoadPCEvent({summary : true, isLE : true})">
              <div class="d-flex justify-content-between align-items-center">
                <div class="d-flex">
                  <img src="@/assets/payment-status/pdf.svg" alt="pdf" />
                  <p class="medium-font-weight font-primary">
                    Summary of Loans
                    <br />-Topup
                  </p>
                </div>
                <a class="theme-secondary-color medium-font-weight flex"
                  :href="signedDoc.lesummary" target="_blank" download>
                  {{$t("download_receipt")}}
                  <img src="@/assets/payment-status/download_arrow.svg"/>
                </a>
              </div>
            </div>
          </div>
          <!-- retry options starts here-->
          <div class="sm:w-100 md:w-3/4" v-else>
            <div class="renewal-pending" v-if="signMethods.length">
              <div class="ack-pending-message d-flex justify-content-start align-items-baseline">
                <div>
                  <img src="@/assets/payment-status/ack_pending.svg" alt="ack pending" />
                </div>
                <div>
                  <h5 class="font-primary medium-font-weight">
                    {{$t("ack_pending")}}
                  </h5>
                  <p class="font-primary normal-font">
                    {{$t("ack_pending_msg")}}
                  </p>
                </div>
              </div>
              <div class="ack-pending-actions d-flex justify-content-between cursor-pointer"
                @click="registerSignMethod(signMethod)" v-for="(signMethod, index) in signMethods"
                :key="index">
                <div>
                  <h5 class="bold-font">
                    {{ otpSignMethodsList.includes(_.get(signMethod, 'name'))
                      ? $t("via_otp") : $t("via_esign")
                    }}
                  </h5>
                  <p class="font-tertiary normal-font">
                    {{ otpSignMethodsList.includes(_.get(signMethod, 'name'))
                      ? $t("ack_otp_msg") : $t("ack_esign_msg")
                    }}
                  </p>
                </div>
                <img src="@/assets/otp/path.svg" alt="more" />
              </div>
            </div>
          </div>
          <!-- retry options ends here -->
        </div>
      </Container>
    </div>
    <div class="footer-new" v-if="(_.get(paymentData, 'paymentstatus') === 'success'
      && _.get(paymentData, 'signingstatus') === 'success')
      || (_.get(paymentData, 'signingmethod.name') === 'physical')">
      <Container>
        <div class="py-2 px-4 md:p-7 flex justify-between">
          <button class="btn-rounded-secondary text-base px-4" @click="toDashboard()">
            Back to Home
          </button>
          <button class="btn-primary-rupeek text-base rounded-full px-4" @click="toDashboard()">
            Repay other Loans
          </button>
        </div>
      </Container>
    </div>
  </div>
</template>
<script>
import paymentStatus from '@/components/paymentStatus/paymentStatus.vue';
import Container from '@/components/CommonComponents/Container.vue';

export default {
  extends: paymentStatus,
  components: {
    Container,
  },
};

</script>
<style scoped lang="scss">
.google-link {
  color: #007bff;
  text-decoration: underline !important;
}
 .footer-new {
  position: fixed;
  bottom: 0;
  width: 100%;
}
.repledge-status-container {
  background: url("../../assets/payment-status/renewal_pending_bgnd.svg");
  padding: 30px 50px;
  @media (min-width: 991px) {
    height: 300px;
  }
  @media (max-width: 360px) {
    padding: 30px;
  }
  h3 {
    margin-top: 20px;
    font-size: 18px;
    @media (min-width: 991px) {
      font-size: 24px;
    }
  }
  p {
    color: #eb8925;
    font-size: 12px;
    margin-top: 8px;
    @media (min-width: 991px) {
      font-size: 14px;
      margin-top: 16px;
    }
  }
  .le-loan {
    color:#484848;
    font-size: 14px;
  }
  .renewal__status__icon {
    margin: 0px auto;
    width: 49px;
    height:49px;
  }
}
.renewal-summary {
  border-radius: 4px;
  box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.07);
  background-color: #ffffff;
  margin: -15px 15px 20px 15px;
  padding: 24px 16px;
  @media (min-width: 991px) {
    padding: 24px;
    margin: -60px auto 20px auto;
    width: 475px;
  }
  h4 {
    font-size: 16px;
    @media (min-width: 991px) {
      font-size: 18px;
    }
  }
  p {
    font-size: 12px;
    margin-top: 12px;
    line-height: 1.2;
    @media (min-width: 991px) {
      font-size: 14px;
    }
    span {
      font-size: 16px;
    }
  }
  .renewal-loan-update {
    border-radius: 4px;
    background-color: #E8F7FE;
    padding: 16px;
    margin-top: 20px;
    @media (min-width: 991px) {
      margin-top: 24px;
    }
    h5 {
      font-weight: 600;
      font-size: 14px;
      @media (min-width: 991px) {
        font-size: 16px;
      }
    }
    p {
      color: #4B576F;
      font-size: 11px;
      margin-top: 8px;
      @media (min-width: 991px) {
        font-size: 14px;
      }
    }
  }
}
.signed-pledgecard {
  border-radius: 7px;
  box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.25);
  background-color: #ffffff;
  margin: 0 15px 8px 15px;
  padding: 16px;
  @media (min-width: 991px) {
    width: 475px;
    margin: 0 auto 8px auto;
  }
  p {
    margin-left: 11px;
    font-size: 14px;
    @media (max-width: 360px) {
      font-size: 12px;
    }
  }
  a {
    font-size: 12px;
  }
}
.renewal-pending {
  border-radius: 4px;
  border: solid 1px #fededf;
  background-color: #fff5f5;
  margin: 32px 16px;
  padding: 8px;
  .ack-pending-message {
    margin-top: 10px;
    img {
      margin: 0 8px;
    }
    h5 {
      font-size: 12px;
      line-height: 1;
    }
    p {
      font-size: 9px;
      margin-top: 8px;
    }
  }
  .ack-pending-actions {
    border-radius: 7px;
    box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.25);
    background-color: #ffffff;
    padding: 16px;
    margin-top: 16px;
    h5 {
      font-size: 15px;
      color: #eb8825;
    }
    p {
      font-size: 12px;
      margin-top: 8px;
    }
    img {
      margin-left: 30px;
    }
  }
}
</style>
