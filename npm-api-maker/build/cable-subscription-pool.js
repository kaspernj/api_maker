import getChannelsConsumer from "./channels-consumer.js";
import CommandsPool from "./commands-pool.js";
import Deserializer from "./deserializer.js";
import { digg } from "diggerize";
import * as inflection from "inflection";
import Logger from "./logger.js";
const logger = new Logger({ name: "ApiMaker / CableSubscriptionPool" });
export default class ApiMakerCableSubscriptionPool {
    constructor() {
        this.activeSubscriptions = 0;
        this.connected = false;
    }
    connect(subscriptionData) {
        const globalData = CommandsPool.current().globalRequestData;
        logger.debug(() => ["Creating subscription", { subscriptionData }]);
        this.subscription = getChannelsConsumer().subscriptions.create({
            channel: "ApiMaker::SubscriptionsChannel",
            global: globalData,
            subscription_data: subscriptionData
        }, {
            connected: this.onConnected,
            received: this.onReceived,
            subscribed: this.onSubscribed
        });
        this.connected = true;
    }
    forEachSubscription(callback) {
        const modelIdModes = ["destroys", "updates"];
        const subscriptions = digg(this, "subscriptions");
        for (const modelName in subscriptions) {
            for (const modelIdMode of modelIdModes) {
                if (subscriptions[modelName][modelIdMode]) {
                    for (const modelId in subscriptions[modelName][modelIdMode]) {
                        for (const subscription of subscriptions[modelName][modelIdMode][modelId]) {
                            callback({ mode: modelIdMode, modelId, modelName, subscription });
                        }
                    }
                }
            }
            if (subscriptions[modelName].creates) {
                for (const subscription of subscriptions[modelName].creates) {
                    callback({ mode: "creates", modelName, subscription });
                }
            }
            if (subscriptions[modelName].model_class_events) {
                for (const eventName in subscriptions[modelName].model_class_events) {
                    for (const subscription of subscriptions[modelName].model_class_events[eventName]) {
                        callback({ eventName, mode: "model_class_events", modelName, subscription });
                    }
                }
            }
            if (subscriptions[modelName].events) {
                for (const modelId in subscriptions[modelName].events) {
                    for (const eventName in subscriptions[modelName].events[modelId]) {
                        for (const subscription of subscriptions[modelName].events[modelId][eventName]) {
                            callback({ eventName, mode: "updates", modelId, modelName, subscription });
                        }
                    }
                }
            }
        }
    }
    isConnected = () => digg(this, "connected");
    onConnected = () => {
        this.forEachSubscription(({ subscription }) => {
            subscription.events.emit("connected");
        });
    };
    onReceived = (rawData) => {
        const data = Deserializer.parse(rawData);
        const { a: args, e: eventName, m: model, mi: modelId, mt: modelType, t: type } = data;
        const subscriptions = digg(this, "subscriptions");
        let modelName;
        // This is more effective if it is an option
        if (model) {
            modelName = digg(model.modelClassData(), "name");
        }
        else {
            modelName = inflection.camelize(inflection.singularize(modelType));
        }
        if (type == "u") {
            for (const subscription of subscriptions[modelName].updates[modelId]) {
                subscription.events.emit("received", { model });
            }
        }
        else if (type == "c") {
            for (const subscription of subscriptions[modelName].creates) {
                subscription.events.emit("received", { model });
            }
        }
        else if (type == "d") {
            const destroySubscriptions = digg(subscriptions, modelName, "destroys", modelId);
            for (const subscription of destroySubscriptions) {
                subscription.events.emit("received", { model });
            }
        }
        else if (type == "e") {
            const eventSubscriptions = digg(subscriptions, modelName, "events", eventName, modelId);
            for (const subscription of eventSubscriptions) {
                subscription.events.emit("received", { args, eventName, model });
            }
        }
        else if (type == "mce") {
            const modelClassEventSubscriptions = digg(subscriptions, modelName, "model_class_events", eventName);
            for (const subscription of modelClassEventSubscriptions) {
                subscription.events.emit("received", { args, eventName });
            }
        }
        else {
            throw new Error(`Unknown type: ${data.type}`);
        }
    };
    onSubscribed = () => {
        logger.debug("onSubscribed");
    };
    onUnsubscribe() {
        logger.debug(() => `activeSubscriptions before unsub: ${this.activeSubscriptions}`);
        this.activeSubscriptions -= 1;
        logger.debug(() => `activeSubscriptions after unsub: ${this.activeSubscriptions}`);
        if (this.activeSubscriptions <= 0) {
            logger.debug("Unsubscribe from ActionCable subscription");
            this.subscription.unsubscribe();
            this.connected = false;
        }
    }
    registerSubscriptions(subscriptions) {
        this.subscriptions = subscriptions;
        logger.debug(() => ["registerSubscriptions", { subscriptions }]);
        for (const modelName in subscriptions) {
            if (subscriptions[modelName].creates) {
                for (const subscription of subscriptions[modelName].creates) {
                    this.connectUnsubscriptionForSubscription(subscription);
                }
            }
            if (subscriptions[modelName].events) {
                for (const eventName in subscriptions[modelName].events) {
                    for (const modelId in subscriptions[modelName].events[eventName]) {
                        for (const subscription of subscriptions[modelName].events[eventName][modelId]) {
                            this.connectUnsubscriptionForSubscription(subscription);
                        }
                    }
                }
            }
            if (subscriptions[modelName].updates) {
                for (const modelId in subscriptions[modelName].updates) {
                    for (const subscription of subscriptions[modelName].updates[modelId]) {
                        this.connectUnsubscriptionForSubscription(subscription);
                    }
                }
            }
        }
    }
    connectUnsubscriptionForSubscription(subscription) {
        logger.debug(() => ["Connecting to unsubscribe on subscription", { subscription }]);
        this.activeSubscriptions += 1;
        subscription.events.addListener("unsubscribed", () => {
            logger.debug("Call onUnsubscribe on self");
            this.onUnsubscribe(subscription);
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FibGUtc3Vic2NyaXB0aW9uLXBvb2wuanMiLCJzb3VyY2VSb290IjoiL3NyYy8iLCJzb3VyY2VzIjpbImNhYmxlLXN1YnNjcmlwdGlvbi1wb29sLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sbUJBQW1CLE1BQU0sd0JBQXdCLENBQUE7QUFDeEQsT0FBTyxZQUFZLE1BQU0sb0JBQW9CLENBQUE7QUFDN0MsT0FBTyxZQUFZLE1BQU0sbUJBQW1CLENBQUE7QUFDNUMsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLFdBQVcsQ0FBQTtBQUM5QixPQUFPLEtBQUssVUFBVSxNQUFNLFlBQVksQ0FBQTtBQUN4QyxPQUFPLE1BQU0sTUFBTSxhQUFhLENBQUE7QUFFaEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsRUFBQyxJQUFJLEVBQUUsa0NBQWtDLEVBQUMsQ0FBQyxDQUFBO0FBRXJFLE1BQU0sQ0FBQyxPQUFPLE9BQU8sNkJBQTZCO0lBQ2hEO1FBQ0UsSUFBSSxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQTtRQUM1QixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQTtJQUN4QixDQUFDO0lBRUQsT0FBTyxDQUFFLGdCQUFnQjtRQUN2QixNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUMsaUJBQWlCLENBQUE7UUFFM0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLHVCQUF1QixFQUFFLEVBQUMsZ0JBQWdCLEVBQUMsQ0FBQyxDQUFDLENBQUE7UUFFakUsSUFBSSxDQUFDLFlBQVksR0FBRyxtQkFBbUIsRUFBRSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQzVEO1lBQ0UsT0FBTyxFQUFFLGdDQUFnQztZQUN6QyxNQUFNLEVBQUUsVUFBVTtZQUNsQixpQkFBaUIsRUFBRSxnQkFBZ0I7U0FDcEMsRUFDRDtZQUNFLFNBQVMsRUFBRSxJQUFJLENBQUMsV0FBVztZQUMzQixRQUFRLEVBQUUsSUFB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LFdBQVcsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO1lBQ25ELE1BQU0sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQTtZQUUxQyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFBO1FBQ2xDLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGdldENoYW5uZWxzQ29uc3VtZXIgZnJvbSBcIi4vY2hhbm5lbHMtY29uc3VtZXIuanNcIlxuaW1wb3J0IENvbW1hbmRzUG9vbCBmcm9tIFwiLi9jb21tYW5kcy1wb29sLmpzXCJcbmltcG9ydCBEZXNlcmlhbGl6ZXIgZnJvbSBcIi4vZGVzZXJpYWxpemVyLmpzXCJcbmltcG9ydCB7ZGlnZ30gZnJvbSBcImRpZ2dlcml6ZVwiXG5pbXBvcnQgKiBhcyBpbmZsZWN0aW9uIGZyb20gXCJpbmZsZWN0aW9uXCJcbmltcG9ydCBMb2dnZXIgZnJvbSBcIi4vbG9nZ2VyLmpzXCJcblxuY29uc3QgbG9nZ2VyID0gbmV3IExvZ2dlcih7bmFtZTogXCJBcGlNYWtlciAvIENhYmxlU3Vic2NyaXB0aW9uUG9vbFwifSlcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBpTWFrZXJDYWJsZVN1YnNjcmlwdGlvblBvb2wge1xuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy5hY3RpdmVTdWJzY3JpcHRpb25zID0gMFxuICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2VcbiAgfVxuXG4gIGNvbm5lY3QgKHN1YnNjcmlwdGlvbkRhdGEpIHtcbiAgICBjb25zdCBnbG9iYWxEYXRhID0gQ29tbWFuZHNQb29sLmN1cnJlbnQoKS5nbG9iYWxSZXF1ZXN0RGF0YVxuXG4gICAgbG9nZ2VyLmRlYnVnKCgpID0+IFtcIkNyZWF0aW5nIHN1YnNjcmlwdGlvblwiLCB7c3Vic2NyaXB0aW9uRGF0YX1dKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb24gPSBnZXRDaGFubmVsc0NvbnN1bWVyKCkuc3Vic2NyaXB0aW9ucy5jcmVhdGUoXG4gICAgICB7XG4gICAgICAgIGNoYW5uZWw6IFwiQXBpTWFrZXI6OlN1YnNjcmlwdGlvbnNDaGFubmVsXCIsXG4gICAgICAgIGdsb2JhbDogZ2xvYmFsRGF0YSxcbiAgICAgICAgc3Vic2NyaXB0aW9uX2RhdGE6IHN1YnNjcmlwdGlvbkRhdGFcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGNvbm5lY3RlZDogdGhpcy5vbkNvbm5lY3RlZCxcbiAgICAgICAgcmVjZWl2ZWQ6IHRoaXMub25SZWNlaXZlZCxcbiAgICAgICAgc3Vic2NyaWJlZDogdGhpcy5vblN1YnNjcmliZWRcbiAgICAgIH1cbiAgICApXG4gICAgdGhpcy5jb25uZWN0ZWQgPSB0cnVlXG4gIH1cblxuICBmb3JFYWNoU3Vic2NyaXB0aW9uIChjYWxsYmFjaykge1xuICAgIGNvbnN0IG1vZGVsSWRNb2RlcyA9IFtcImRlc3Ryb3lzXCIsIFwidXBkYXRlc1wiXVxuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBkaWdnKHRoaXMsIFwic3Vic2NyaXB0aW9uc1wiKVxuXG4gICAgZm9yIChjb25zdCBtb2RlbE5hbWUgaW4gc3Vic2NyaXB0aW9ucykge1xuICAgICAgZm9yIChjb25zdCBtb2RlbElkTW9kZSBvZiBtb2RlbElkTW9kZXMpIHtcbiAgICAgICAgaWYgKHN1YnNjcmlwdGlvbnNbbW9kZWxOYW1lXVttb2RlbElkTW9kZV0pIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IG1vZGVsSWQgaW4gc3Vic2NyaXB0aW9uc1ttb2RlbE5hbWVdW21vZGVsSWRNb2RlXSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBzdWJzY3JpcHRpb24gb2Ygc3Vic2NyaXB0aW9uc1ttb2RlbE5hbWVdW21vZGVsSWRNb2RlXVttb2RlbElkXSkge1xuICAgICAgICAgICAgICBjYWxsYmFjayh7bW9kZTogbW9kZWxJZE1vZGUsIG1vZGVsSWQsIG1vZGVsTmFtZSwgc3Vic2NyaXB0aW9ufSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHN1YnNjcmlwdGlvbnNbbW9kZWxOYW1lXS5jcmVhdGVzKSB7XG4gICAgICAgIGZvciAoY29uc3Qgc3Vic2NyaXB0aW9uIG9mIHN1YnNjcmlwdGlvbnNbbW9kZWxOYW1lXS5jcmVhdGVzKSB7XG4gICAgICAgICAgY2FsbGJhY2soe21vZGU6IFwiY3JlYXRlc1wiLCBtb2RlbE5hbWUsIHN1YnNjcmlwdGlvbn0pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHN1YnNjcmlwdGlvbnNbbW9kZWxOYW1lXS5tb2RlbF9jbGFzc19ldmVudHMpIHtcbiAgICAgICAgZm9yIChjb25zdCBldmVudE5hbWUgaW4gc3Vic2NyaXB0aW9uc1ttb2RlbE5hbWVdLm1vZGVsX2NsYXNzX2V2ZW50cykge1xuICAgICAgICAgIGZvciAoY29uc3Qgc3Vic2NyaXB0aW9uIG9mIHN1YnNjcmlwdGlvbnNbbW9kZWxOYW1lXS5tb2RlbF9jbGFzc19ldmVudHNbZXZlbnROYW1lXSkge1xuICAgICAgICAgICAgY2FsbGJhY2soe2V2ZW50TmFtZSwgbW9kZTogXCJtb2RlbF9jbGFzc19ldmVudHNcIiwgbW9kZWxOYW1lLCBzdWJzY3JpcHRpb259KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc3Vic2NyaXB0aW9uc1ttb2RlbE5hbWVdLmV2ZW50cykge1xuICAgICAgICBmb3IgKGNvbnN0IG1vZGVsSWQgaW4gc3Vic2NyaXB0aW9uc1ttb2RlbE5hbWVdLmV2ZW50cykge1xuICAgICAgICAgIGZvciAoY29uc3QgZXZlbnROYW1lIGluIHN1YnNjcmlwdGlvbnNbbW9kZWxOYW1lXS5ldmVudHNbbW9kZWxJZF0pIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc3Vic2NyaXB0aW9uIG9mIHN1YnNjcmlwdGlvbnNbbW9kZWxOYW1lXS5ldmVudHNbbW9kZWxJZF1bZXZlbnROYW1lXSkge1xuICAgICAgICAgICAgICBjYWxsYmFjayh7ZXZlbnROYW1lLCBtb2RlOiBcInVwZGF0ZXNcIiwgbW9kZWxJZCwgbW9kZWxOYW1lLCBzdWJzY3JpcHRpb259KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzQ29ubmVjdGVkID0gKCkgPT4gZGlnZyh0aGlzLCBcImNvbm5lY3RlZFwiKVxuXG4gIG9uQ29ubmVjdGVkID0gKCkgPT4ge1xuICAgIHRoaXMuZm9yRWFjaFN1YnNjcmlwdGlvbigoe3N1YnNjcmlwdGlvbn0pID0+IHtcbiAgICAgIHN1YnNjcmlwdGlvbi5ldmVudHMuZW1pdChcImNvbm5lY3RlZFwiKVxuICAgIH0pXG4gIH1cblxuICBvblJlY2VpdmVkID0gKHJhd0RhdGEpID0+IHtcbiAgICBjb25zdCBkYXRhID0gRGVzZXJpYWxpemVyLnBhcnNlKHJhd0RhdGEpXG4gICAgY29uc3Qge2E6IGFyZ3MsIGU6IGV2ZW50TmFtZSwgbTogbW9kZWwsIG1pOiBtb2RlbElkLCBtdDogbW9kZWxUeXBlLCB0OiB0eXBlfSA9IGRhdGFcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gZGlnZyh0aGlzLCBcInN1YnNjcmlwdGlvbnNcIilcblxuICAgIGxldCBtb2RlbE5hbWVcblxuICAgIC8vIFRoaXMgaXMgbW9yZSBlZmZlY3RpdmUgaWYgaXQgaXMgYW4gb3B0aW9uXG4gICAgaWYgKG1vZGVsKSB7XG4gICAgICBtb2RlbE5hbWUgPSBkaWdnKG1vZGVsLm1vZGVsQ2xhc3NEYXRhKCksIFwibmFtZVwiKVxuICAgIH0gZWxzZSB7XG4gICAgICBtb2RlbE5hbWUgPSBpbmZsZWN0aW9uLmNhbWVsaXplKGluZmxlY3Rpb24uc2luZ3VsYXJpemUobW9kZWxUeXBlKSlcbiAgICB9XG5cbiAgICBpZiAodHlwZSA9PSBcInVcIikge1xuICAgICAgZm9yIChjb25zdCBzdWJzY3JpcHRpb24gb2Ygc3Vic2NyaXB0aW9uc1ttb2RlbE5hbWVdLnVwZGF0ZXNbbW9kZWxJZF0pIHtcbiAgICAgICAgc3Vic2NyaXB0aW9uLmV2ZW50cy5lbWl0KFwicmVjZWl2ZWRcIiwge21vZGVsfSlcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJjXCIpIHtcbiAgICAgIGZvciAoY29uc3Qgc3Vic2NyaXB0aW9uIG9mIHN1YnNjcmlwdGlvbnNbbW9kZWxOYW1lXS5jcmVhdGVzKSB7XG4gICAgICAgIHN1YnNjcmlwdGlvbi5ldmVudHMuZW1pdChcInJlY2VpdmVkXCIsIHttb2RlbH0pXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiZFwiKSB7XG4gICAgICBjb25zdCBkZXN0cm95U3Vic2NyaXB0aW9ucyA9IGRpZ2coc3Vic2NyaXB0aW9ucywgbW9kZWxOYW1lLCBcImRlc3Ryb3lzXCIsIG1vZGVsSWQpXG5cbiAgICAgIGZvciAoY29uc3Qgc3Vic2NyaXB0aW9uIG9mIGRlc3Ryb3lTdWJzY3JpcHRpb25zKSB7XG4gICAgICAgIHN1YnNjcmlwdGlvbi5ldmVudHMuZW1pdChcInJlY2VpdmVkXCIsIHttb2RlbH0pXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlID09IFwiZVwiKSB7XG4gICAgICBjb25zdCBldmVudFN1YnNjcmlwdGlvbnMgPSBkaWdnKHN1YnNjcmlwdGlvbnMsIG1vZGVsTmFtZSwgXCJldmVudHNcIiwgZXZlbnROYW1lLCBtb2RlbElkKVxuXG4gICAgICBmb3IgKGNvbnN0IHN1YnNjcmlwdGlvbiBvZiBldmVudFN1YnNjcmlwdGlvbnMpIHtcbiAgICAgICAgc3Vic2NyaXB0aW9uLmV2ZW50cy5lbWl0KFwicmVjZWl2ZWRcIiwge2FyZ3MsIGV2ZW50TmFtZSwgbW9kZWx9KVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PSBcIm1jZVwiKSB7XG4gICAgICBjb25zdCBtb2RlbENsYXNzRXZlbnRTdWJzY3JpcHRpb25zID0gZGlnZyhzdWJzY3JpcHRpb25zLCBtb2RlbE5hbWUsIFwibW9kZWxfY2xhc3NfZXZlbnRzXCIsIGV2ZW50TmFtZSlcblxuICAgICAgZm9yIChjb25zdCBzdWJzY3JpcHRpb24gb2YgbW9kZWxDbGFzc0V2ZW50U3Vic2NyaXB0aW9ucykge1xuICAgICAgICBzdWJzY3JpcHRpb24uZXZlbnRzLmVtaXQoXCJyZWNlaXZlZFwiLCB7YXJncywgZXZlbnROYW1lfSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHR5cGU6ICR7ZGF0YS50eXBlfWApXG4gICAgfVxuICB9XG5cbiAgb25TdWJzY3JpYmVkID0gKCkgPT4ge1xuICAgIGxvZ2dlci5kZWJ1ZyhcIm9uU3Vic2NyaWJlZFwiKVxuICB9XG5cbiAgb25VbnN1YnNjcmliZSAoKSB7XG4gICAgbG9nZ2VyLmRlYnVnKCgpID0+IGBhY3RpdmVTdWJzY3JpcHRpb25zIGJlZm9yZSB1bnN1YjogJHt0aGlzLmFjdGl2ZVN1YnNjcmlwdGlvbnN9YClcbiAgICB0aGlzLmFjdGl2ZVN1YnNjcmlwdGlvbnMgLT0gMVxuICAgIGxvZ2dlci5kZWJ1ZygoKSA9PiBgYWN0aXZlU3Vic2NyaXB0aW9ucyBhZnRlciB1bnN1YjogJHt0aGlzLmFjdGl2ZVN1YnNjcmlwdGlvbnN9YClcblxuICAgIGlmICh0aGlzLmFjdGl2ZVN1YnNjcmlwdGlvbnMgPD0gMCkge1xuICAgICAgbG9nZ2VyLmRlYnVnKFwiVW5zdWJzY3JpYmUgZnJvbSBBY3Rpb25DYWJsZSBzdWJzY3JpcHRpb25cIilcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKClcbiAgICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2VcbiAgICB9XG4gIH1cblxuICByZWdpc3RlclN1YnNjcmlwdGlvbnMgKHN1YnNjcmlwdGlvbnMpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBzdWJzY3JpcHRpb25zXG5cbiAgICBsb2dnZXIuZGVidWcoKCkgPT4gW1wicmVnaXN0ZXJTdWJzY3JpcHRpb25zXCIsIHtzdWJzY3JpcHRpb25zfV0pXG5cbiAgICBmb3IgKGNvbnN0IG1vZGVsTmFtZSBpbiBzdWJzY3JpcHRpb25zKSB7XG4gICAgICBpZiAoc3Vic2NyaXB0aW9uc1ttb2RlbE5hbWVdLmNyZWF0ZXMpIHtcbiAgICAgICAgZm9yIChjb25zdCBzdWJzY3JpcHRpb24gb2Ygc3Vic2NyaXB0aW9uc1ttb2RlbE5hbWVdLmNyZWF0ZXMpIHtcbiAgICAgICAgICB0aGlzLmNvbm5lY3RVbnN1YnNjcmlwdGlvbkZvclN1YnNjcmlwdGlvbihzdWJzY3JpcHRpb24pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHN1YnNjcmlwdGlvbnNbbW9kZWxOYW1lXS5ldmVudHMpIHtcbiAgICAgICAgZm9yIChjb25zdCBldmVudE5hbWUgaW4gc3Vic2NyaXB0aW9uc1ttb2RlbE5hbWVdLmV2ZW50cykge1xuICAgICAgICAgIGZvciAoY29uc3QgbW9kZWxJZCBpbiBzdWJzY3JpcHRpb25zW21vZGVsTmFtZV0uZXZlbnRzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc3Vic2NyaXB0aW9uIG9mIHN1YnNjcmlwdGlvbnNbbW9kZWxOYW1lXS5ldmVudHNbZXZlbnROYW1lXVttb2RlbElkXSkge1xuICAgICAgICAgICAgICB0aGlzLmNvbm5lY3RVbnN1YnNjcmlwdGlvbkZvclN1YnNjcmlwdGlvbihzdWJzY3JpcHRpb24pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzdWJzY3JpcHRpb25zW21vZGVsTmFtZV0udXBkYXRlcykge1xuICAgICAgICBmb3IgKGNvbnN0IG1vZGVsSWQgaW4gc3Vic2NyaXB0aW9uc1ttb2RlbE5hbWVdLnVwZGF0ZXMpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IHN1YnNjcmlwdGlvbiBvZiBzdWJzY3JpcHRpb25zW21vZGVsTmFtZV0udXBkYXRlc1ttb2RlbElkXSkge1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0VW5zdWJzY3JpcHRpb25Gb3JTdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbm5lY3RVbnN1YnNjcmlwdGlvbkZvclN1YnNjcmlwdGlvbiAoc3Vic2NyaXB0aW9uKSB7XG4gICAgbG9nZ2VyLmRlYnVnKCgpID0+IFtcIkNvbm5lY3RpbmcgdG8gdW5zdWJzY3JpYmUgb24gc3Vic2NyaXB0aW9uXCIsIHtzdWJzY3JpcHRpb259XSlcblxuICAgIHRoaXMuYWN0aXZlU3Vic2NyaXB0aW9ucyArPSAxXG5cbiAgICBzdWJzY3JpcHRpb24uZXZlbnRzLmFkZExpc3RlbmVyKFwidW5zdWJzY3JpYmVkXCIsICgpID0+IHtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhcIkNhbGwgb25VbnN1YnNjcmliZSBvbiBzZWxmXCIpXG5cbiAgICAgIHRoaXMub25VbnN1YnNjcmliZShzdWJzY3JpcHRpb24pXG4gICAgfSlcbiAgfVxufVxuIl19