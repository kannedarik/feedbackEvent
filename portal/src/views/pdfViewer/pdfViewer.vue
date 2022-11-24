<template>
  <div id="payment-option" class="position-relative">
    <div>
      <header class="custom-mobile-header">
        <div class="back-icon-container">
          <img src="@/assets/icons/icon_back_grey.svg" alt="back icon" />
        </div>
        <h3 class="bold-font font-primary">
          E-sign Document
        </h3>
      </header>
  <div>
    <iframe :src='`https://docs.google.com/gview?url=${url}&output=embed`' style="width:600px; height:500px;" frameborder="0"></iframe>
  </div>
    </div>
  </div>
</template>

<script>
import pdfViewer from '../../components/pdfViewer/pdfViewer.vue';

export default {
  extends: pdfViewer,
};
</script>
<style lang="scss" scoped>
#orderStatus {
  height: 100vh;
  background: rgba(255, 103, 0, 0.5);
}
</style>
