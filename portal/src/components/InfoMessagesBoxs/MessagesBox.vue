<template>
  <div :class="[hasShowFullWidth ? 'w-full' : 'w-11/12 md:w-4/6', 'm-auto']">
    <div class="info-card flex p-4" v-if="message">
      <div class="info_icon w-16 md:w-10 xl:m-2">
        <img src="@/assets/img/info_icons/info_icon.svg" alt="info_icon" />
      </div>
      <p class="messages m-0 pl-2 md:pl-4">
        {{ message }}
      </p>
    </div>
    <div class="static-message flex items-baseline" v-if="!message && staticMessages">
      <img :src="hasShowImpinfoIcon ? Impinfo : ImportantNote"
        alt="refresh" :class="['mt-1', hasShowImpinfoIcon ? 'w-5' : '']" />
      <div class="ml-3 message">
        <h4 class="medium-font-weight text-left mb-3">
          {{ staticMessages.title }}
        </h4>
        <ul>
          <li class="sm:pl-2 text-left" :class="[!hasShowFullWidth ? 'md:ml-3' : '']"
            v-for="(messages, index) in staticMessages.multiDescription"
            :key="index">
            {{ messages }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import Impinfo from '@/assets/icons/renewal-pending.svg';
import ImportantNote from '@/assets/img/info_icons/important_note.svg';

export default {
  name: 'MessagesBox',
  data() {
    return {
      Impinfo,
      ImportantNote,
    };
  },
  props: {
    message: {
      type: String,
      required: false,
    },
    staticMessages: {
      type: Object,
      required: false,
    },
    hasShowImpinfoIcon: {
      type: Boolean,
      required: false,
    },
    hasShowFullWidth: {
      type: Boolean,
      required: false,
    },
  },
};
</script>
<style scoped lang='scss'>
.info-message {
  .static-message {
    border-color: #E8F7FE;
    background-color: #E8F7FE;
    h4 {
      color: #1E2D4B;
    }
    .message {
      ul li {
        color: #1E2D4B;
      }
    }
  }
}
.info-card {
  background: #fff8ef;
  border: 1px solid #ffeed9;
  box-sizing: border-box;
  border-radius: 4px;
  .info_icon {
    img {
      width: 100%;
      height: auto;
    }
  }
  .messages {
    font-size: 12px;
    line-height: 15px;
    color: #727272;
    font-weight: 400;
  }
}
.static-message {
  padding: 16px;
  box-shadow: 0 3px 10px 0 rgba(0, 0, 0, 0.07);
  background: #ffeed9;
  border-radius: 6px;
  &.loan-details {
    width: calc(100% - 25px);
    img {
      width: 25px;
      height: 25px;
    }
  }
  .message {
    ul li {
      font-size: 11px;
      font-weight: 500;
      color: #867765;
      display: list-item;
      margin-bottom: 1rem;
      &:last-child {
        margin: 0;
      }
      &::marker {
        display: list-item;
        contain: '.';
       content: url("../../assets/img/info_icons/color_circle_icon.svg");
      }
    }
  }
}
</style>
