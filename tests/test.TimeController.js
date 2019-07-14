const events = [{
        event: 'start',
        dt: '6/30/2019',
        time: '1561913710000'
    },
    {
        event: 'start',
        dt: '6/30/2019',
        time: '1561913720000'
    },
    {
        event: 'start',
        dt: '6/30/2019',
        time: '1561913750000'
    },
];

describe('TimeController', function () {

    describe('#makeIntervals()', function () {
        it('should return list of records {s: #start-time, e: #end-time}', function () {
            const lastTime = Date.now();
            const intervals = TimeController.makeIntervals(events, lastTime);
            intervals[0].should.eql({
                s: 1561913710000,
                e: 1561913720000
            });
            intervals[1].should.eql({
                s: 1561913720000,
                e: 1561913750000
            });
            intervals[2].should.eql({
                s: 1561913750000,
                e: lastTime
            });
        });

        
    });

    describe('#summIntervals()', function () {
        it('should return summ of all closed intervals', function () {
            const lastTime = Date.now();
            const intervals = [{
                    //10 sec
                    s: "1561913710000",
                    e: "1561913720000"
                },
                {
                    //30 sec
                    s: "1561913720000",
                    e: "1561913750000"
                },
                {
                    //250 sec
                    s: "1561913750000",
                    e: "1561914000000"
                }
            ];

            const summ = TimeController.summIntervals(intervals);
            summ.should.equal(10 + 30 + 250);
        });

    });

    // describe("", function (){
    //     it('should', function (){

    //     })
    // });
});