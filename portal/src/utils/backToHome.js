import router from '@/router';

export default function backToHome() {
  router.go(-1);
}
