<template>
  <div>
    <b-modal id="jewelInDetailsModal" ref="jewelInDetailsModal"
      size="sm" no-close-on-esc no-close-on-backdrop centered hide-footer hide-header>
      <div class="header p-3 d-flex justify-content-between align-items-center">
        <h4 class="bold-font">Jewel Details</h4>
        <img src="@/assets/close_icon_grey.svg"
          class="cursor-pointer" alt="close" @click="hideRestModal"/>
      </div>
      <div class="body">
        <img :src="jewelDetails.pictureLink" :alt="jewelDetails.ornamentType" class="img-fluid"/>
      </div>
      <div class="footer p-3">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <span class="medium-font-weight">
              {{jewelDetails.ornamentType ? jewelDetails.ornamentType : 'Jewels' }}
            </span>
            <span class="d-block small-text">
              {{jewelDetails.noOfItems}} {{jewelDetails.noOfItems !== 1 ? 'Items' : 'Item'}}
            </span>
          </div>
        </div>
        <div class="d-flex align-items-center justify-content-between">
          <p>
            <span class="small-text">Gross Weight</span>
            <span class="d-block bold-font fnt-12">{{jewelDetails.grossWeight}} gms</span>
          </p>
          <p>
            <span class="small-text">Net Weight</span>
            <span class="d-block bold-font fnt-12">{{jewelDetails.eligibleWeight}} gms</span>
          </p>
        </div>
      </div>
    </b-modal>
  </div>
</template>
<script>

export default {
  name: 'jewelDetails',
  props: {
    jewelDetails: {
      type: Object,
    },
  },
  methods: {
    // funtion call to reset modal hide
    hideRestModal() {
      this.$refs.jewelInDetailsModal.hide();
      this.$emit('closeDetails', false);
    },
  },
  mounted() {
    if (this.jewelDetails) {
      this.$refs.jewelInDetailsModal.show();
    }
  },
};
</script>
<style lang='scss' scoped>
.fnt-13 {
  font-size: 13px;
}
.h4 {
  font-size: 1.0625rem;
}
.small-text {
  font-size: 10px;
  color: #727272;
}
</style>
