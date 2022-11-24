export default {
  urls: {
    login: '/api/account/login',
    getInvalidData: '/api/v1/lendersupport/getinvaliddata',
    updateKeys: '/api/v1/lendersupport/updatekeys',
    getMisFile: '/api/v1/lendersupport/getmisfile',
  },
  links: [
    {
      key: 'verification',
      icon: ['fas', 'clipboard-list'],
      roles: ['admin'],
    },
  ],
};
