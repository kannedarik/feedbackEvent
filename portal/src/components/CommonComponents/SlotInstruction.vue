<template>
  <div class="white-background p-3 w-100 slot-info-box">
    <div class="d-flex align-items-center loan-manager
      position-relative inter-font-family"
      :class="{'pb-6': _.get(loanManagerInfo, 'header.message')}"
      v-if="checkLoanManagerInfo">
      <div>
        <img :src="_.get(loanManagerInfo, 'header.profileImageURL')"
          alt="loan_manager_icon" width="50px" />
        <div class="info-message position-absolute"
          v-if="_.get(loanManagerInfo, 'header.message')">
          <p>{{_.get(loanManagerInfo, 'header.message')}}</p>
        </div>
      </div>
      <div class="ml-4">
        <label class="m-0">Loan Manager</label>
        <p>{{_.get(loanManagerInfo, 'header.name')}}</p>
      </div>
      <div class="ml-5" v-if="_.get(loanManagerInfo, 'header.deliveryCompleted')">
        <label class="m-0">Deliveries Completed</label>
        <p>{{_.get(loanManagerInfo, 'header.deliveryCompleted')}}</p>
      </div>
    </div>
    <div>
      <div class="d-flex align-items-center">
        <img :src="_.get(slotInstruction, 'content.imageUrl')"
          alt="slotInstruction" width="30px"/>
        <h3 class="medium-font-weight ml-2">
          {{_.get(slotInstruction, 'content.title')}}
        </h3>
      </div>
      <h4 class="py-3 bb-1 inter-font-family">
        {{_.get(slotInstruction, 'content.description')}}
      </h4>
      <div class="d-flex align-items-center py-3 inter-font-family"
        v-for="(track, index) in _.get(slotInstruction, 'content.multiList')" :key="index">
        <img :src="track.imageUrl" :alt="`instruction_icons-${index}`" width="50px"/>
        <div class="ml-3">
          <p>{{track.title}}</p>
          <span v-if="track.description"
            v-html="track.description" @click="viewedDocuemnts(track.title)">
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { sendEvent } from '@/utils/clevertap/EventTracker';
import events from '@/utils/clevertap/eventconstants';

export default {
  name: 'SlotInstruction',
  props: {
    slotInstruction: {
      type: Object,
      required: true,
    },
    loanManagerInfo: {
      type: Object,
    },
  },
  computed: {
    _() {
      return _;
    },
    checkLoanManagerInfo() {
      return !_.isEmpty(this.loanManagerInfo);
    },
  },
  methods: {
    // function call click viewed Documents
    viewedDocuemnts(title) {
      const properties = {
        reference: title,
      };
      sendEvent(events.screen.RELEASE_CONFIRMATION, events.category.PAYMENT, properties);
    },
  },
};
</script>
<style lang="scss">
.bb-1 {
  border-bottom: 1px solid #00000069;
}
.slot-info-box {
  border: 1px solid rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
  border-radius: 12px;
  color: #1E2D4B;
  font-size: 14px;
  h3 {
    font-size: 24px;
  }
  h4 {
    font-size: 16px;
  }
  p {
    font-weight: 600;
  }
  span {
    color: #788193;
    font-style: italic;
    a {
      color: #EA5518;
    }
  }
  @media screen and (max-width: 600px){
    font-size: 12px;
    h3 {
      font-size: 18px;
    }
    h4 {
      font-size: 14px;
    }
    p {
      font-weight: 500;
    }
  }
}
</style>
