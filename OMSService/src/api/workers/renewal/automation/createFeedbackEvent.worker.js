
const Feedback = require('../../../utils/cache/feedback');
const FeedbackService = require('../../../services/feedback.service');

module.exports = () => ({
    taskType: 'renewal.feedback.create',
    taskHandler: async (job) => {
        try{
            const formId = await Feedback.getFormIdByEventName("RENEWAL_COMPLETED");
            
            const metaData = {
                
                orderId: job.variables.orderId,
            }
            const payload = {
                formId: formId,
                metaData: metaData,
            }
            FeedbackService.createFeedbackEvent(payload);

        }catch(err){
            sails.log.error(`createFeedbackEvent error for renewal :: ${job.variables.orderId} with error :: ${CommonService.util.inspect(err)} `);
        }
    },
});