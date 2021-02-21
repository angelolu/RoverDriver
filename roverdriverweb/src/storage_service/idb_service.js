import * as JsStore from 'jsstore';
import { DATA_TYPE } from 'jsstore';

export const idbCon = new JsStore.Connection(new Worker(process.env.PUBLIC_URL + '/jsstore.worker.min.js'));
export const dbname = 'RoverLogs';

export const getDatabase = () => {
    const tblLogFiles = {
        name: 'LogFiles',
        columns: {
            id: {
                primaryKey: true,
                autoIncrement: true
            },
            tableName: {
                notNull: true,
                dataType: DATA_TYPE.String
            },
            date: {
                dataType: DATA_TYPE.DateTime
            }
        }
    };
    const dataBase = {
        name: dbname,
        tables: [tblLogFiles]
    };
    return dataBase;
};

export const getTableSchema = (tableName) => {
    return {
        name: tableName,
        columns: {
            timestamp: {
                primaryKey: true,
                notNull: true,
                dataType: DATA_TYPE.DateTime
            },
            data: {
                dataType: DATA_TYPE.Object
            }
        }
    }
}

/*
    This function is called when there are any changes to the schema,
    such as when a new log file is created or when the page has been
    loaded for the first time (on load we use the default schema that
        only contains one table, getDatabase)
*/
export const updateJsStoreSchema = (newFile = false) => {
    var dbSchema = getDatabase(); // use this as a template
    var dbVersion;
    return idbCon.getDbVersion(dbname)
        .then(version => {
            dbVersion = version;
            return idbCon.select({
                from: "LogFiles"
            })
        })
        .then(tableContent => {
            var newTable;
            // Create an entry for each existing table (don't clear data)
            if (tableContent.length > 0) {
                for (let i = 0; i < tableContent.length; i++) {
                    newTable = getTableSchema(tableContent[i].tableName);
                    dbSchema.tables.push(newTable);
                }
            }

            // If creating a new table entry (clear data by incrementing version)
            if (newFile !== false) {
                newTable = getTableSchema(newFile);
                newTable.version = dbVersion + 1;
                dbSchema.tables.push(newTable);
            }

            // if there is any data, increment database version and reinitializa
            if (tableContent.length > 0 || newFile !== false) {
                dbSchema.version = dbVersion + 1;
                return idbCon.initDb(dbSchema);
            } else {
                return false;
            }
        });
}

export const initJsStore = () => {
    try {
        const dataBase = getDatabase();
        idbCon.initDb(dataBase)
            .then(() => updateJsStoreSchema())
    }
    catch (ex) {
        console.error(ex);
    }
};
