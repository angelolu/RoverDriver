import React from 'react';
import { Collapsible, Box, Diagram, Stack, Button, RangeInput, Image, Distribution, Text, Table, TableHeader, TableRow, TableCell, TableBody, ResponsiveContext, Heading } from "grommet";
import { SettingsGroup, StyledCard } from "./CommonUI";
import { Trigger, Halt, Power, Add, Subtract, CaretUp, CaretDown, CaretNext, CaretPrevious } from 'grommet-icons'
import ls from 'local-storage'

import wasdDark from './wasd-dark.png';
import arrowDark from './arrow-dark.png';
import wasdLight from './wasd-light.png';
import arrowLight from './arrow-light.png';
import escDark from './esc-dark.png';
import escLight from './esc-light.png';

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

    handleSpeedChange(event, speed, preventDefault = true) {
        if (preventDefault) event.preventDefault();
        if (this.props.isConnected === true) {
            if (speed < 1) {
                speed = 1;
            } else if (speed > 10) {
                speed = 10;
            }
            this.props.rover.queueMessage(0xCE, speed);
        }
        if (ls.get('vibrate') !== null ? ls.get('vibrate') : true) {
            window.navigator.vibrate(5);
        };
    }

    handleDPad = (event, keycode, preventDefault = true) => {
        if (preventDefault) event.preventDefault();
        if (keycode) {
            this.props.rover.queueKey(0xCA, keycode);
            if (parseInt(keycode) % 10 === 1 && (ls.get('vibrate') !== null ? ls.get('vibrate') : true)) {
                window.navigator.vibrate(5);
            };
        }
    }

    render() {
        return <Box justify="center" pad={{ "top": "none", "bottom": "small", "left": "small", "right": "small" }} className="tabContents" animation={{ "type": "fadeIn", "size": "small" }} direction="row" align="stretch" fill hoverIndicator={false}>
            <StyledCard title="Remote Control" max>
                {(this.props.roverState.status !== 0x02 && this.props.roverState.status && this.props.roverState.voltage !== undefined && this.props.roverState.voltage <= 13.2) && <Heading alignSelf="center" level={6} margin="none">Battery low! Can't start motor control.</Heading>}
                {this.props.roverState.status !== 0x02 && <Button margin={{ "top": "small", "bottom": "small", "left": "none", "right": "none" }} label="Start Control" color={this.props.roverState.status ? "brand" : "status-unknown"} disabled={(this.props.roverState.status && this.props.roverState.voltage !== undefined && this.props.roverState.voltage > 13.2) ? false : true} onClick={this.handleDriveStart} icon={<Power />} primary />}
                {this.props.roverState.status === 0x02 && <Button margin={{ "top": "small", "bottom": "small", "left": "none", "right": "none" }} label="STOP MOTORS" color="status-critical" onClick={this.handleDriveStop} icon={<Halt />} primary />}
                <Heading alignSelf="center" level={6} margin="none">Keyboard controls {this.props.roverState.status === 0x02 ? "available" : "disabled"}</Heading>
                <Collapsible direction="vertical" open={this.props.roverState.status === 2}>
                    <Box align="center" justify="around" margin={{ "top": "small", "bottom": "small" }} direction="column" gap="small">
                        <Box direction="row">
                            <Button
                                plain={false}
                                disabled={this.props.roverState.status !== 2}
                                className="btouch"
                                icon={<CaretUp color="brand" />}
                                onClick={() => {
                                    //props.setValue(props.value - 1);
                                }}
                                onMouseDown={(event) => this.handleDPad(event, "51")}
                                onMouseUp={(event) => this.handleDPad(event, "50")}
                                onMouseLeave={(event) => this.handleDPad(event, "50")}
                                onTouchStart={(event) => this.handleDPad(event, "51", false)}
                                onTouchEnd={(event) => this.handleDPad(event, "50")}
                            />
                        </Box>
                        <Box direction="row" gap="small">
                            <Button
                                plain={false}
                                disabled={this.props.roverState.status !== 2}
                                className="btouch"
                                icon={<CaretPrevious color="brand" />}
                                onClick={() => {
                                    //props.setValue(props.value - 1);
                                }}
                                onMouseDown={(event) => this.handleDPad(event, "71")}
                                onMouseUp={(event) => this.handleDPad(event, "70")}
                                onMouseLeave={(event) => this.handleDPad(event, "70")}
                                onTouchStart={(event) => this.handleDPad(event, "71", false)}
                                onTouchEnd={(event) => this.handleDPad(event, "70")}
                            />
                            <Button
                                plain={false}
                                disabled={true}
                                icon={<Subtract color="none" />}
                            />
                            <Button
                                plain={false}
                                disabled={this.props.roverState.status !== 2}
                                className="btouch"
                                icon={<CaretNext color="brand" />}
                                onClick={() => {
                                    //props.setValue(props.value - 1);
                                }}
                                onMouseDown={(event) => this.handleDPad(event, "81")}
                                onMouseUp={(event) => this.handleDPad(event, "80")}
                                onMouseLeave={(event) => this.handleDPad(event, "80")}
                                onTouchStart={(event) => this.handleDPad(event, "81", false)}
                                onTouchEnd={(event) => this.handleDPad(event, "80")}
                            />
                        </Box>
                        <Box direction="row">
                            <Button
                                plain={false}
                                disabled={this.props.roverState.status !== 2}
                                className="btouch"
                                icon={<CaretDown color="brand" />}
                                onClick={() => {
                                    //props.setValue(props.value - 1);
                                }}
                                onMouseDown={(event) => this.handleDPad(event, "61")}
                                onMouseUp={(event) => this.handleDPad(event, "60")}
                                onMouseLeave={(event) => this.handleDPad(event, "60")}
                                onTouchStart={(event) => this.handleDPad(event, "61", false)}
                                onTouchEnd={(event) => this.handleDPad(event, "60")}
                            />
                        </Box>
                    </Box>
                    <SettingsGroup name={"Speed Target: " + (this.props.roverState.speed ? this.props.roverState.speed : "-")}>
                        <Bounds enable={this.props.roverState.status === 2} value={this.props.roverState.speed} setDPad={this.handleDPad} setValue={this.handleSpeedChange} />
                    </SettingsGroup>
                </Collapsible>
            </StyledCard>
            <StyledCard title="Controller State" centered wide>
                <ResponsiveContext.Consumer>
                    {size => (
                        <Box align="center" justify="around" margin={{ "bottom": "small" }} direction="row" wrap={true}>
                            <ControllerDiagram isConnected={this.props.isConnected} roverController={this.props.roverController} />
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableCell scope="col" border="bottom"></TableCell>
                                        <TableCell scope="col" border="bottom">Status</TableCell>
                                        {(size !== "small" && size !== "xsmall" && <>
                                            <TableCell scope="col" border="bottom">VIN</TableCell>
                                            <TableCell scope="col" border="bottom">Current</TableCell>
                                            <TableCell scope="col" border="bottom">Target Cycle</TableCell>
                                            <TableCell scope="col" border="bottom">Cycle</TableCell>
                                        </>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell scope="row" background={(this.props.roverController.FR && this.props.roverController.FR.error) ? "status-critical" : "none"}>
                                            <strong>Front R</strong>
                                        </TableCell>
                                        <TableCell background={(this.props.roverController.FR && this.props.roverController.FR.error) ? "status-critical" : "none"}>
                                            <strong>{this.props.roverController.FR && this.props.roverController.FR.online !== undefined ? (this.props.roverController.FR.online === 1 ? "OK" : "OFFLINE") : "-"}</strong>
                                        </TableCell>
                                        {(size !== "small" && size !== "xsmall" && <>
                                            <TableCell>{this.props.roverController.FR && this.props.roverController.FR.voltage ? (Math.round(this.props.roverController.FR.voltage * 100) / 100).toFixed(1) : "-"} V</TableCell>
                                            <TableCell>{this.props.roverController.FR && this.props.roverController.FR.current ? this.props.roverController.FR.current : "-"} mA</TableCell>
                                            <TableCell>{this.props.roverController.FR && this.props.roverController.FR.dutyCycleTarget ? this.props.roverController.FR.dutyCycleTarget : "-"}</TableCell>
                                            <TableCell>{this.props.roverController.FR && this.props.roverController.FR.dutyCycle ? this.props.roverController.FR.dutyCycle : "-"}</TableCell>
                                        </>)}
                                    </TableRow>
                                    <TableRow>
                                        <TableCell scope="row" background={(this.props.roverController.FL && this.props.roverController.FL.error) ? "status-critical" : "none"}>
                                            <strong>Front L</strong>
                                        </TableCell>
                                        <TableCell background={(this.props.roverController.FL && this.props.roverController.FL.error) ? "status-critical" : "none"}>
                                            <strong>{this.props.roverController.FL && this.props.roverController.FL.online !== undefined ? (this.props.roverController.FL.online === 1 ? "OK" : "OFFLINE") : "-"}</strong>
                                        </TableCell>
                                        {(size !== "small" && size !== "xsmall" && <>
                                            <TableCell>{this.props.roverController.FL && this.props.roverController.FL.voltage ? (Math.round(this.props.roverController.FL.voltage * 100) / 100).toFixed(1) : "-"} V</TableCell>
                                            <TableCell>{this.props.roverController.FL && this.props.roverController.FL.current ? this.props.roverController.FL.current : "-"} mA</TableCell>
                                            <TableCell>{this.props.roverController.FL && this.props.roverController.FL.dutyCycleTarget ? this.props.roverController.FL.dutyCycleTarget : "-"}</TableCell>
                                            <TableCell>{this.props.roverController.FL && this.props.roverController.FL.dutyCycle ? this.props.roverController.FL.dutyCycle : "-"}</TableCell>
                                        </>)}
                                    </TableRow>
                                    <TableRow>
                                        <TableCell scope="row" background={(this.props.roverController.RR && this.props.roverController.RR.error) ? "status-critical" : "none"}>
                                            <strong>Rear R</strong>
                                        </TableCell>
                                        <TableCell background={(this.props.roverController.RR && this.props.roverController.RR.error) ? "status-critical" : "none"}>
                                            <strong>{this.props.roverController.RR && this.props.roverController.RR.online !== undefined ? (this.props.roverController.RR.online === 1 ? "OK" : "OFFLINE") : "-"}</strong>
                                        </TableCell>
                                        {(size !== "small" && size !== "xsmall" && <>
                                            <TableCell>{this.props.roverController.RR && this.props.roverController.RR.voltage ? (Math.round(this.props.roverController.RR.voltage * 100) / 100).toFixed(1) : "-"} V</TableCell>
                                            <TableCell>{this.props.roverController.RR && this.props.roverController.RR.current ? this.props.roverController.RR.current : "-"} mA</TableCell>
                                            <TableCell>{this.props.roverController.RR && this.props.roverController.RR.dutyCycleTarget ? this.props.roverController.RR.dutyCycleTarget : "-"}</TableCell>
                                            <TableCell>{this.props.roverController.RR && this.props.roverController.RR.dutyCycle ? this.props.roverController.RR.dutyCycle : "-"}</TableCell>
                                        </>)}
                                    </TableRow>
                                    <TableRow>
                                        <TableCell scope="row" background={(this.props.roverController.RL && this.props.roverController.RL.error) ? "status-critical" : "none"}>
                                            <strong>Rear L</strong>
                                        </TableCell>
                                        <TableCell background={(this.props.roverController.RL && this.props.roverController.RL.error) ? "status-critical" : "none"}>
                                            <strong>{this.props.roverController.RL && this.props.roverController.RL.online !== undefined ? (this.props.roverController.RL.online === 1 ? "OK" : "OFFLINE") : "-"}</strong>
                                        </TableCell>
                                        {(size !== "small" && size !== "xsmall" && <>
                                            <TableCell>{this.props.roverController.RL && this.props.roverController.RL.voltage ? (Math.round(this.props.roverController.RL.voltage * 100) / 100).toFixed(1) : "-"} V</TableCell>
                                            <TableCell>{this.props.roverController.RL && this.props.roverController.RL.current ? this.props.roverController.RL.current : "-"} mA</TableCell>
                                            <TableCell>{this.props.roverController.RL && this.props.roverController.RL.dutyCycleTarget ? this.props.roverController.RL.dutyCycleTarget : "-"}</TableCell>
                                            <TableCell>{this.props.roverController.RL && this.props.roverController.RL.dutyCycle ? this.props.roverController.RL.dutyCycle : "-"}</TableCell>
                                        </>)}
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    )}

                </ResponsiveContext.Consumer>
            </StyledCard>
            <StyledCard title="Keyboard Controls">
                <Box justify="center" >
                    <Box gap="small" alignContent="center" margin={{ "top": "small", "bottom": "small", "left": "medium", "right": "medium" }}>
                        <Text textAlign="center">Stop motors & control</Text>
                        <Image src={(ls.get('lightMode') || false) ? escLight : escDark} />
                    </Box>
                    <Distribution
                        values={[
                            { value: 50, image: (ls.get('lightMode') || false) ? wasdLight : wasdDark, title: "Move", text: "WASD keys" },
                            { value: 50, image: (ls.get('lightMode') || false) ? arrowLight : arrowDark, title: "Decrease/increase speed", text: "Arrow up/down" },
                        ]}
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
                </Box>
            </StyledCard>
        </Box>;
    }
}

export default TabDrive;

const ControllerDiagram = (props) => {
    return (
        <Stack guidingChild={1}>
            <Diagram
                connections={[
                    {
                        fromTarget: '1',
                        toTarget: '0',
                        thickness: 'xsmall',
                        color: props.roverController.FL && props.roverController.FL.online !== undefined ? (props.roverController.FL.error ? "accent-1" : "accent-4") : "status-unknown",
                        type: 'curved',
                    },
                    {
                        fromTarget: '2',
                        toTarget: '0',
                        thickness: 'xsmall',
                        color: props.roverController.FR && props.roverController.FR.online !== undefined ? (props.roverController.FR.error ? "accent-1" : "accent-4") : "status-unknown",
                        type: 'curved',
                    },
                    {
                        fromTarget: '3',
                        toTarget: '0',
                        thickness: 'xsmall',
                        color: props.roverController.RL && props.roverController.RL.online !== undefined ? (props.roverController.RL.error ? "accent-1" : "accent-4") : "status-unknown",
                        type: 'curved',
                    },
                    {
                        fromTarget: '4',
                        toTarget: '0',
                        thickness: 'xsmall',
                        color: props.roverController.RR && props.roverController.RR.online !== undefined ? (props.roverController.RR.error ? "accent-1" : "accent-4") : "status-unknown",
                        type: 'curved',
                    }
                ]}
            />
            <Box>
                <Box direction="row">
                    <Box id="1" margin="small" pad="medium" background={props.roverController.FL && props.roverController.FL.online !== undefined ? (props.roverController.FL.error ? "status-critical" : "status-ok") : "status-unknown"} />
                    <Box id="5" margin="small" pad="medium" background="none" />
                    <Box id="2" margin="small" pad="medium" background={props.roverController.FR && props.roverController.FR.online !== undefined ? (props.roverController.FR.error ? "status-critical" : "status-ok") : "status-unknown"} />
                </Box>
                <Box direction="row" justify="center">
                    <Box id="0" margin="small" pad="medium" background="#313131"><Trigger size="medium" color={props.isConnected ? "brand" : "status-unknown"} /></Box>
                </Box>
                <Box direction="row">
                    <Box id="3" margin="small" pad="medium" background={props.roverController.RL && props.roverController.RL.online !== undefined ? (props.roverController.RL.error ? "status-critical" : "status-ok") : "status-unknown"} />
                    <Box id="8" margin="small" pad="medium" background="none" />
                    <Box id="4" margin="small" pad="medium" background={props.roverController.RR && props.roverController.RR.online !== undefined ? (props.roverController.RR.error ? "status-critical" : "status-ok") : "status-unknown"} />
                </Box>
            </Box>
        </Stack>
    )
}

const Bounds = (props) => {
    return (
        <Box direction="row" align="center" gap="small">
            <Button
                className="btouch"
                plain={false}
                disabled={!props.enable || props.value === undefined || isNaN(props.value) || props.value === 0 || props.value === 1}
                icon={<Subtract color="brand" />}
                onClick={() => {
                    //props.setValue(props.value - 1);
                }}
                onMouseDown={(event) => props.setDPad(event, "21")}
                onMouseUp={(event) => props.setDPad(event, false)}
                onMouseLeave={(event) => props.setDPad(event, false)}
                onTouchStart={(event) => props.setDPad(event, "21", false)}
                onTouchEnd={(event) => props.setDPad(event, false)}
            />
            <Box align="center" width="medium">
                <RangeInput
                    min={1}
                    max={10}
                    step={1}
                    // This is disabled because it is too jerky/laggy
                    disabled={true || props.value === undefined || isNaN(props.value) || props.value === 0}
                    value={(props.value === undefined || isNaN(props.value) || props.value === 0) ? 5 : props.value}
                    onChange={event => {
                        props.setValue(false, parseInt(event.target.value), false);
                    }}
                />
            </Box>
            <Button
                className="btouch"
                plain={false}
                disabled={!props.enable || props.value === undefined || isNaN(props.value) || props.value === 0 || props.value === 10}
                icon={<Add color="brand" />}
                onClick={() => {
                    //props.setValue(props.value - 1);
                }}
                onMouseDown={(event) => props.setDPad(event, "11")}
                onMouseUp={(event) => props.setDPad(event, false)}
                onMouseLeave={(event) => props.setDPad(event, false)}
                onTouchStart={(event) => props.setDPad(event, "11", false)}
                onTouchEnd={(event) => props.setDPad(event, false)}
            />
        </Box>
    );
};
