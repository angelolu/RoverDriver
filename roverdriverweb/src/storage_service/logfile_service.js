import {
    BaseService
} from "./base_service";

/*
    This class contains the functions for logfile tables
    themselves
*/
export class LogFileService extends BaseService {

    constructor(tableName) {
        super();
        this.tableName = tableName;
    }

    getLogContent() {
        return this.connection.select({
            from: this.tableName,
        })
    }

    addLogRow(RowData) {
        return this.connection.insert({
            into: this.tableName,
            values: [RowData],
            return: true // return all data inserted
        })
    }
}