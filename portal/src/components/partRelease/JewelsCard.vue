<template>
  <div class="jewels-flex flex-wrap w-100">
    <div class="jewels-card flex items-center relative w-full md:w-30 xl:w-20"
      v-for="(jewel, jewelIndex) in jewelsList.jewels" :key="jewelIndex"
      :class="{'selected': jewel.isSelected,
      'disable-jewel': (((!jewelsList.enableDigitalPartRelease
        || !(_.get(jewelsList, 'auctionAction.enable', true)))
        && loanInfo.showCheckBox) || jewelsList.hasDisable)}">
      <div class="z-index-0 flex sm:flex-row md:flex-col w-100">
        <div class="w-1/4 p-0 overflow-hidden relative md:w-full">
          <div class="bt-bb">
            <img :src="jewel.pictureLink"
              class="rounded-bl-lg rounded-tl-lg md:rounded-bl-none md:rounded-tr-lg"
              :alt="jewel.ornamentType ? jewel.ornamentType : 'jewels'" lazy>
            <img src="@/assets/img/info_icons/information.svg" alt="information"
              class="zoom-image cursor-pointer" @click="zoomImage(jewel)" />
          </div>
        </div>
        <div class="w-3/4 md:w-full">
          <div class="mx-2 py-3 flex flex-col justify-between h-full">
            <div class="flex items-center justify-between md:items-baseline">
              <p class="jewels-type">
                {{jewel.ornamentType ? jewel.ornamentType : 'Jewels' }}
                <span class="items font-medium inline-block md:block">
                  ({{jewel.noOfItems}} {{jewel.noOfItems === 1 ? $t('item') : $t('items')}})
                </span>
              </p>
              <div class="form-group m-0" v-if="loanInfo.showCheckBox">
                <input type="checkbox" :id="`${loanInfo.id}-${jewelIndex}`"
                class="cursor-pointer p-0 mb-0 hidden"
                @change="selectedJewels(
                  {
                    loanIndex: loanInfo.loanIndex,
                    jewelIndex,
                    selectedLoan: loanInfo.selectedLoan,
                  })"
                :checked="jewel.isSelected">
                <label class="relative cursor-pointer m-0 font-normal"
                  :for="`${loanInfo.id}-${jewelIndex}`">
                  <span>{{ $t('select')}}</span>
                  <span>{{ $t('selected')}}</span>
                </label>
              </div>
            </div>
          <div class="flex items-center justify-between relative mt-3">
            <div>
              <span class="jewels-details">
                {{$t('net_weight')}}
              </span>
              <p class="font-bold fnt-12">
                {{jewel.eligibleWeight && jewel.eligibleWeight.toFixed(2)}} gms
              </p>
            </div>
            <div>
              <span class="jewels-details">
                {{$t('gross_weight')}}
              </span>
              <p class="font-bold fnt-12">
                {{jewel.grossWeight && jewel.grossWeight.toFixed(2)}} gms
              </p>
            </div>
            <div>
              <img src="@/assets/img/info_icons/info-button.svg" alt="info"
                class="cursor-pointer sm:mr-3 md:mr-0"
                @click="viewTooltip(`${loanInfo.id}-${jewelIndex}`)">
              <!-- jewels info tooltip section -->
              <div class="jewels-tooltip p-4"
                v-if="selectedIndex === `${loanInfo.id}-${jewelIndex}`">
                <div class="d-flex justify-content-between align-items-center pb-3">
                  <span class="medium-font-weight">Gross Weight:</span>
                  <span class="white-color bold-font">
                    {{(jewel.grossWeight).toFixed(2)}} gms
                  </span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="medium-font-weight">*Net Weight:</span>
                  <span class="white-color bold-font">
                    {{(jewel.eligibleWeight).toFixed(2)}} gms
                  </span>
                </div>
                <div class="border-dash my-3"></div>
                <span>
                  * Net Weight : Weight after removing Stones & Impurities
                </span>
              </div>
              <!-- End's jewels info tooltip section -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <JewelsInDetailsModal
    :viewJewel="viewJewel"
    v-on:JewelsInDetailsModal='JewelsInDetailsModal($event)'
    v-if="hasShowJewelsModal"
  />
  </div>
