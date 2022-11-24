<template>
  <div>
    <VueSlickCarousel
      v-bind="settings"
      class="jewels-carousel"
      v-if="jewelsList.length"
    >
      <b-card
        v-for="(jewels, index) in jewelsList"
        :key="index"
        :title="`${jewels.noOfItems} ${
          jewels.ornamentType ? jewels.ornamentType : 'Jewels'
        }`"
        :img-src="jewels.pictureLink"
        :img-alt="jewels.picture"
        img-top
        class="inter-font-family"
      >
        <img :src="Information"
          alt="information" class="zoom-image cursor-pointer"
          @click="zoomImage(jewels)" />
        <b-card-text class="d-flex justify-content-center"
          >Net Weight
          <img src="@/assets/icons/info_icon.svg" alt="into_icon" class="cursor-pointer ml-2"
            :id="`popover-target-${currentValue}${index}`" />
          <b-popover
            :target="`popover-target-${currentValue}${index}`"
            triggers="click"
            placement="bottom"
            custom-class="jewels-tooltip"
          >
            <div class="d-flex justify-content-between align-items-center pb-3">
              <span class="medium-font-weight">Gross Weight:</span>
              <span class="white-color bold-font">
                {{ jewels.grossWeight && jewels.grossWeight.toFixed(2) }} gms
              </span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="medium-font-weight">*Net Weight:</span>
              <span class="white-color bold-font">
                {{ jewels.eligibleWeight && jewels.eligibleWeight.toFixed(2) }} gms
              </span>
            </div>
            <div class="border-dash my-3"></div>
            <span>
              * Net Weight : Weight after removing Stones &amp; Impurities
            </span>
          </b-popover>
        </b-card-text>
        <b-card-text>
          {{ jewels.eligibleWeight && jewels.eligibleWeight.toFixed(2) }} gms
        </b-card-text>
      </b-card>
    </VueSlickCarousel>
    <JewelsInDetailsModal
      :viewJewel="viewJewel"
      v-on:JewelsInDetailsModal='JewelsInDetailsModal($event)'
      v-if="hasShowJewelsModal"
    />
  </div>
</template>

<script>
import VueSlickCarousel from 'vue-slick-carousel';
import JewelsInDetailsModal from '@/components/CommonComponents/JewelsInDetailsModal.vue';
import Information from '@/assets/img/info_icons/information.svg';

export default {
  name: 'JewelsList',
  components: {
    VueSlickCarousel,
    JewelsInDetailsModal,
  },
  props: {
    jewelsList: {
      type: Array,
      required: true,
    },
    index: {
      type: Number,
    },
  },
  data() {
    return {
      settings: {
        dots: false,
        arrows: true,
        infinite: false,
        touchMove: true,
        speed: 500,
        slidesToShow: 6,
        slidesToScroll: 1,
        initialSlide: 0,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 5,
            },
          },
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 4,
            },
          },
          {
            breakpoint: 600,
            settings: {
              arrows: false,
              slidesToShow: 3,
            },
          },
          {
            breakpoint: 360,
            settings: {
              arrows: false,
              slidesToShow: 2,
            },
          },
        ],
      },
      Information,
      currentValue: 0,
      viewJewel: {},
      hasShowJewelsModal: false,
    };
  },
  methods: {
    // funtion call to show/hide jewels images
    zoomImage(jewel) {
      this.viewJewel = jewel;
      this.hasShowJewelsModal = true;
    },
    // funtion call to reset modal hide
    JewelsInDetailsModal(eventData) {
      this.hasShowJewelsModal = eventData;
    },
  },
  mounted() {
    this.currentValue = this.index ? this.index : 0;
  },
};
</script>
<style scoped>
.zoom-image {
  position: absolute;
  top: 6px;
  left: 6px;
}
</style>
