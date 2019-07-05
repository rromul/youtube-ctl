class TimeController {
    constructor(host, logger) {
        this.host;
        this.mediaLogger = logger;
    }

    calculateSeconds(date = null) {
        const hostRecords = this.mediaLogger.getByHost();
        if (!hostRecords) return 0;
        const dtToday = date === null ? new Date().toLocaleDateString('en') : date;
        const todayEvents = hostRecords.filter(rec => rec.dt == dtToday);
        const intervals = TimeController.makeIntervals(todayEvents, Date.now());
        let seconds = TimeController.summIntervals(intervals);
        return seconds;
    }

    static summIntervals(intervals) {
        let summ = intervals.reduce(
            (acc, val) => acc + parseInt((val.e === undefined ? Date.now() : val.e)) - parseInt(val.s),
            0) / 1000;
        summ = Math.round(summ);
        return summ;
    }

    static makeIntervals(eventRecords, closeLastEventTime = null) {
        const intervals = [];
        for (let r of eventRecords) {
            if (r.event == "stop") {
                if (intervals.length == 0) {
                    intervals.push({
                        s: Date.parse(r.dt),
                        e: r.time
                    });
                } else {
                    intervals[intervals.length - 1].e = r.time;
                }
            } else if (r.event == 'start') {
                if ((intervals.length - 1) >= 0 && intervals[intervals.length - 1].e === undefined) {
                    intervals[intervals.length - 1].e = r.time;
                }
                intervals.push({
                    s: r.time
                });
            }
        }
        if (closeLastEventTime && intervals.length > 0 && intervals[intervals.length - 1].e === undefined) {
            intervals[intervals.length - 1].e = closeLastEventTime;
        }
        console.log("intervals", intervals);
        return intervals;
    }
}