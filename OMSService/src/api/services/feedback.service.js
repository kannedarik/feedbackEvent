const createFeedbackEvent = async (payload) => {
    const options = {
        method: sails.config.GENERIC.METHODS.POST,
        uri: `${sails.config.FeedbackService.host}${sails.config.FeedbackService.createFeedbackEvent}`,
        headers: {
            'Content-Type': 'application/json',
        },
        body: payload,
        json: true,
    };
    const requestBody = createAuthHeader(options, sails.config.feedbackServiceBasicAuth.username, sails.config.feedbackServiceBasicAuth.password);
    sails.log.info(`feedback service - createFeedbackEvent called:: ${CommonService.util.inspect(options, { depth: null })}`);
    const res = await sails.helpers.requestHelper.with({
        'req': requestBody
    });
    if (res.response && res.response.statusCode === respMessages.successCodes.Default) {
        sails.log.info(`feedback service - createFeedbackEvent response:: ${CommonService.util.inspect(res.body)}`);
        return res.body.data;
    } else {
        sails.log.error(`Error occurred while creating feedback event :: ${CommonService.util.inspect(res.response.statusCode)} :: ${CommonService.util.inspect(res.body)}`);
        return {
            'err': 'createFeedbackEvent request failed'
        };
    }
}

const listFeedbackForms = async () => {
    const options = {
        method: sails.config.GENERIC.METHODS.GET,
        uri: `${sails.config.FeedbackService.host}${sails.config.FeedbackService.getFeedbackForms}`,
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
    };
    const requestBody = createAuthHeader(options, sails.config.feedbackServiceBasicAuth.username, sails.config.feedbackServiceBasicAuth.password);
}