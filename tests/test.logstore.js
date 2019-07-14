const host = "host.com";
class StorageMoq {
    constructor(data = {}) {
        this.data = Object.assign({}, data);
    }

    set(item) {
        console.log("StorageMoq.set", item)
        this.data = Object.assign({}, this.data, item);
        const pr = Promise.resolve(this.data);
        return pr;
    }

    get(name) {
        const d = this.data[name] || {};
        console.log("StorageMoq.get", name, d);
        const pr = Promise.resolve(d);
        return pr;
    }
}

describe("LogStoreInMemoryImpl", function () {
    it('should construct object without errors', function () {
        const store = new LogStoreInMemoryImpl(host);
        store.host.should.equal(host);
        store.hostEvents.should.eql({
            [host]: []
        });
        store.records.should.eql([]);
        store.hasRecords.should.be.false;
    });

    it('should set/get property records', function () {
        const store = new LogStoreInMemoryImpl(host);
        const recs = [{
            r: 1
        }, {
            r: 2
        }];
        store.records.should.be.a('array').eql([]);
        store.records = recs;
        store.records.should.be.a('array').eql(recs);
        store.records[0].should.eql(recs[0]);
        store.hasRecords.should.be.true;
        console.dir(store.hostEvents)
    });

    it('should add records', function () {
        const store = new LogStoreInMemoryImpl(host);
        store.push({
            r: 1
        });
        store.hasRecords.should.be.true;
        store.records.length.should.equal(1);
        store.push({
            r: 2
        });
        store.records.length.should.equal(2);
    });

    it('should clear records', function () {
        const store = new LogStoreInMemoryImpl(host);
        store.push({
            r: 1
        });
        store.clear();
        store.hasRecords.should.be.false;
        store.hostEvents.should.eql({
            [host]: []
        });
    });
});


    const data1 = {
        events: {
            [host]: []
        }
    };

    const data2 = {
        events: {
            [host]: [{
                    event: 'start',
                    time: 1
                },
                {
                    event: 'stop',
                    time: 2
                },
            ]
        }
    };

    function checkStorageForEmptiness(store, storage){
        store.hostEvents.should.eql({
            [host]: []
        });
        store.records.should.eql([]);
        store.storage.should.eql(storage);
        store.hasRecords.should.be.false;
    }

describe("LogStoreSyncImpl", function () {
    it('should construct object without errors', function () {
        const storage = {};
        const store = new LogStoreSyncImpl(host, storage);
        store.host.should.equal(host);
        checkStorageForEmptiness(store, storage);
    });

    it("should clear correctly today's empty data", async () => {
        const fakeEmptyData1 = {...data1 };
        const browserStorage = new StorageMoq(fakeEmptyData1);
        const store = new LogStoreSyncImpl(host, browserStorage);
        const isOk = await store.clear();
        isOk.should.true;
    });

    it("should clear correctly today's data", async () => {
        const fakeEmptyData1 = {
            ...data2
        };
        const browserStorage = new StorageMoq(fakeEmptyData1);
        const store = new LogStoreSyncImpl(host, browserStorage);
        const isOk = await store.clear();
        isOk.should.true;
        checkStorageForEmptiness(store, browserStorage);
    });
});


describe("StorageMoq", function () {


    it('should get data async of empty', async () => {
        const browserStorage = new StorageMoq(data1);
        browserStorage.data.should.eql(data1);
        const items = await browserStorage.get("events");
        items.should.not.be.null;
        items[host].should.be.an('array').empty;
    });

    it('should get data async of not empty data', async () => {
        const browserStorage = new StorageMoq(data2);
        browserStorage.data.should.eql(data2);
        const items = await browserStorage.get("events");
        items.should.not.be.null;
        items[host].should.be.an('array').and.length(2);
    });

    it('should set data async', async () => {
        const browserStorage = new StorageMoq(data1);
        await browserStorage.set(data2);
        const items = await browserStorage.get("events");
        items.should.not.be.null;
        items.should.have.property(host)
        items[host].should.be.an('array').and.length(2);
    });
})