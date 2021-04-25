import { Button, Table, TableBody, TableCell, TableRow, TableHeader, Text, Box } from "grommet";
import { Trash, Download } from 'grommet-icons'
import React from "react";
import { LogIndexService } from "./storage_service/logindex_service";
import { LogFileService } from "./storage_service/logfile_service";
import ls from 'local-storage'
import ObjectsToCsv from 'objects-to-csv'
import { fileSave } from 'browser-fs-access'

export class LogList extends React.Component {

    constructor() {
        super();
        this.service = new LogIndexService();
        this.state = {
            isEditing: false,
            editLogFileId: 0,
            logfile: [],
            toDelete: ""
        }
    }

    componentDidMount() {
        this.loadLogFilesFromDb();
    }

    async loadLogFilesFromDb() {
        try {
            const logfile = await this.service.getLogFiles()
            this.setState({ logfile: logfile })
        }
        catch (ex) {
            alert(ex.message);
            console.error(ex);
        }
    }

    async add() {
        var newfile = {
            tableName: this.refs.tableName.value,
            date: this.refs.date.value,
        }
        // add logfile into indexeddb
        try {
            const logfile = await this.service.addLogFile(newfile)
            var logfiles = this.state.logfile;
            logfiles.push(logfile[0]);
            this.setState({ logfile: logfiles });
        }
        catch (ex) {
            alert(ex.message);
            console.error(ex);
        }

    }

    async editUpdate(el) {
        const row = el.target.parentElement.parentElement;
        const logfileId = Number(row.dataset.id);
        if (this.state.isEditing) {
            const updateValue = {
                tableName: row.children[0].firstChild.value,
                date: row.children[1].firstChild.value,
            }
            // update logfile into indexeddb

            try {
                const rowsUpdated = await this.service.updateLogFileById(logfileId, updateValue);
                if (rowsUpdated > 0) {
                    const index = this.state.logfile.findIndex(value => value.id === logfileId);
                    this.state.logfile[index] = { id: logfileId, ...updateValue };
                    this.setState({ logfile: this.state.logfile, isEditing: false, editLogFileId: 0 });
                }

            }
            catch (ex) {
                alert(ex.message);
                console.error(ex);
            }
        }
        else {
            this.setState({ isEditing: true, editLogFileId: logfileId });
        }
    }

    async delete(logfileId, logfileName) {
        // delete logfile from indexeddb
        if (this.state.toDelete === logfileId) {
            // This is the second time the delete button was pressed. Delete log.
            try {
                const rowsDeleted = await this.service.removeLogFile(logfileName);
                if (rowsDeleted > 0) {
                    // If deletion is successful, remove the file from the local state
                    const index = this.state.logfile.findIndex(value => value.id === logfileId);
                    this.state.logfile.splice(index, 1);
                    this.setState({ ...this.state, logfile: this.state.logfile, toDelete: "" });
                }
            }
            catch (ex) {
                alert(ex.message);
                console.error(ex);
            }
        } else {
            // This is the first time the delete button was pressed. Confirm deletion.
            this.setState({ ...this.state, toDelete: logfileId });
        }
    }

    generateMotorLog = (jrkData, prefix) => {
        var logRow = {};
        if (jrkData.current) {
            logRow[prefix + "_current"] = jrkData.current;
        } else {
            logRow[prefix + "_current"] = 0;
        }

        if (jrkData.dutyCycleTarget) {
            logRow[prefix + "_dutyCycleTarget"] = jrkData.dutyCycleTarget;
        } else {
            logRow[prefix + "_dutyCycleTarget"] = 0;
        }
        if (jrkData.dutyCycle) {
            logRow[prefix + "_dutyCycle"] = jrkData.dutyCycle;
        } else {
            logRow[prefix + "_dutyCycle"] = 0;
        }

        if (jrkData.feedback) {
            logRow[prefix + "_feedback"] = jrkData.feedback;
        } else {
            logRow[prefix + "_feedback"] = 0;
        }
        return logRow;
    }

