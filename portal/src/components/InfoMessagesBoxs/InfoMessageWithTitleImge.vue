<template>
  <div class="additional-info p-3.5">
    <div class="d-flex items-center">
      <img :src="_.get(infoMessage, 'imageUrl')" alt="info_icon" class="card-img"
        :class="_.get(infoMessage, 'size', 'big')" />
      <div class="ml-2">
        <span v-if="infoMessage.label" class="text-xs label">
          {{infoMessage.label}}
        </span>
        <h4 class="font-secondary font-semibold inter-font-family text-sm">
          {{infoMessage.title}}
        </h4>
      </div>
    </div>
    <div class="message py-2 text-xs inter-font-family"
      :class="{'label-info' : infoMessage.title}">
      {{$t(`${infoMessage.description}`)}}
    </div>
  </div>
</template>
<script>
import _ from 'lodash';

export default {
  name: 'InfoMessageWithTitleImge',
  data() {
    return {};
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
  border: solid 1px #E8F7FE;
  background-color: #E8F7FE;
  .label {
    color: #788193;
  }
  .small {
    width: 16px;
  }
  .very-big {
    width: 40px;
    height: 40px;
    @media screen and (max-width: 600px) {
      width: 50px;
      height: 50px;
    }
  }
  .big {
    width: 20px;
    height: 20px;
  }
  .message {
    line-height: 17px;
    color: #1E2D4B;
    &.label-info {
      color: #4B576F;
    }
  }
}
</style>
