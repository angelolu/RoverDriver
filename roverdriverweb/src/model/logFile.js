export class LogFile {
    id;
    tableName;
    date;

    constructor(id, tableName, date) {
        this.id = id == null ? 0 : id;
        this.tableName = tableName == null ? "" : tableName;
        this.date = date == null ? "" : date;
    }
}