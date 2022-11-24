export function formatRupeeAmount(amount) {
  if (!amount || amount <= 0) return 0;

  return `₹ ${amount.toLocaleString('en-IN')}`;
}

export function toRupeeAmount(amount) {
  const amt = amount ? amount.toLocaleString('en-IN') : 0;
  return { currency: '₹', amount: amt };
}

export function toMonthlyInterestRate(annualInterestRate) {
  return annualInterestRate ? (annualInterestRate / 12).toFixed(2) : '';
}
