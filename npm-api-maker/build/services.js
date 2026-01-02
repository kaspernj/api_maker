import CommandsPool from "./commands-pool.js";
const shared = {};
export default class ApiMakerServices {
    static current() {
        if (!shared.currentApiMakerService)
            shared.currentApiMakerService = new ApiMakerServices();
        return shared.currentApiMakerService;
    }
    sendRequest(serviceName, args) {
        return CommandsPool.addCommand({
            args: {
                service_args: args,
                service_name: serviceName
            },
            command: "services",
            collectionName: "calls",
            type: "service"
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZXMuanMiLCJzb3VyY2VSb290IjoiL3NyYy8iLCJzb3VyY2VzIjpbInNlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sWUFBWSxNQUFNLG9CQUFvQixDQUFBO0FBRTdDLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQTtBQUVqQixNQUFNLENBQUMsT0FBTyxPQUFPLGdCQUFnQjtJQUNuQyxNQUFNLENBQUMsT0FBTztRQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsc0JBQXNCO1lBQUUsTUFBTSxDQUFDLHNCQUFzQixHQUFHLElBQUksZ0JBQWdCLEVBQUUsQ0FBQTtRQUUxRixPQUFPLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQTtJQUN0QyxDQUFDO0lBRUQsV0FBVyxDQUFFLFdBQVcsRUFBRSxJQUFJO1FBQzVCLE9BQU8sWUFBWSxDQUFDLFVBQVUsQ0FBQztZQUM3QixJQUFJLEVBQUU7Z0JBQ0osWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFlBQVksRUFBRSxXQUFXO2FBQzFCO1lBQ0QsT0FBTyxFQUFFLFVBQVU7WUFDbkIsY0FBYyxFQUFFLE9BQU87WUFDdkIsSUFBSSxFQUFFLFNBQVM7U0FDaEIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENvbW1hbmRzUG9vbCBmcm9tIFwiLi9jb21tYW5kcy1wb29sLmpzXCJcblxuY29uc3Qgc2hhcmVkID0ge31cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBpTWFrZXJTZXJ2aWNlcyB7XG4gIHN0YXRpYyBjdXJyZW50ICgpIHtcbiAgICBpZiAoIXNoYXJlZC5jdXJyZW50QXBpTWFrZXJTZXJ2aWNlKSBzaGFyZWQuY3VycmVudEFwaU1ha2VyU2VydmljZSA9IG5ldyBBcGlNYWtlclNlcnZpY2VzKClcblxuICAgIHJldHVybiBzaGFyZWQuY3VycmVudEFwaU1ha2VyU2VydmljZVxuICB9XG5cbiAgc2VuZFJlcXVlc3QgKHNlcnZpY2VOYW1lLCBhcmdzKSB7XG4gICAgcmV0dXJuIENvbW1hbmRzUG9vbC5hZGRDb21tYW5kKHtcbiAgICAgIGFyZ3M6IHtcbiAgICAgICAgc2VydmljZV9hcmdzOiBhcmdzLFxuICAgICAgICBzZXJ2aWNlX25hbWU6IHNlcnZpY2VOYW1lXG4gICAgICB9LFxuICAgICAgY29tbWFuZDogXCJzZXJ2aWNlc1wiLFxuICAgICAgY29sbGVjdGlvbk5hbWU6IFwiY2FsbHNcIixcbiAgICAgIHR5cGU6IFwic2VydmljZVwiXG4gICAgfSlcbiAgfVxufVxuIl19