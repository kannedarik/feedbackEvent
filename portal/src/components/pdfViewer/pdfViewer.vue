<script>
import { getUnsignedDocument } from '../../api/repledge.api';

export default {
  data() {
    return {
      url: '',
      scale: 2,
    };
  },
  methods: {
    async getDocument(orderid) {
      try {
        const response = await getUnsignedDocument(orderid);
        this.url = response.data.docurl;
      } catch (error) {
        this.$noty.error(error.message);
      }
    },
  },
  mounted() {
    this.getDocument(this.$route.params.id);
  },
};

</script>
