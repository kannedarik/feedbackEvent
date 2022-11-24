import { getStaticMessageAPI } from '@/api/partRelease.api';

export default {
  data() {
    return {
      staticMessages: [],
      staticMessage: {},
      goldDeliveryMessages: [],
    };
  },
  methods: {
    getStaticMessages(identifierType, goldDeliveryMessage = false) {
      getStaticMessageAPI(identifierType)
        .then((responses) => {
          if (goldDeliveryMessage) {
            this.goldDeliveryMessages = responses.data.data;
          } else {
            this.staticMessages = responses.data.data;
            const data = Object.assign({},
              ...this.staticMessages.map((item) => ({ [item.identifier]: item })));
            this.staticMessage = data;
          }
        })
        .catch((error) => {
          this.$noty.error(error.message);
        });
    },
    getIdentifierStaticMessages(staticMessages, identifierType) {
      let staticMessagesObject = {};
      staticMessages.forEach((order) => {
        if (identifierType === order.identifier) {
          staticMessagesObject = order;
        }
      });
      return staticMessagesObject;
    },
  },
};
