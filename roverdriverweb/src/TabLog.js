import React from 'react';
import { Box, CheckBox, Text, Button, Collapsible, Select } from "grommet";
import { SettingsGroup, StyledCard } from "./CommonUI";
import { Play, Stop } from 'grommet-icons'
import { LogList } from './LoggingUI';
import { LogIndexService } from "./storage_service/logindex_service";
import { v4 as uuidv4 } from 'uuid';
import ls from 'local-storage'

class TabLog extends React.Component {

    constructor(props) {
        super(props);
        this.service = new LogIndexService();
        this.state = {
            stats: false,
            accel: true,
            gyro: false,
            magnet: false,
            motor: true,
            frequency: "5 Hz"
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSelection = this.handleSelection.bind(this);
        this.handleStartLogging = this.handleStartLogging.bind(this);
        this.handleStopLogging = this.handleStopLogging.bind(this);
    }

    componentDidMount() {
        this.setState({
            stats: ls.get('log-stats') || false,
            accel: ls.get('log-accel') || false,
            gyro: ls.get('log-gyro') || false,
            magnet: ls.get('log-magnet') || false,
            motor: ls.get('log-motor') || false,
            frequency: ls.get('log-frequency') !== null ? ls.get('log-frequency') : "5 Hz"
        });
    }

    handleChange(event) {
        switch (event.target.id) {
            case "checkbox-stats":
                this.setState({ ...this.state, stats: event.target.checked });
                ls.set('log-stats', event.target.checked);
                break;
            case "checkbox-Accel":
                this.setState({ ...this.state, accel: event.target.checked });
                ls.set('log-accel', event.target.checked);
                break;
            case "checkbox-Gyro":
                this.setState({ ...this.state, gyro: event.target.checked });
                ls.set('log-gyro', event.target.checked);
                break;
            case "checkbox-Magnet":
                this.setState({ ...this.state, magnet: event.target.checked });
                ls.set('log-magnet', event.target.checked);
                break;
            case "checkbox-Motor":
                this.setState({ ...this.state, motor: event.target.checked });
                ls.set('log-motor', event.target.checked);
                break;

            default:
                console.log(event.target.id + " not handled");
        }
    }

    handleSelection(event) {
        this.setState({ ...this.state, frequency: event.value });
        ls.set('log-frequency', event.value);
    }

    async handleStartLogging(event) {
        event.preventDefault();
        var newFile = {
            tableName: uuidv4(),
            date: new Date(),
        }

        // Determine logging frequency selection
        var interval;
        switch (this.state.frequency) {
            case "10 Hz":
                interval = 100;
                break;
            case "5 Hz":
                interval = 200;
                break;
            case "4 Hz":
                interval = 250;
                break;
            case "2 Hz":
                interval = 500;
                break;
            case "1 Hz":
                interval = 1000;
                break;
            case "0.5 Hz":
                interval = 2000;
                break;
            default:
                interval = 500;
                console.log("Unknown logging interval, defaulting to 500 ms");
        }
        try {
            this.service.addLogFile(newFile)
                .then(() => this.props.startLogging(newFile.tableName, interval, this.state));
        }
        catch (ex) {
            alert(ex.message);
            console.error(ex);
        }
    }

    handleStopLogging(event) {
        event.preventDefault();
        this.props.stopLogging();
    }

    render() {
        return <Box justify="center" pad={{ "top": "none", "bottom": "small", "left": "small", "right": "small" }} className="tabContents" animation={{ "type": "fadeIn", "size": "small" }} direction="row" align="stretch" fill hoverIndicator={false}>
            <StyledCard title={this.props.isLogging ? "Logging..." : "Start Logging"}>
                <Collapsible direction="vertical" open={!this.props.isLogging}>
                    <SettingsGroup name="System">
                        <Box pad={{ 'bottom': 'small' }} width="100%">
                            <CheckBox
                                id="checkbox-stats"
                                name="toggle"
                                label="System status"
                                onChange={this.handleChange}
                                checked={this.state.stats}
                                toggle
                                reverse
                            />
                        </Box>
                    </SettingsGroup>
                    <SettingsGroup name="IMU">
                        <Box pad={{ 'bottom': 'small' }} width="100%">
                            <CheckBox
                                id="checkbox-Accel"
                                name="toggle"
                                label="Accelerometer"
                                onChange={this.handleChange}
                                checked={this.state.accel}
                                toggle
                                reverse
                            />
                        </Box>
                        <Box pad={{ 'bottom': 'small' }} width="100%">
                            <CheckBox
                                id="checkbox-Gyro"
                                name="toggle"
                                label="Gyroscope"
                                onChange={this.handleChange}
                                checked={this.state.gyro}
                                toggle
                                reverse
                            />
                        </Box>
                        <Box pad={{ 'bottom': 'small' }} width="100%">
                            <CheckBox
                                id="checkbox-Magnet"
                                name="toggle"
                                label="Magnetometer"
                                onChange={this.handleChange}
                                checked={this.state.magnet}
                                toggle
                                reverse
                            />
                        </Box>
                    </SettingsGroup>
                    <SettingsGroup name="Motor">
                        <Box pad={{ 'bottom': 'small' }} width="100%">
                            <CheckBox
                                id="checkbox-Motor"
                                name="toggle"
                                label="Motor status"
                                onChange={this.handleChange}
                                checked={this.state.motor}
                                toggle
                                reverse
                            />
                        </Box>
                    </SettingsGroup>
                    <SettingsGroup name="Logging Frequency">
                        <Select
                            alignSelf="center"
                            options={['10 Hz', '5 Hz', '4 Hz', '2 Hz', '1 Hz', '0.5 Hz']}
                            value={this.state.frequency}
                            onChange={this.handleSelection}
                        />
                    </SettingsGroup>
                </Collapsible>
                <Text>
                    Logging will pause if the screen is off or if the app is hidden
                </Text>
                {!this.props.isLogging && <Button margin={{ "top": "small", "bottom": "small", "left": "none", "right": "none" }} label="Start Logging" color="brand" onClick={this.handleStartLogging} disabled={!this.props.isConnected} icon={<Play />} primary />}
                {this.props.isLogging && <Button margin={{ "top": "small", "bottom": "small", "left": "none", "right": "none" }} label="Stop Logging" color="status-critical" onClick={this.handleStopLogging} icon={<Stop />} primary />}
            </StyledCard>
            <StyledCard title="Captured Logs" wide>
                <LogList isLogging={this.props.isLogging} />
            </StyledCard>
        </Box>;
    }
}

export default TabLog;