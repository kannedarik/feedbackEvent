const { v1: uuidv1 } = require('uuid');

const { Duration } = require('zeebe-node');
const zbc = require('../../config/zeebe');
const { logger } = require('../../config/logger');

exports.deployWorkflow = async (path) => {
  const response = await zbc.deployWorkflow(path);
  return response;
};

exports.createWorkflowInstance = async (wfName, variables) => {
  const response = await zbc.createWorkflowInstance(wfName, variables);
  return response;
};

exports.publishMessage = async (correlationKey, name, message) => {
  const messageOptions = {
    correlationKey,
    name,
  };
  logger.info('Publishing message to zeebe: ', messageOptions);
  const response = await zbc.publishMessage({
    correlationKey,
    messageId: uuidv1(),
    name,
    variables: message,
    timeToLive: Duration.minutes.of(10),
  });
  return response;
};
