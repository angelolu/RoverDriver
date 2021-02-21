import {
    BaseService
} from "./base_service";
import {
    getDatabase, updateJsStoreSchema
} from "./idb_service";

/* 
    This class contains the functions for the table that records
    all of the existing log files. 
*/
export class LogIndexService extends BaseService {

    constructor() {
        super();
        this.tableName = "LogFiles";
        this.dbSchema = getDatabase();
    }

    getLogFiles() {
        return this.connection.select({
            from: this.tableName,
            order: {
                by: "date",
                type: "desc" // newest item at the top!
            }
        })
    }

    addLogFile(LogFile) {
        return updateJsStoreSchema(LogFile.tableName)
            .then(() => this.connection.insert({
                into: this.tableName,
                values: [LogFile],
                return: false // since LogField is autoincrement field and we need id, 
                // so we are making return true which will return the whole data inserted.
            }));
    }

    getLogFileById(id) {
        return this.connection.select({
            from: this.tableName,
            where: {
                id: id
            }
        })
    }

    /* 
        First clear the table that the logfile index table refers
        to, then clear the entry in the logfile index table
    */
    removeLogFile(name) {
        return this.connection.clear(name)
            .then(() => this.connection.remove({
                from: this.tableName,
                where: {
                    tableName: name
                }
            }));
    }

    updateLogFileById(id, updateData) {
        return this.connection.update({
            in: this.tableName,
            set: updateData,
            where: {
                id: id
            }
        })
    }
}