<template>
  <div class="additional-info my-3 p-3.5 flex">
    <div class="info-icon">
      <img :src="_.get(infoMessage, 'infoIcon', infoIcon)" alt="info_icon" class="card-img"
        :class="_.get(infoMessage, 'size', 'big')" />
    </div>
    <div class="message ml-3">
      <h4 class="font-secondary font-semibold inter-font-family text-sm"
        v-if="infoMessage.title"
        v-html="$t(`${infoMessage.title}`)">
      </h4>
      <span :class="[infoMessage.hasAuction ? 'auction-messages' : '']">
        {{$t(`${infoMessage.message}`)}}
      </span>
    </div>
  </div>
</template>
<script>
import _ from 'lodash';
import infoIcon from '@/assets/icons/info_icon.svg';

export default {
  name: 'MessagesBox',
  data() {
    return {
      infoIcon,
    };
  },
  props: {
    infoMessage: {
      type: Object,
      required: true,
    },
  },
  computed: {
    _() {
      return _;
    },
  },
};
</script>
<style scoped lang='scss'>
@import '@/scss/common/_variables.scss';

.additional-info {
  border-radius: $base-border-radius + 3;
  border: solid 1px $light-yellow-color;
  background-color: $light-yellow-color;
  &.info-message {
    border-color: #E8F7FE;
    background-color: #E8F7FE;
    .message {
      span{
        color: #1E2D4B;
        font-family: 'Inter';
      }
    }
  }
  .small {
    width: 15px;
  }
  .very-big {
    width: 25px;
    @media screen and (max-width: 600px) {
      width: 50px;
    }
  }
  .big {
    width: 20px;
    @media screen and (max-width: 600px) {
      width: 30px;
    }
  }
  .message {
    line-height: 1;
    span {
      font-size: 0.75rem;
      color: $secondary-color;
      &.auction-messages {
        color: #d1281e;
      }
    }
  }
}
</style>
