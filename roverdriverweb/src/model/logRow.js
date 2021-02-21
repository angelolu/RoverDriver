export class LogRow {
    timestamp;
    data;

    constructor(tableName, date) {
        this.timestamp = timestamp == null ? "" : timestamp;
        this.data = data == null ? "" : data;
    }
}