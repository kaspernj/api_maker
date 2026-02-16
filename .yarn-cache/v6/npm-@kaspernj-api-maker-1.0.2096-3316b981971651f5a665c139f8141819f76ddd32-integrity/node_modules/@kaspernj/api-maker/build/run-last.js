export default class RunLast {
    constructor(callback) {
        if (!callback)
            throw new Error("Empty callback given");
        this.callback = callback;
    }
    // Try to batch calls to backend while waiting for the event-queue-call to clear any other jobs before the request and reset on every flush call
    // If only waiting a single time, then other event-queue-jobs might be before us and queue other jobs that might queue calls to the backend
    queue() {
        this.flushTriggerCount = 0;
        this.clearTimeout();
        this.flushTrigger();
    }
    flushTrigger = () => {
        if (this.flushTriggerCount >= 10) {
            this.run();
        }
        else {
            this.flushTriggerCount++;
            this.flushTriggerQueue();
        }
    };
    flushTriggerQueue() {
        this.flushTimeout = setTimeout(this.flushTrigger, 0);
    }
    clearTimeout() {
        if (this.flushTimeout) {
            clearTimeout(this.flushTimeout);
        }
    }
    run() {
        this.clearTimeout();
        this.callback();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLWxhc3QuanMiLCJzb3VyY2VSb290IjoiL3NyYy8iLCJzb3VyY2VzIjpbInJ1bi1sYXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sQ0FBQyxPQUFPLE9BQU8sT0FBTztJQUMxQixZQUFZLFFBQVE7UUFDbEIsSUFBSSxDQUFDLFFBQVE7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUE7UUFFdEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUE7SUFDMUIsQ0FBQztJQUVELGdKQUFnSjtJQUNoSiwySUFBMkk7SUFDM0ksS0FBSztRQUNILElBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUE7UUFDMUIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO1FBQ25CLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtJQUNyQixDQUFDO0lBRUQsWUFBWSxHQUFHLEdBQUcsRUFBRTtRQUNsQixJQUFJLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxFQUFFLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7UUFDWixDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO1lBQ3hCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO1FBQzFCLENBQUM7SUFDSCxDQUFDLENBQUE7SUFFRCxpQkFBaUI7UUFDZixJQUFJLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ3RELENBQUM7SUFFRCxZQUFZO1FBQ1YsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDdEIsWUFBWSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUNqQyxDQUFDO0lBQ0gsQ0FBQztJQUVELEdBQUc7UUFDRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7UUFDbkIsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFBO0lBQ2pCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGNsYXNzIFJ1bkxhc3Qge1xuICBjb25zdHJ1Y3RvcihjYWxsYmFjaykge1xuICAgIGlmICghY2FsbGJhY2spIHRocm93IG5ldyBFcnJvcihcIkVtcHR5IGNhbGxiYWNrIGdpdmVuXCIpXG5cbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2tcbiAgfVxuXG4gIC8vIFRyeSB0byBiYXRjaCBjYWxscyB0byBiYWNrZW5kIHdoaWxlIHdhaXRpbmcgZm9yIHRoZSBldmVudC1xdWV1ZS1jYWxsIHRvIGNsZWFyIGFueSBvdGhlciBqb2JzIGJlZm9yZSB0aGUgcmVxdWVzdCBhbmQgcmVzZXQgb24gZXZlcnkgZmx1c2ggY2FsbFxuICAvLyBJZiBvbmx5IHdhaXRpbmcgYSBzaW5nbGUgdGltZSwgdGhlbiBvdGhlciBldmVudC1xdWV1ZS1qb2JzIG1pZ2h0IGJlIGJlZm9yZSB1cyBhbmQgcXVldWUgb3RoZXIgam9icyB0aGF0IG1pZ2h0IHF1ZXVlIGNhbGxzIHRvIHRoZSBiYWNrZW5kXG4gIHF1ZXVlKCkge1xuICAgIHRoaXMuZmx1c2hUcmlnZ2VyQ291bnQgPSAwXG4gICAgdGhpcy5jbGVhclRpbWVvdXQoKVxuICAgIHRoaXMuZmx1c2hUcmlnZ2VyKClcbiAgfVxuXG4gIGZsdXNoVHJpZ2dlciA9ICgpID0+IHtcbiAgICBpZiAodGhpcy5mbHVzaFRyaWdnZXJDb3VudCA+PSAxMCkge1xuICAgICAgdGhpcy5ydW4oKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZsdXNoVHJpZ2dlckNvdW50KytcbiAgICAgIHRoaXMuZmx1c2hUcmlnZ2VyUXVldWUoKVxuICAgIH1cbiAgfVxuXG4gIGZsdXNoVHJpZ2dlclF1ZXVlKCkge1xuICAgIHRoaXMuZmx1c2hUaW1lb3V0ID0gc2V0VGltZW91dCh0aGlzLmZsdXNoVHJpZ2dlciwgMClcbiAgfVxuXG4gIGNsZWFyVGltZW91dCgpIHtcbiAgICBpZiAodGhpcy5mbHVzaFRpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmZsdXNoVGltZW91dClcbiAgICB9XG4gIH1cblxuICBydW4oKSB7XG4gICAgdGhpcy5jbGVhclRpbWVvdXQoKVxuICAgIHRoaXMuY2FsbGJhY2soKVxuICB9XG59XG4iXX0=