<template>
  <b-modal id="JewelsInDetailsModal" ref="JewelsInDetailsModal"
    size="sm" no-close-on-esc no-close-on-backdrop centered hide-footer hide-header>
    <div class="header flex justify-between items-center px-3 py-2">
      <h4 class="bold-font">Jewel Details</h4>
      <img src="@/assets/icons/new_closing_icon.svg" class="cursor-pointer" alt="close"
        @click="hideRestModal"/>
    </div>
    <div class="body">
      <img :src="viewJewel.pictureLink" class="img-fluid"
        :alt="viewJewel.ornamentType ? viewJewel.ornamentType : 'jewels'" />
    </div>
    <div class="px-3 py-2">
      <div>
        <span class="medium-font-weight">
          {{ viewJewel.ornamentType ? viewJewel.ornamentType : 'Jewels' }}
        </span>
        <span class="block small-text">
          {{ viewJewel.noOfItems }} {{ viewJewel.noOfItems === 1 ? $t('item') : $t('items') }}
        </span>
      </div>
      <div class="flex items-center mt-4">
        <p class="w-1/2">
          <span class="small-text">
            {{$t('gross_weight')}}
          </span>
          <span class="block font-bold fnt-12">
            {{ viewJewel.grossWeight && viewJewel.grossWeight.toFixed(2) }} gms
          </span>
        </p>
        <p>
          <span class="small-text">
            {{$t('net_weight')}}
          </span>
          <span class="block font-bold fnt-12">
            {{ viewJewel.eligibleWeight && viewJewel.eligibleWeight.toFixed(2) }} gms
          </span>
        </p>
      </div>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'JewelsInDetailsModal',
  props: {
    viewJewel: {
      type: Object,
      required: true,
    },
  },
  methods: {
    // funtion call to reset modal hide
    hideRestModal() {
      this.$emit('JewelsInDetailsModal', false);
      this.$refs.JewelsInDetailsModal.hide();
    },
  },
  mounted() {
    this.$refs.JewelsInDetailsModal.show();
  },
};
</script>
