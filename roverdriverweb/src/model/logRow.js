export class LogRow {
    timestamp;
    data;

    constructor(timestamp, data) {
        this.timestamp = timestamp == null ? "" : timestamp;
        this.data = data == null ? "" : data;
    }
}