    async export(logfileName, date) {
        try {
            const logFile = new LogFileService(logfileName);
            var exportFileName = "roverdriver_" + date.toLocaleString() + ".csv";
            exportFileName = exportFileName.replace(/[, :/]+/g, "_").trim();
            logFile.getLogContent()
                .then(contents => {
                    // Post process items into a good-looking csv
                    var flattenedContents = [];
                    for (let i = 0; i < contents.length; i++) {
                        var lineItem = contents[i].data;
                        lineItem.timestamp = contents[i].timestamp.toISOString();
                        // Remember that deleting lineItem.accelerometer will also delete it in contents[i]
                        if (contents[i].data.accelerometer) {
                            lineItem.accelerometer_x = contents[i].data.accelerometer.X;
                            lineItem.accelerometer_y = contents[i].data.accelerometer.Y;
                            lineItem.accelerometer_z = contents[i].data.accelerometer.Z;
                            delete lineItem.accelerometer;
                        }
                        if (contents[i].data.gyroscope) {
                            lineItem.gyroscope_x = contents[i].data.gyroscope.X;
                            lineItem.gyroscope_y = contents[i].data.gyroscope.Y;
                            lineItem.gyroscope_z = contents[i].data.gyroscope.Z;
                            delete lineItem.gyroscope;
                        }
                        if (contents[i].data.magnetometer) {
                            lineItem.magnetometer_x = contents[i].data.magnetometer.X;
                            lineItem.magnetometer_y = contents[i].data.magnetometer.Y;
                            lineItem.magnetometer_z = contents[i].data.magnetometer.Z;
                            delete lineItem.magnetometer;
                        }
                        if (contents[i].data.motorControllerFR) {
                            lineItem = { ...lineItem, ...this.generateMotorLog(contents[i].data.motorControllerFR, "FR") };
                            delete lineItem.motorControllerFR;
                        }
                        if (contents[i].data.motorControllerFL) {
                            lineItem = { ...lineItem, ...this.generateMotorLog(contents[i].data.motorControllerFL, "FL") };
                            delete lineItem.motorControllerFL;
                        }
                        if (contents[i].data.motorControllerRR) {
                            lineItem = { ...lineItem, ...this.generateMotorLog(contents[i].data.motorControllerRR, "RR") };
                            delete lineItem.motorControllerRR;
                        }
                        if (contents[i].data.motorControllerRL) {
                            lineItem = { ...lineItem, ...this.generateMotorLog(contents[i].data.motorControllerRL, "RL") };
                            delete lineItem.motorControllerRL;
                        }
                        flattenedContents.push(lineItem);
                    }
                    const csv = new ObjectsToCsv(flattenedContents);
                    return csv.toString();
                })
                .then(contentString => this.downloadFile(exportFileName, contentString)) // export as file
        }
        catch (ex) {
            // TODO: create a notification on the UI
            console.error(ex);
        }
    }

    /*
        Use browser-fs-access to save or download the file
    */
    async downloadFile(filename, text) {
        const csvFile = new File([text], filename, {
            type: "text/csv"
        });
        await fileSave(csvFile, {
            fileName: filename,
            extensions: ['.csv']
        });
    }

    render() {
        // Track if logging is has been completed and, if so, refresh the log list
        if (this.props.isLogging && !this.logging) this.logging = true;
        if (!this.props.isLogging && this.logging === true) {
            this.logging = false;
            this.loadLogFilesFromDb();
        }
        if (this.state.logfile.length && this.state.logfile.length > 0) {
            const dataRows = this.state.logfile.map(logfile => {
                return (
                    <TableRow key={logfile.id} data-id={logfile.id}>
                        {(ls.get('logTableName') || false) && <TableCell>{logfile.tableName}</TableCell>}
                        <TableCell>{logfile.date.toLocaleString()}</TableCell>
                        <TableCell>
                            <TableButton label="" itemID={logfile.id} supplementary={logfile.tableName} onTap={this.delete.bind(this)} icon={<Trash color={this.state.toDelete === logfile.id && "status-critical"} />} />
                        </TableCell>
                        <TableCell>
                            <TableButton label="" itemID={logfile.tableName} supplementary={logfile.date} onTap={this.export.bind(this)} icon={<Download />} />
                        </TableCell>
                    </TableRow>
                )
            });
            return (
                <Box>
                    {this.state.toDelete !== "" && <Text margin={{ "top": "small", "bottom": "small" }}>To delete the log, tap the trash icon again</Text>}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {(ls.get('logTableName') || false) && <TableCell scope="col" border="bottom">Name</TableCell>}
                                <TableCell scope="col" border="bottom">Date</TableCell>
                                <TableCell scope="col" border="bottom">Delete</TableCell>
                                <TableCell scope="col" border="bottom">Export</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dataRows}
                        </TableBody>
                    </Table>
                </Box>
            )
        } else {
            return (
                <Text margin={{ "top": "small", "bottom": "small" }} textAlign="center">
                    No Logs
                </Text>
            );
        }

    }
}

class TableButton extends React.Component {
    handleClick = () => {
        if (this.props.supplementary) {
            this.props.onTap(this.props.itemID, this.props.supplementary);
        } else {
            this.props.onTap(this.props.itemID);
        }
    }

    render() {
        return (
            <Button label={this.props.label} onClick={this.handleClick} icon={this.props.icon ? this.props.icon : ""} />
        );
    }
}
