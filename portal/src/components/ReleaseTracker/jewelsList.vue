<template>
  <div class="white-background w-100 jewels-info">
    <h3 class="bold-font mb-4">
      <span v-if="currentStatusCode">
        {{ currentStatusCode >= 7 ? 'Gold Delivered' : 'Gold for Delivery' }}
        <span class="normal-font">({{jewelsList.length}})</span>
      </span>
      <span v-else>
        Your Gold
      </span>
    </h3>
    <JewelsCarousel :jewelsList="jewelsList" :index="indexValues"/>
  </div>
</template>

<script>
import JewelsCarousel from './jewelsCarousel.vue';

export default {
  name: 'JewelsList',
  components: { JewelsCarousel },
  props: {
    jewelsList: {
      type: Array,
      required: true,
    },
    currentStatusCode: {
      type: Number,
      require: true,
    },
  },
  data() {
    return {
      settings: {
        dots: false,
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
              slidesToShow: 3,
            },
          },
          {
            breakpoint: 360,
            settings: {
              slidesToShow: 2,
            },
          },
        ],
      },
      indexValues: 0,
    };
  },
};
</script>
<style scoped>
</style>
