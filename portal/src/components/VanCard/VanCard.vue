<template>
  <div class="van-number-card block bg-white mb-4">
    <header class="block text-center">
      <h5 class="mb-3 bold-font">
        Pay {{ van.amount ? formatRupeeAmount(van.amount) : 0 }}
      </h5>
      <div class="flex">
        <div class="flex-1 header-loan-details">
          <h5>Lender</h5>
          <p class="uppercase">{{ van.lender ? van.lender : "-" }}</p>
        </div>
        <div class="flex-1 header-loan-details">
          <h5>Loan ID</h5>
          <p>{{ van.losid ? van.losid : "-" }}</p>
        </div>
        <div class="flex-1 header-loan-details">
          <h5>Loan Amount</h5>
          <p>
            {{ van.loanamount ? formatRupeeAmount(van.loanamount) : 0 }}
          </p>
        </div>
      </div>
    </header>
    <div class="van-number-card__body block">
      <div class="account-details-wrapper flex items-center justify-between">
        <div class="details">
          <h5 class="m-0">Savings Account Number</h5>
          <h6 class="m-0">
            {{ van.van_acct_no ? van.van_acct_no : "-" }}
          </h6>
        </div>
        <div class="copy-info flex items-center cursor-pointer"
          @click="copyToClipboard(van.van_acct_no)"
          :class="{ 'pointer-events-none': !van.van_acct_no }">
          <div class="copy-symbol-wrapper">
            <div class="boxex"></div>
            <div class="boxes-inner"></div>
          </div>
          <p class="m-0">Copy</p>
        </div>
      </div>
      <div class="account-details-wrapper flex items-center justify-between">
        <div class="details">
          <h5 class="m-0">IFSC Code</h5>
          <h6 class="m-0">{{ van.van_ifsc ? van.van_ifsc : "-" }}</h6>
        </div>
        <div class="copy-info flex items-center cursor-pointer"
          @click="copyToClipboard(van.van_ifsc)"
          :class='{ "pointer-events-none": !van.van_ifsc}'>
          <div class="copy-symbol-wrapper">
            <div class="boxex"></div>
            <div class="boxes-inner"></div>
          </div>
          <p class="m-0">Copy</p>
        </div>
      </div>
      <div class="account-details-wrapper flex items-center justify-between">
        <div class="details">
          <h5 class="m-0">Beneficiary Name</h5>
          <h6 class="m-0">
            {{ van.van_beneficiary ? van.van_beneficiary : "-" }}
          </h6>
        </div>
        <div class="copy-info flex itmes-center cursor-pointer"
          @click="copyToClipboard(van.van_beneficiary)"
          :class='{ "pointer-events-none": !van.van_beneficiary}'>
          <div class="copy-symbol-wrapper">
            <div class="boxex"></div>
            <div class="boxes-inner"></div>
          </div>
          <p class="m-0">Copy</p>
        </div>
      </div>
      <div class="account-details-wrapper flex items-center justify-between">
        <div class="details">
          <h5 class="m-0">Address</h5>
          <h6 class="m-0">
            {{(van.ifscDetails && van.ifscDetails.address) ? van.ifscDetails.address : '-'}}
          </h6>
        </div>
        <div class="copy-info d-flex flex-align-center cursor-pointer"
          @click='copyToClipboard(van.ifscDetails && van.ifscDetails.address)'
          :class='{ "pointer-events-none": !(van.ifscDetails && van.ifscDetails.address)}'>
          <div class="copy-symbol-wrapper">
            <div class="boxex"></div>
            <div class="boxes-inner"></div>
          </div>
          <p class="m-0">Copy</p>
        </div>
      </div>
      <div class="account-details-wrapper flex items-center justify-between">
        <div class="details">
          <h5 class="m-0">City</h5>
          <h6 class="m-0">
            {{(van.ifscDetails && van.ifscDetails.city) ? van.ifscDetails.city : '-'}}
          </h6>
        </div>
        <div class="copy-info d-flex flex-align-center cursor-pointer"
          @click='copyToClipboard(van.ifscDetails && van.ifscDetails.city)'
          :class='{ "pointer-events-none":!(van.ifscDetails && van.ifscDetails.city)}'>
          <div class="copy-symbol-wrapper">
            <div class="boxex"></div>
            <div class="boxes-inner"></div>
          </div>
          <p class="m-0">Copy</p>
        </div>
      </div>
    </div>
    <footer class="block text-center">
      <h6 class="light-font-weight mb-3">
        <strong>Note:</strong> Do not pay for other loan(s) in above account
      </h6>
      <div class="send-via-sms cursor-pointer"
        :class="{ 'pointer-events-none disabled': !van.van_acct_no }"
        @click="sendSMS(van.losid)">
        <svg width="15px" height="13px" class="inline-block" viewBox="0 0 15 13" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"
            stroke-linecap="round" stroke-linejoin="round">
            <g id="icon-sms" stroke="#FE9411">
              <path d="M12.065,10.413 L9.935,10.413 L7.5,12.5 L5.065,10.413 L2.935,10.413
                C1.69002186, 10.4977466 0.606742945,9.56928536 0.5,8.326 L0.5,0.5 L14.5,0.5
                L14.5,8.326 C14.3932571,9.56928536 13.3099781,10.4977466 12.065,10.413 Z"
                id="Path_33"></path>
              <g id="Group_28" transform="translate(3.920000, 2.031000)">
                <path d="M0,1 L7.16,1" id="Line_1"></path>
                <path d="M0,3.203 L7.16,3.203" id="Line_2"></path>
                <path d="M0,5.406 L5.508,5.406" id="Line_3"></path>
              </g>
            </g>
          </g>
        </svg>
        &nbsp; Send via SMS
      </div>
    </footer>
  </div>
</template>
<script>
import { sendVanSMS } from '@/api/customer.api';
import { formatRupeeAmount } from '@/utils/string';

export default {
  name: 'vanCard',
  props: {
    van: {
      type: Object,
      required: true,
    },
  },
  methods: {
    formatRupeeAmount,
    // copy to clip board
    copyToClipboard(text) {
      if (window.clipboardData && window.clipboardData.setData) {
        this.$noty.success(`'${text}' Copied to clipboard successfully.`);
        return window.clipboardData.setData('Text', text);
        // eslint-disable-next-line
      } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
        const textarea = document.createElement('textarea');
        textarea.textContent = text;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          this.$noty.success(`'${text}' Copied to clipboard successfully.`);
          return document.execCommand('copy');
        } catch (ex) {
          console.warn('Copy to clipboard failed.', ex);
          return false;
        } finally {
          document.body.removeChild(textarea);
        }
      }
      return true;
    },
    // function to send sms
    sendSMS(losid) {
      sendVanSMS({ losid })
        .then((response) => {
          if (response.status === 200) {
            this.$noty.success(response.data.message);
          }
        })
        .catch((error) => {
          this.$noty.error(error);
        });
    },
  },
};
</script>
