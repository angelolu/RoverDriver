import React from 'react';
import { Box, Diagram, Stack, Button, RangeInput, Image, Distribution, Text } from "grommet";
import { SettingsBox, StyledCard } from "./CommonUI";
import { Trigger, Halt, Power, Add, Subtract } from 'grommet-icons'
import ls from 'local-storage'

import wasdDark from './wasd-dark.png';
import arrowDark from './arrow-dark.png';
import wasdLight from './wasd-light.png';
import arrowLight from './arrow-light.png';

class TabDrive extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            lightMode: false
        };
        this.handleDriveStart = this.handleDriveStart.bind(this);
        this.handleDriveStop = this.handleDriveStop.bind(this);
        this.handleSpeedChange = this.handleSpeedChange.bind(this);
    }

    componentDidMount() {

    }

    handleDriveStart() {
        if (this.props.isConnected === true) {
            this.props.rover.queueSubject(0xC1);
        }
    }

    handleDriveStop() {
        if (this.props.isConnected === true) {
            this.props.rover.queueSubject(0xC0);
        }
    }

    handleSpeedChange(speed) {
        if (this.props.isConnected === true) {
            console.log("Setting to " + speed);
            if (speed < 1) {
                speed = 1;
            } else if (speed > 10) {
                speed = 10;
            }
            this.props.rover.queueMessage(0xCE, speed);
        }
    }

    render() {
        return <Box justify="center" pad={{ "top": "none", "bottom": "small", "left": "small", "right": "small" }} className="tabContents" animation={{ "type": "fadeIn", "size": "small" }} direction="row" align="stretch" fill hoverIndicator={false}>
            <StyledCard title="Remote Control" narrow>
                {this.props.roverState.status !== 0x02 && <Button margin={{ "top": "small", "bottom": "small", "left": "none", "right": "none" }} label="Start Control" color={this.props.roverState.status ? "brand" : "status-unknown"} disabled={this.props.roverState.status ? false : true} onClick={this.handleDriveStart} icon={<Power />} primary />}
                {this.props.roverState.status === 0x02 && <Button margin={{ "top": "small", "bottom": "small", "left": "none", "right": "none" }} label="STOP MOTORS" color="status-critical" onClick={this.handleDriveStop} icon={<Halt />} primary />}
                <SettingsBox name={"Speed Target: " + (this.props.roverState.speed ? this.props.roverState.speed : "-")}>
                    <Bounds enable={this.props.roverState.status === 2} value={this.props.roverState.speed} setValue={this.handleSpeedChange} />
                </SettingsBox>
            </StyledCard>
            <StyledCard title="Controller State" foottext={this.props.isConnected ? "Error: right front controller - low voltage" : ""} narrow>
                <Box align="center" justify="center" margin={{ "bottom": "small" }}>
                    <Stack guidingChild={1}>
                        <Diagram
                            connections={[
                                {
                                    fromTarget: '1',
                                    toTarget: '0',
                                    thickness: 'xsmall',
                                    color: this.props.isConnected ? "accent-4" : "status-unknown",
                                    type: 'curved',
                                },
                                {
                                    fromTarget: '2',
                                    toTarget: '0',
                                    thickness: 'xsmall',
                                    color: this.props.isConnected ? "status-warning" : "status-unknown",
                                    type: 'curved',
                                },
                                {
                                    fromTarget: '3',
                                    toTarget: '0',
                                    thickness: 'xsmall',
                                    color: this.props.isConnected ? "accent-4" : "status-unknown",
                                    type: 'curved',
                                },
                                {
                                    fromTarget: '4',
                                    toTarget: '0',
                                    thickness: 'xsmall',
                                    color: this.props.isConnected ? "accent-4" : "status-unknown",
                                    type: 'curved',
                                }
                            ]}
                        />
                        <Box>
                            <Box direction="row">
                                <Box id="1" margin="small" pad="medium" background={this.props.isConnected ? "status-ok" : "status-unknown"} />
                                <Box id="5" margin="small" pad="medium" background="none" />
                                <Box id="2" margin="small" pad="medium" background={this.props.isConnected ? "status-critical" : "status-unknown"} />
                            </Box>
                            <Box direction="row" justify="center">
                                <Box id="0" margin="small" pad="medium" background="#313131"><Trigger size="medium" color={this.props.isConnected ? "brand" : "status-unknown"} /></Box>
                            </Box>
                            <Box direction="row">
                                <Box id="3" margin="small" pad="medium" background={this.props.isConnected ? "status-ok" : "status-unknown"} />
                                <Box id="8" margin="small" pad="medium" background="none" />
                                <Box id="4" margin="small" pad="medium" background={this.props.isConnected ? "status-ok" : "status-unknown"} />
                            </Box>
                        </Box>
                    </Stack>
                </Box>
            </StyledCard>
            <StyledCard title="Keyboard Controls" narrow>
                <Distribution
                    values={[
                        { value: 50, image: (ls.get('lightMode') || false) ? wasdLight : wasdDark, title: "Move", text: "WASD keys" },
                        { value: 50, image: (ls.get('lightMode') || false) ? arrowLight : arrowDark, title: "Increase/Decrease Speed", text: "Arrow up/down" },
                    ]}
                    margin={{ "top": "small", "bottom": "small", "left": "none", "right": "none" }}
                    gap="medium"
                    alignSelf="center"
                    pad={{ "top": "small", "bottom": "small", "left": "medium", "right": "medium" }}
                    width={{ 'max': "375px" }}
                >
                    {value => (
                        <Box fill gap="small" justify="end" alignContent="center">
                            <Text textAlign="center">{value.title}</Text>
                            <Image src={value.image} />
                        </Box>
                    )}
                </Distribution>
            </StyledCard>
        </Box>;
    }
}

export default TabDrive;

const Bounds = (props) => {
    return (
        <Box direction="row" align="center" gap="small">
            <Button
                plain={false}
                disabled={!props.enable || props.value === undefined || isNaN(props.value) || props.value === 0 || props.value === 1}
                icon={<Subtract color="brand" />}
                onClick={() => {
                    props.setValue(props.value - 1);
                }}
            />
            <Box align="center" width="medium">
                <RangeInput
                    min={1}
                    max={10}
                    step={1}
                    disabled={true || props.value === undefined || isNaN(props.value) || props.value === 0}
                    value={(props.value === undefined || isNaN(props.value) || props.value === 0) ? 5 : props.value}
                    onChange={event => {
                        props.setValue(parseInt(event.target.value));
                    }}
                />
            </Box>
            <Button
                plain={false}
                disabled={!props.enable || props.value === undefined || isNaN(props.value) || props.value === 0 || props.value === 10}
                icon={<Add color="brand" />}
                onClick={() => {
                    props.setValue(props.value + 1);
                }}
            />
        </Box>
    );
};
