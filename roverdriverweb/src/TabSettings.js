import React from 'react';
import { Box, CheckBox, Text } from "grommet";
import { SettingsGroup, StyledCard } from "./CommonUI";
import ls from 'local-storage';

class TabSettings extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            lightMode: false,
            rssi: false,
            vibrate: false,
            logTableName: false
        };
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.setState({
            lightMode: ls.get('lightMode') || false,
            rssi: ls.get('rssi') || false,
            vibrate: ls.get('vibrate') !== null ? ls.get('vibrate') : true,
            logTableName: ls.get('logTableName') || false
        });
    }

    handleChange(event) {
        switch (event.target.id) {
            case "checkbox-LightMode":
                this.setState({ ...this.state, lightMode: event.target.checked });
                ls.set('lightMode', event.target.checked);
                break;
            case "checkbox-RSSI":
                this.setState({ ...this.state, rssi: event.target.checked });
                ls.set('rssi', event.target.checked);
                break;
            case "checkbox-Vibrate":
                this.setState({ ...this.state, vibrate: event.target.checked });
                ls.set('vibrate', event.target.checked);
                break;
            case "checkbox-LogTableName":
                this.setState({ ...this.state, logTableName: event.target.checked });
                ls.set('logTableName', event.target.checked);
                break;
            default:
                console.log(event.target.id + " not handled");
        }
        this.props.onPreferenceUpdate();
    }

    render() {
        return <Box justify="center" pad={{ "top": "none", "bottom": "small", "left": "small", "right": "small" }} className="tabContents" animation={{ "type": "fadeIn", "size": "small" }} direction="row" align="stretch" fill hoverIndicator={false}>
            <StyledCard title="General">
                <SettingsGroup name="Appearance">
                    <Box pad={{ 'bottom': 'small' }} width="100%">
                        <CheckBox
                            id="checkbox-LightMode"
                            name="toggle"
                            label="Light mode"
                            onChange={this.handleChange}
                            checked={this.state.lightMode}
                            toggle
                            reverse
                        />
                    </Box>
                    <Box pad={{ 'bottom': 'small' }} width="100%">
                        <CheckBox
                            id="checkbox-RSSI"
                            name="toggle"
                            label="Show signal strength in RSSI"
                            onChange={this.handleChange}
                            checked={this.state.rssi}
                            toggle
                            reverse
                        />
                    </Box>
                </SettingsGroup>
                <SettingsGroup name="Remote Control">
                    <Box pad={{ 'bottom': 'small' }} width="100%">
                        <CheckBox
                            id="checkbox-Vibrate"
                            name="toggle"
                            label="D-Pad feedback vibration"
                            onChange={this.handleChange}
                            checked={this.state.vibrate}
                            toggle
                            reverse
                        />
                    </Box>
                </SettingsGroup>
                <SettingsGroup name="Debug">
                    <Box pad={{ 'bottom': 'small' }} width="100%">
                        <CheckBox
                            id="checkbox-LogTableName"
                            name="toggle"
                            label="Show log table names"
                            onChange={this.handleChange}
                            checked={this.state.logTableName}
                            toggle
                            reverse
                        />
                    </Box>
                </SettingsGroup>
            </StyledCard>
            <StyledCard title="App Info" centered>
                <Text>
                    Build time: BUILD_DATE
                </Text>
                <Text>
                    Build hash: BUILD_HASH
                </Text>
            </StyledCard>
        </Box>;
    }
}

export default TabSettings;