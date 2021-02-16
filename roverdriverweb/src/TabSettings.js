import React from 'react';
import { Box, CheckBox, Text } from "grommet";
import { StyledCard } from "./CommonUI";
import ls from 'local-storage';

class TabSettings extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            lightMode: false,
        };
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.setState({
            lightMode: ls.get('lightMode') || false
        });
    }

    handleChange(event) {
        switch (event.target.id) {
            case "check-box-toggle":
                this.setState({ ...this.state, lightMode: event.target.checked });
                ls.set('lightMode', event.target.checked);
                break;

            default:
                console.log(event.target.id + " not handled");
        }
        this.props.onPreferenceUpdate();
    }

    render() {
        return <Box justify="center" pad={{ "top": "none", "bottom": "small", "left": "small", "right": "small" }} className="tabContents" animation={{ "type": "fadeIn", "size": "small" }} direction="row" align="stretch" fill hoverIndicator={false}>
            <StyledCard title="General">
                <Box pad={{ vertical: 'small' }}>
                    <CheckBox
                        id="check-box-toggle"
                        name="toggle"
                        label="Light Mode"
                        onChange={this.handleChange}
                        checked={this.state.lightMode}
                        toggle
                    />
                </Box>
            </StyledCard>
            <StyledCard title="App Info" centered>
                <Text>
                    Build time: BUILD_DATE
                </Text>
            </StyledCard>
        </Box>;
    }
}

export default TabSettings;