class MediaEventLogger {

    constructor(logStoreImpl, channel) {
        this.store = logStoreImpl;
        this.channel = channel;

    }

    log(eventName) {
        const dt = new Date().toLocaleDateString('en');

        const record = {
            event: eventName,
            dt: dt,
            time: Date.now(),
            host: this.store.host,
            //search: location.search
        };

        if (this.channel)
            record.channel = {
                owner: this.channel
            };

        this.store.push(record);

        //console.log("record", record);
        //console.log("this.store.records", this.store.records);
    }

    logPlay() {
        this.log('start');
    }

    logStop() {
        this.log('stop');
    }

    getByHost() {
        return this.store.records;
    }
}