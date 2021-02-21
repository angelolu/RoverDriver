import React from 'react';
import { Box, CheckBox, Text, Button, Collapsible } from "grommet";
import { SettingsGroup, StyledCard } from "./CommonUI";
import { Play, Stop } from 'grommet-icons'
import { LogList } from './LoggingUI';
import { LogIndexService } from "./storage_service/logindex_service";
import { v4 as uuidv4 } from 'uuid';

class TabLog extends React.Component {

    constructor(props) {
        super(props);
        this.service = new LogIndexService();
        this.state = {
            stats: false,
            accel: true,
            gyro: false,
            magnet: false,
            motor: true
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleStartLogging = this.handleStartLogging.bind(this);
    }

    componentDidMount() {

    }

    handleChange(event) {
        switch (event.target.id) {
            case "checkbox-stats":
                this.setState({ ...this.state, stats: event.target.checked });
                break;
            case "checkbox-Accel":
                this.setState({ ...this.state, accel: event.target.checked });
                break;
            case "checkbox-Gyro":
                this.setState({ ...this.state, gyro: event.target.checked });
                break;
            case "checkbox-Magnet":
                this.setState({ ...this.state, magnet: event.target.checked });
                break;
            case "checkbox-Motor":
                this.setState({ ...this.state, motor: event.target.checked });
                break;

            default:
                console.log(event.target.id + " not handled");
        }
    }

    async handleStartLogging(event) {
        event.preventDefault();
        var newFile = {
            tableName: uuidv4(),
            date: new Date(),
        }

        try {
            this.service.addLogFile(newFile)
                .then(() => this.props.startLogging(newFile.tableName, 1000 / 2, this.state));
        }
        catch (ex) {
            alert(ex.message);
            console.error(ex);
        }
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
                        <Text>2 Hz</Text>
                    </SettingsGroup>
                </Collapsible>
                <Text>
                    Logging will pause if the screen is off or if the app is hidden
                </Text>
                {!this.props.isLogging && <Button margin={{ "top": "small", "bottom": "small", "left": "none", "right": "none" }} label="Start Logging" color="brand" onClick={this.handleStartLogging} disabled={!this.props.isConnected} icon={<Play />} primary />}
                {this.props.isLogging && <Button margin={{ "top": "small", "bottom": "small", "left": "none", "right": "none" }} label="Stop Logging" color="status-critical" onClick={this.props.stopLogging} icon={<Stop />} primary />}
            </StyledCard>
            <StyledCard title="Captured Logs" wide>
                <LogList isLogging={this.props.isLogging} />
            </StyledCard>
        </Box>;
    }
}

export default TabLog;