import _ from 'lodash';

export default function errorMessages(error) {
  const errorMessage = _.get(error, 'response.data');
  return (errorMessage
    ? (((Array.isArray(errorMessage.message)
      ? errorMessage.message.join('') : errorMessage.message)
      || errorMessage.UserMsg || errorMessage.error_message
      || errorMessage.error.error_message)
      || errorMessage)
    : 'Cannot connect to the server');
}
