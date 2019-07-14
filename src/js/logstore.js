class LogStoreInMemoryImpl {
    constructor(host) {
        this.host = host;
        this.hostEvents = {};
        this.records = [];
    }

    push(record) {
        const list = this.records;
        list.push(record);
    }
    get records() {
        return this.hostEvents[this.host];
    }

    set records(value) {
        return this.hostEvents[this.host] = value;
    }

    get hasRecords() {
        return this.records.length > 0;
    }

    clear() {
        this.records = [];
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
        return stor.get("events").then(item => {
            me.hostEvents = item.events || {};
            return me.hostEvents;
        });
    }

    clear(date) {
        const me = this,
            stor = this.storage,
            dt = date ? date.toLocaleDateString("en") : null;
        const gettingEvents = stor.
            get("events").
            then(items => {
                //console.log("LogStoreSyncImpl");
                return items && items.events ? items.events : null;
            });
        
        return gettingEvents.then(events => {
            let retProm = Promise.resolve(true);
            console.log("events", events);
            if (events) {
                const arrEvents = [...(events[me.host] || []).filter(r => dt && r.dt != dt)];
                retProm = retProm.stor.set({
                    events: arrEvents
                }).then(() => {
                    console.log("me.records = []");
                    me.records = [];
                    return true;
                });
            }
            return retProm;
        });
    }
}