<template>
  <div>
    <div class="payments-body">
      <Container :screenType="'body-bg'">
        <header class="custom-mobile-header">
          <div class="back-icon-container d-flex justify-content-between align-items-center">
            <div>
              <img src="@/assets/icons/icon_back_grey.svg"
                alt="back icon" @click="toBack"/>
              <h3 class="bold-font font-primary">
                {{ $t("complete_esign") }}
              </h3>
          </div>
            <button class="btn-rounded-secondary text-base px-4"
              @click="getDocument($route.params.id)">
              {{ $t("view_document") }}
            </button>
          </div>
        </header>
        <div class="esign-container bg-white py-4" v-if="links.length">
          <div v-for="(link, index) in links" :key="index"
            @click="trackEsignLenderOrRupeek(link)"
            class="esign-status-card sm:w-100 md:w-3/4 mx-auto
              d-flex justify-content-between align-items-center mb-3"
            :class="{
              active: link.status.name === 'processing',
              completed: link.status.name === 'success',
              disabled: links.length > 1 && links[0].status.name === 'processing' && index === 1
            }"
          >
            <div class="d-flex justify-content-between align-items-center">
              <span class="icon">
                <img :src="lendersConfig[_.get(link, 'custom.lender')].iconLink"
                  :alt="_.get(link, 'custom.lender')" />
              </span>
              <span class="font-weight-bold font-primary">
                {{lendersConfig[_.get(link, 'custom.lender')].name}}
                <span class="font-weight-normal status-text normal-font"
                  >-
                  <span v-if="link.status.name === 'processing'">{{ $t("progress") }}</span>
                  <span v-else-if="link.status.name === 'success'">{{ $t("successful") }}</span>
                  <span v-else>{{ $t("failed") }}</span>
                </span>
              </span>
            </div>
            <div>
              <img src="@/assets/otp/path.svg" alt="right arrow"
              v-if="link.status.name !== 'success'" />
              <img
                src="@/assets/payment-status/renewal_success.svg"
                alt="success icon" class="success-icon"
                v-else
              />
            </div>
          </div>
          <InfoMessageWithTitle class="mt-5 sm:w-100 md:w-3/4 mx-auto info-message"
            :infoMessage="infoMessage({title: $t('esign_info'), message: $t('esign_info_text')})"
          />
        </div>
        <div class="w-100 text-center mt-150" v-else-if="count >= 3 || hasShowRetryBtn">
          <button class="btn btn-primary-rupeek w-1/3 rounded-full" @click="retry">
            {{ $t("retry") }}
            </button>
        </div>
      </Container>
    </div>
    <div class="footer-new" v-if="links.length>0">
      <Container>
        <div class="py-2 px-4 md:p-7 text-right">
          <button class="btn-primary-rupeek text-base rounded-full px-5 py-3" @click="toEsign">
            {{ $t("continue") }}
          </button>
        </div>
      </Container>
    </div>
  </div>
</template>
<script>
import esignStatus from '@/components/esignStatus/esignStatus.vue';
import Container from '@/components/CommonComponents/Container.vue';
import InfoMessageWithTitle from '@/components/InfoMessagesBoxs/InfoMessageWithTitle.vue';

export default {
  extends: esignStatus,
  components: {
    Container,
    InfoMessageWithTitle,
  },
  name: 'esign',
};
</script>
<style scoped lang="scss">
.footer-new {
  position: fixed;
  bottom: 0;
  width: 100%;
}
.esign-container {
  background-color: #ffffff;
  padding: 15px 16px;
  margin-top: 16px;
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
.esign-ack {
  background-color: #ffffff;
  padding: 32px;
  margin-top: 16px;
  img {
    max-width: 300px;
  }
}
.esign-information {
  color: #484848;
  border-radius: 4px;
  border: solid 1px #ffeed9;
  background-color: #fff8ef;
  h4 {
    font-size: 12px;
  }
  p {
    font-size: 9px;
    margin-top: 8px;
  }
}
.success-icon{
  width: 24px !important;
}
.icon {
  margin-right: 8px;
  min-width: 32px;
  max-width: 32px;
  height: 32px;
}
</style>
