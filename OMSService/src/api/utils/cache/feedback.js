const RedisClient  = require("redis");
const FeedbackService = require("../../services/feedback.service");

const getFormIdByEventName = async (key) => {
    try {
        const cachedValue = await RedisClient.getAsync(key);
        if (!_.isEmpty(cachedValue)) {
            return JSON.parse(cachedValue);
        } else {
            const feedbackForms = await FeedbackService.listFeedbackForms();
            const feedbackFormMap = {};
            if (!_.isEmpty(feedbackForms)) {
                await Promise.map(feedbackForms, async (feedbackForm) => {
                    const cacheKey = sails.config.redis.key.feedback.form + feedbackForm.eventName;
                    feedbackFormMap[cacheKey] = feedbackForm.id;
                    await RedisClient.setAsync(cacheKey, JSON.stringify(feedbackForm.id));
                });

                if (feedbackFormMap[key]) {
                    return feedbackFormMap[key];
                } else {
                    throw new Error("feedbackForm not found");
                }
            } else {
                throw new Error("feedbackForms not found");
            }
        }
    } catch (err) {
        sails.log.error(`Failed to fetch feedback forms from redis cache due to ${CommonService.util.inspect(err)}`);
        throw err;
    }
}