</template>
<script>
import _ from 'lodash';
import { mapGetters } from 'vuex';
import store from '@/store';
import { partReleaseValidateAPI } from '@/api/partRelease.api';
import JewelsInDetailsModal from '@/components/CommonComponents/JewelsInDetailsModal.vue';
import { getSelectedJewels } from '@/utils/partRelease';

export default {
  name: 'JewelsSelection',
  data() {
    return {
      // for storing the selected index
      selectedIndex: null,
      viewJewel: {},
      selectedJewelsIndex: [],
      validationError: [],
      dialog: {},
      hasShowJewelsModal: false,
    };
  },
  props: {
    jewelsList: {
      type: Object,
      required: true,
    },
    loanInfo: {
      type: Object,
      required: true,
    },
  },
  components: {
    JewelsInDetailsModal,
  },
  computed: {
    ...mapGetters({
      unselectLastSeletedJewel: 'jewels/unselectLastSeletedJewel',
      selectedAddLoanClosure: 'jewels/selectedAddLoanClosure',
    }),
    _() {
      return _;
    },
  },
  watch: {
    unselectLastSeletedJewel(value) {
      if (value && this.selectedJewelsIndex.length) {
        this.selectedJewels(this.selectedJewelsIndex[(this.selectedJewelsIndex.length - 1)]);
      }
    },
    selectedAddLoanClosure(value) {
      if (value && this.selectedJewelsIndex.length) {
        this.validatedSelectedJewels();
      }
    },
  },
  methods: {
    // funtion call to show/hide view jewels info
    viewTooltip(index) {
      this.selectedIndex = this.selectedIndex !== index ? index : '';
    },
    // funtion call to show/hide jewels images
    zoomImage(jewel) {
      this.viewJewel = jewel;
      this.hasShowJewelsModal = true;
    },
    // funtion call to reset modal hide
    JewelsInDetailsModal(eventData) {
      this.hasShowJewelsModal = eventData;
    },
    // function call to get the selected jewels info
    selectedJewels(selectJewelsIndexes) {
      const isSameIndex = this.selectedJewelsIndex.some((indexs) => {
        const indexsValue = JSON.stringify(indexs);
        return indexsValue === JSON.stringify(selectJewelsIndexes);
      });
      store.dispatch('jewels/selectJewels', selectJewelsIndexes);
      if (isSameIndex) {
        store.dispatch('jewels/setLoanClosure');
        this.selectedJewelsIndex = this.selectedJewelsIndex.filter((indexs) => {
          const indexsValue = JSON.stringify(indexs);
          return indexsValue !== JSON.stringify(selectJewelsIndexes);
        });
      } else {
        this.selectedJewelsIndex.push(selectJewelsIndexes);
      }
      let selectedJewelsList = 0;
      const loans = getSelectedJewels();
      loans.forEach((loan) => {
        selectedJewelsList += loan.jewelsSelected.length;
        return selectedJewelsList;
      });
      store.dispatch('jewels/selectedJewelsCount', selectedJewelsList);
      store.dispatch('jewels/checkMultipleLenders');
      if (this.selectedJewelsIndex.length) {
        this.validatedSelectedJewels();
      }
    },
    // function call to validate the selected jewewls
    validatedSelectedJewels() {
      const loans = getSelectedJewels();
      let validationLoans = [];
      partReleaseValidateAPI({ loans })
        .then((response) => {
          const tempResponse = response.data.data;
          this.validationError = tempResponse.errorTags;
          const instantError = tempResponse.instantErrorTags;
          store.dispatch('jewels/updateDisabledContinueBtn', !tempResponse.valid);
          if (!tempResponse.valid) {
            if (this.validationError.length >= 2) {
              tempResponse.loans.forEach((element) => {
                if (element.errorCode !== null) {
                  this.dialog = tempResponse.errors[element.errorCode].dialog;
                  validationLoans.push(
                    this.getValidatedLoanObj(tempResponse, element.errorCode),
                  );
                }
              });
            } else {
              this.dialog = tempResponse.errors[this.validationError[0]].dialog;
              validationLoans.push(
                this.getValidatedLoanObj(tempResponse, this.validationError[0]),
              );
            }
          }
          const vLoans = validationLoans;
          validationLoans = [
            ...new Map(vLoans.map((item) => [item.errorCode, item])).values()];
          const isInstantError = this.validationError.some((item) => instantError.includes(item));
          if (isInstantError) {
            const validLoans = validationLoans;
            validationLoans = validLoans.filter((loan) => loan.errorCode === instantError[0]);
            validationLoans.map((loan) => {
              if (loan.errorCode === instantError[0]) { this.dialog = loan.dialog; }
              return true;
            });
          }
          const validationInfo = {
            storeValidationError: this.validationError,
            storeValidatedLoans: validationLoans,
            storeDialog: this.dialog,
          };
          store.dispatch('jewels/validationInfo', validationInfo);
          store.dispatch('jewels/showErrorMessageModal', isInstantError);
          store.dispatch('jewels/unselectLastSeletedJewel', false);
          store.dispatch('jewels/selectedAddLoanClosure', false);
        })
        .catch((error) => {
          this.$noty.error(error);
        });
    },
    // function call to get validate jewels messages
    getValidatedLoanObj(tempResponse, errorCode) {
      let lendersSizes = tempResponse.loans.map((loan) => loan.lenders.length);
      lendersSizes = [...new Set(lendersSizes)];
      const tempObj = {
        loans: [],
        errorCode,
        header: tempResponse.errors[errorCode].header,
        headerText: tempResponse.errors[errorCode].headerText,
        info: tempResponse.errors[errorCode].info,
        description: tempResponse.errors[errorCode].description,
        dialog: tempResponse.errors[errorCode].dialog,
      };
      if (lendersSizes.length !== 1) {
        const multipleLenders = [];
        const singleLender = [];
        tempResponse.loans.forEach((loan) => {
          if (loan.errorCode === errorCode) {
            if (loan.lenders.length !== 1) {
              multipleLenders.push(loan);
            } else {
              singleLender.push(loan);
            }
          }
        });
        tempObj.loans.push(multipleLenders);
        tempObj.loans.push(singleLender);
      } else {
        tempObj.loans = [tempResponse.loans.filter((loan) => loan.errorCode === errorCode)];
      }
      return tempObj;
    },
  },
};
</script>
<style lang='scss'>
.jewels-flex {
  display: inline-flex;
  gap: 16px;
}
.jewels-card {
  @media (min-width: 768px) {
    &.md\:w-30 {
      -ms-flex: 0 0 30%;
      -webkit-box-flex: 0;
      flex: 0 0 30%;
      max-width: 30%;
    }
  }
  @media (min-width: 1280px) {
    &.xl\:w-20 {
      -ms-flex: 0 0 22%;
      -webkit-box-flex: 0;
      flex: 0 0 22%;
      max-width: 22%;
    }
  }
  .zoom-image {
    position: absolute;
    top: 5%;
    left: 5%;
    -webkit-transform: translate(-5%, -5%);
    transform: translate(-5%, -5%);
    z-index: 99;
    @media only screen and (max-width: 600px) {
      top: 50%;
      left: 50%;
      -webkit-transform: translate(-50%, -50%);
      transform: translate(-50%, -50%);
    }
    .small-text {
      font-size: 10px;
      color: #727272;
    }
  }
}
.fnt-12 {
  font-size: 12px;
  line-height: 18px;
}
.bottom {
  clear: both;
  text-align: center;
}
.item {
  margin: 4px;
}
.left .el-tooltip__popper,
.right .el-tooltip__popper {
  padding: 8px 10px;
}
.loan-closure {
  background-color: #e8fce5;
  color: #969696;
  padding: 8px 12px;
  font-size: 10px;
  line-height: 1;
}
.disable-jewel {
  pointer-events: none;
  opacity: 0.7;
  background-color: #f2f2f2;
}
</style>
