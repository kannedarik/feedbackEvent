const axios = require('axios');
const { firebase } = require('../../config/vars');

exports.createLink = async (longLink, useApp = false) => {
  const options = {
    url: 'https://firebasedynamiclinks.googleapis.com/v1/shortLinks',
    method: 'POST',
    params: {
      key: firebase.key,
    },
    data: {
      dynamicLinkInfo: {
        dynamicLinkDomain: firebase.domain,
        link: longLink,
        ...(useApp && {
          androidInfo: {
            androidPackageName: 'com.rupeek.customer',
            androidFallbackLink: longLink,
          },
        }),
        socialMetaTagInfo: {
          socialTitle: 'Best gold loan company in India | Rupeek',
          socialDescription: 'Online gold loans at your doorstep',
          socialImageLink: 'https://rupeek.com/images/social-share-rupeek.jpg',
        },
      },
      suffix: {
        option: 'SHORT',
      },
    },
    json: true,
  };

  const { data } = await axios(options);
  return data;
};
