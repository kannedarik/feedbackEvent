import clevertap from 'clevertap-web-sdk';
import events from './eventconstants';

export function sendEvent(context, event, properties) {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const System = isMobile ? 'Mobile' : 'Desktop';
  const eventProperties = { ...properties, System, [events.EVENT_SOURCE]: context };
  clevertap.event.push(event, eventProperties);
}

export function formatRupeeAmount(amount) {
  if (!amount) return '-';

  return `₹ ${amount.toLocaleString('en-IN')}`;
}
export function mapCleverTapProperty(paymentOption, populateAmounts = {}) {
  const options = {
    rePledge: { action: events.CAPABILITY_REPLEDGE },
    repledge: { action: events.CAPABILITY_REPLEDGE },
    closeLoan: {
      action: events.CAPABILITY_CLOSURE,
      amount: formatRupeeAmount(populateAmounts.closingAmount),
    },
    closing: {
      action: events.CAPABILITY_CLOSURE,
      amount: formatRupeeAmount(populateAmounts.closingAmount),
    },
    partPayment: {
      action: events.CAPABILITY_PART_PAYMENT,
      amount: `${formatRupeeAmount(populateAmounts.interestAmount)}-${formatRupeeAmount(populateAmounts.partPaymentClosingAmount)}`,
    },
    partial: {
      action: events.CAPABILITY_PART_PAYMENT,
      amount: `${formatRupeeAmount(populateAmounts.interestAmount)}-${formatRupeeAmount(populateAmounts.partPaymentClosingAmount)}`,
    },
    interest: {
      action: events.CAPABILITY_INTEREST,
      amount: formatRupeeAmount(populateAmounts.interestAmount),
    },
    hardrecovery: {
      action: events.CAPABILITY_HARD_RECOVERY,
      amount: formatRupeeAmount(populateAmounts.hardrecovery),
    },
  };

  return options[paymentOption] ? options[paymentOption] : {};
}
