import store from '@/store';
import fetchRemoteConfig from '@/utils/firebase/firebaseConfig';
import getEnv from '@/utils/env';

export default {
  data() {
    return {
      assets: [],
    };
  },
  computed: {
    getAssets() {
      const sources = this.assets.map((asset) => ({
        type: asset.assetType,
        src: asset.assetUrl,
      }));
      const {
        title = '',
        description = '',
        duration = '',
        thumbnailUrl = '',
      } = this.assets[0];
      return {
        title,
        description,
        duration,
        sources,
        thumbnailUrl,
      };
    },
  },
  methods: {
    getAssetsFromFirebase(identifier) {
      const goldPriceAdjustmentKey = getEnv('NODE_ENV') === 'production'
        ? 'static_asset_config' : 'test_static_asset_config';
      fetchRemoteConfig(goldPriceAdjustmentKey)
        .then((value) => {
          /* eslint no-underscore-dangle: 0 */
          const totalAssets = JSON.parse(value._value).assets;
          this.assets = totalAssets.filter((asset) => asset.identifier === identifier);
          if (identifier === 'max_part_payment_amount_range') {
            store.dispatch('loans/maxPartPaymentAmountConfig', this.assets[0]);
          }
        })
        .catch((error) => {
          this.$noty.error(error);
        });
    },
    getPaymentConfig() {
      const goldPriceAdjustmentKey = getEnv('NODE_ENV') === 'production'
        ? 'payment_config' : 'payment_config_dev';
      fetchRemoteConfig(goldPriceAdjustmentKey)
        .then((value) => {
          /* eslint no-underscore-dangle: 0 */
          const totalAssets = JSON.parse(value._value).data;
          store.dispatch('loans/maxPartPaymentAmountConfig', totalAssets);
        })
        .catch((error) => {
          this.$noty.error(error);
        });
    },
  },
};
