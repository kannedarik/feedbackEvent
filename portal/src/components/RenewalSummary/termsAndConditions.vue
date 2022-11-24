<template>
  <div class="bg-white py-3">
    <div class="header">
      <div class="terms-block d-inline-block sm:px-4 md:px-8">
        <img src="@/assets/icons/doc_icon.svg" alt="doc_icon" class="m-auto d-block">
        <div class="d-flex justify-center items-center lender-details">
          <div class="border-line"></div>
          <h2 class="m-3 font-semibold w-100 text-center">
            {{terms && terms.lenderName}}
          </h2>
          <div class="border-line"></div>
        </div>
        <h3 class="terms_header mb-3">
          Terms & Conditions of Pledge
        </h3>
        <p class="terms-text normal-font">
          {{ terms.terms && terms.terms.terms}}
        </p>
        <h3 class="terms_header" v-if="terms.terms && terms.terms.declarations">
          Declaration and Undertakings
        </h3>
        <p class="terms-text normal-font" v-if="terms.terms && terms.terms.declarations">
          {{terms.terms && terms.terms.declarations}}
        </p>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  name: 'termsAndConditions',
  props: {
    terms: {
      type: Object,
      required: false,
    },
  },
};
</script>
