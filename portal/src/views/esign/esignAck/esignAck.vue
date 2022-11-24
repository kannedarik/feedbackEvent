<template>
  <div>
    <div class="payments-body">
      <Container :screenType="'body-bg'">
        <div id="esign-ack" class="position-relative">
          <div>
            <header class="custom-mobile-header">
              <div class="back-icon-container cursor-pointer">
                <img src="@/assets/icons/icon_back_grey.svg" alt="back icon"
                  @click="toBack()"/>
              </div>
              <h3 class="bold-font font-primary">
                {{ $t("ack_by_esign") }}
              </h3>
            </header>
            <div class="esign-ack d-flex justify-content-between">
              <img src="@/assets/esign/esign_ack.svg" alt="esign ack image"
                class="sm:w-100 md:w-75 m-auto" />
            </div>
          </div>
        </div>
      </Container>
    </div>
    <div class="footer-new">
      <Container>
        <div class="py-2 px-4 md:p-7 text-right">
          <button class="btn-primary-rupeek text-base rounded-full px-5 py-3" @click="toPayments">
            {{ $t("continue") }}
          </button>
        </div>
      </Container>
    </div>
  </div>
</template>
<script>
import { getorderDetails } from '@/api/repledge.api';
import Container from '@/components/CommonComponents/Container.vue';

export default {
  components: {
    Container,
  },
  methods: {
    toBack() {
      this.$router.push('/dashboard');
    },
    async toPayments() {
      try {
        const response = await getorderDetails(this.$route.params.id);
        if (response.data.order.paymentstatus === 'success') {
          this.$router.push({ name: 'esignStatus', params: { id: this.$route.params.id } });
        } else {
          this.$router.push({ name: 'paymentOptions', params: { id: this.$route.params.id } });
        }
      } catch (error) {
        this.$noty.error(error.message);
      }
    },
  },
};
</script>
<style scoped lang="scss">
#esign-ack {
  height: 100vh;
  .esign-ack {
    background-color: #ffffff;
    padding: 32px;
    margin-top: 16px;
  }
}
.footer-new {
  position: fixed;
  bottom: 0;
  width: 100%;
}
@media screen and (min-width: 641px) {
  .md {
    &\:w-75 {
      width: 75%;
    }
  }
}
</style>
