import moment from 'moment';
import get from 'lodash/get';
import { toMonthlyInterestRate } from './string';

export const InterestType = Object.freeze({
  INTEREST_DUE: 'interestdue',
  INTEREST_OVERDUE: 'interestoverdue',
  NEXT_INTEREST_DUE: 'nextinterestdue',
});

export function checkInterestDue(loans) {
  let interestDue = {};
  const interestDueDate = moment(get(loans[0], 'duedate')).format('DD/MM/YYYY');
  if (loans.length >= 1 && get(loans[0], 'duedate')
    && get(loans[0], 'schemedata.type') !== 'monthly') {
    if (get(loans[0], 'schemedata.type') === 'flat') {
      interestDue = {
        interestType: InterestType.INTEREST_DUE,
        textColor: '',
        dueDateText: `Interest due on ${interestDueDate}`,
      };
    } else if (get(loans[0], 'stage') === InterestType.INTEREST_DUE) {
      if (!get(loans[0], 'duedays')) {
        interestDue = {
          interestType: InterestType.INTEREST_DUE,
          textColor: 'chip__text__danger',
          dueDateText: 'Interest due today',
        };
      } else if (get(loans[0], 'duedays')) {
        interestDue = {
          interestType: InterestType.INTEREST_DUE,
          textColor: 'chip__text__danger',
          dueDateText: `Interest due in ${get(loans[0], 'duedays')} ${get(loans[0], 'duedays') !== 1 ? 'days' : 'day'}`,
        };
      } else {
        interestDue = {
          interestType: InterestType.INTEREST_DUE,
          textColor: '',
          dueDateText: `Interest due on ${interestDueDate}`,
        };
      }
    } else if (get(loans[0], 'stage') === InterestType.INTEREST_OVERDUE) {
      interestDue = {
        interestType: InterestType.INTEREST_OVERDUE,
        textColor: 'chip__text__danger',
        dueDateText: get(loans[0], 'graceperiodduedate'),
      };
    } else if (get(loans[0], 'stage') === InterestType.NEXT_INTEREST_DUE) {
      interestDue = {
        interestType: InterestType.NEXT_INTEREST_DUE,
        textColor: '',
        dueDateText: `Interest <b>@${toMonthlyInterestRate(loans[0].currentinterestrate)}% p.m.</b> due on ${interestDueDate}`,
      };
    }
  } else if (loans.length >= 1 && get(loans[0], 'schemedata.type') === 'monthly' && get(loans[0], 'duedate')) {
    const todayDate = new Date(moment().format('MM/DD/YYYY'));
    const nextInterestDueDate = new Date(moment(get(loans[0], 'duedate')).format('MM/DD/YYYY'));
    // To calculate the time difference of two dates
    const differenceInTime = nextInterestDueDate.getTime() - todayDate.getTime();
    // To calculate the no. of days between two dates
    const noOfDays = Math.abs(differenceInTime / (1000 * 3600 * 24));
    if (todayDate > nextInterestDueDate) {
      interestDue = {
        textColor: 'chip__text__danger',
        dueDateText: `Interest Overdue by ${noOfDays} days`,
      };
    } else if (noOfDays < 4) {
      interestDue = {
        textColor: noOfDays ? 'chip__text__danger' : '',
        dueDateText: noOfDays ? `Interest Due in ${noOfDays} days` : 'Interest Overdue today',
      };
    } else {
      interestDue = {
        textColor: '',
        dueDateText: !(get(loans[0], 'jumping'))
          ? `Interest due on ${interestDueDate}`
          : `Interest <b>@${toMonthlyInterestRate(loans[0].currentinterestrate)}% p.m.</b>
            due on ${interestDueDate}`,
      };
    }
  }
  return interestDue;
}
