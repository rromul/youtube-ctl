class LogStoreInMemoryImpl {
    constructor(host) {
        this.host = host;
        this.hostEvents = {};
        this.hostEvents[host] = [];
    }

    push(record) {
        const list = this.hostEvents[this.host];
        list.push(record);
    }
    get records() {
        return this.hostEvents[this.host];
    }
}

class LogStoreSyncImpl extends LogStoreInMemoryImpl {
    constructor(host, storage) {
        super(host);
        this.storage = storage;
    }

    push(record) {
        const me = this,
            stor = this.storage;
        stor.get("events").then(item => {
            const events = item.events || {};
            const arrEvents = events[me.host] || [];
            arrEvents.push(record);
            events[me.host] = arrEvents;

            stor.set({
                events
            }).then(() => {
                //refresh
                me.hostEvents = events;
            });
        });
    }

    getEvents() {
        const me = this,
            stor = this.storage;
        stor.get("events").then(item => {
            me.hostEvents = item.events || {};
            return me.hostEvents;
        });
    }

    get records() {
        return this.hostEvents[this.host];
    }

    get hasRecords() {
        return this.records.length > 0;
    }

    clear(date) {
        const me = this,
            stor = this.storage,
            dt = date ? date.toLocaleDateString("en") : null;
        stor.get("events").then(item => {
            if (item.events) {
                const arrEvents = (item.events[me.host] || []).filter(r => dt && r.dt != dt);
                stor.set({
                    events: arrEvents
                }).then(() => {
                    //refresh
                    me.hostEvents = [];
                });
            }
        });
    }
}