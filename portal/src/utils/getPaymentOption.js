import store from '@/store';

function getPaymentOption(payment, isSuccess) {
  let paymentOption = '';
  switch (payment) {
    case 'interest':
      store.dispatch('loans/setPaymentOption', 'interest');
      paymentOption = isSuccess ? 'interest_payment_successful' : 'interest_payment_failure';
      break;
    case 'closing':
      store.dispatch('loans/setPaymentOption', 'closeLoan');
      paymentOption = isSuccess ? 'closure_payment_successful' : 'closure_payment_failure';
      break;
    case 'partial':
      store.dispatch('loans/setPaymentOption', 'partPayment');
      paymentOption = isSuccess ? 'partial_payment_successful' : 'partial_payment_failure';
      break;
    case 'hardrecovery':
      store.dispatch('loans/setPaymentOption', 'interest');
      paymentOption = isSuccess ? 'hardrecovery_payment_successful' : 'hardrecovery_payment_failure';
      break;
    case 'part-release':
      store.dispatch('loans/setPaymentOption', 'partialRelease');
      paymentOption = isSuccess ? 'part_release_successful' : 'part_release_payment_failed';
      break;
    case 'repledge':
      store.dispatch('loans/setPaymentOption', 'rePledge');
      paymentOption = isSuccess ? 'repledge_successful' : 'repledge_payment_failure';
      break;
    default:
      store.dispatch('loans/setPaymentOption', payment);
      paymentOption = 'something_went_wrong';
      break;
  }
  return paymentOption;
}
export default getPaymentOption;
