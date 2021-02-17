import React from 'react';
import { Collapsible, Box, Diagram, Stack, Button, RangeInput, Image, Distribution, Text, Table, TableHeader, TableRow, TableCell, TableBody, ResponsiveContext } from "grommet";
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

    handleSpeedChange(speed) {
        if (this.props.isConnected === true) {
            if (speed < 1) {
                speed = 1;
            } else if (speed > 10) {
                speed = 10;
            }
            this.props.rover.queueMessage(0xCE, speed);
        }
    }

    handleDPad = (event, keycode, preventDefault = true) => {
        if(preventDefault) event.preventDefault();
        this.props.rover.queueKey(0xCA, keycode);
        if(parseInt(keycode) % 10 === 1 && (ls.get('vibrate') !== null ? ls.get('vibrate') : true)) {
            window.navigator.vibrate(5);
        };
    }

    render() {
        return <Box justify="center" pad={{ "top": "none", "bottom": "small", "left": "small", "right": "small" }} className="tabContents" animation={{ "type": "fadeIn", "size": "small" }} direction="row" align="stretch" fill hoverIndicator={false}>
            <StyledCard title="Remote Control" centered max>
                {this.props.roverState.status !== 0x02 && <Button margin={{ "top": "small", "bottom": "small", "left": "none", "right": "none" }} label="Start Control" color={this.props.roverState.status ? "brand" : "status-unknown"} disabled={this.props.roverState.status ? false : true} onClick={this.handleDriveStart} icon={<Power />} primary />}
                {this.props.roverState.status === 0x02 && <Button margin={{ "top": "small", "bottom": "small", "left": "none", "right": "none" }} label="STOP MOTORS" color="status-critical" onClick={this.handleDriveStop} icon={<Halt />} primary />}
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
                                onMouseUp={(event) => this.handleDPad(event, "60") }
                                onMouseLeave={(event) => this.handleDPad(event, "60")}
                                onTouchStart={(event) => this.handleDPad(event, "61", false)}
                                onTouchEnd={(event) => this.handleDPad(event, "60")}
                            />
                        </Box>
                    </Box>
                    <SettingsGroup name={"Speed Target: " + (this.props.roverState.speed ? this.props.roverState.speed : "-")}>
                        <Bounds enable={this.props.roverState.status === 2} value={this.props.roverState.speed} setValue={this.handleSpeedChange} />
                    </SettingsGroup>
                </Collapsible>
            </StyledCard>
            <StyledCard title="Controller State" centered wide>
                <ResponsiveContext.Consumer>
                    {size => (
                        <Box align="center" justify="around" margin={{ "bottom": "small" }} direction="row" wrap={true}>
                            <ControllerDiagram isConnected={this.props.isConnected} />
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableCell scope="col" border="bottom"></TableCell>
                                        <TableCell scope="col" border="bottom">Status</TableCell>
                                        {(size !== "small" && size !== "xsmall" && <>
                                            <TableCell scope="col" border="bottom">VIN</TableCell>
                                            <TableCell scope="col" border="bottom">Current</TableCell>
                                            <TableCell scope="col" border="bottom">Target Speed</TableCell>
                                            <TableCell scope="col" border="bottom">Speed</TableCell>
                                        </>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell scope="row" background={this.props.isConnected ? "status-critical" : "none"}>
                                            <strong>R Front</strong>
                                        </TableCell>
                                        <TableCell background={this.props.isConnected ? "status-critical" : "none"}>
                                            <strong>{this.props.isConnected ? "LOW VIN" : "-"}</strong>
                                        </TableCell>
                                        {(size !== "small" && size !== "xsmall" && <>
                                            <TableCell background={this.props.isConnected ? "status-critical" : "none"}>{this.props.isConnected ? "9.6 V" : "-"}</TableCell>
                                            <TableCell>{this.props.isConnected ? "1500 mA" : "-"}</TableCell>
                                            <TableCell>{this.props.isConnected ? "0 rpm" : "-"}</TableCell>
                                            <TableCell>{this.props.isConnected ? "0 rpm" : "-"}</TableCell>
                                        </>)}
                                    </TableRow>
                                    <TableRow>
                                        <TableCell scope="row">
                                            <strong>L Front</strong>
                                        </TableCell>
                                        <TableCell>
                                            <strong>{this.props.isConnected ? "OK" : "-"}</strong>
                                        </TableCell>
                                        {(size !== "small" && size !== "xsmall" && <>
                                            <TableCell>{this.props.isConnected ? "12.1 V" : "-"}</TableCell>
                                            <TableCell>{this.props.isConnected ? "1500 mA" : "-"}</TableCell>
                                            <TableCell>{this.props.isConnected ? "0 rpm" : "-"}</TableCell>
                                            <TableCell>{this.props.isConnected ? "0 rpm" : "-"}</TableCell>
                                        </>)}
                                    </TableRow>
                                    <TableRow>
                                        <TableCell scope="row">
                                            <strong>R Rear</strong>
                                        </TableCell>
                                        <TableCell>
                                            <strong>{this.props.isConnected ? "OK" : "-"}</strong>
                                        </TableCell>
                                        {(size !== "small" && size !== "xsmall" && <>
                                            <TableCell>{this.props.isConnected ? "12.1 V" : "-"}</TableCell>
                                            <TableCell>{this.props.isConnected ? "1500 mA" : "-"}</TableCell>
                                            <TableCell>{this.props.isConnected ? "0 rpm" : "-"}</TableCell>
                                            <TableCell>{this.props.isConnected ? "0 rpm" : "-"}</TableCell>
                                        </>)}
                                    </TableRow>
                                    <TableRow>
                                        <TableCell scope="row">
                                            <strong>L Rear</strong>
                                        </TableCell>
                                        <TableCell>
                                            <strong>{this.props.isConnected ? "OK" : "-"}</strong>
                                        </TableCell>
                                        {(size !== "small" && size !== "xsmall" && <>
                                            <TableCell>{this.props.isConnected ? "12.1 V" : "-"}</TableCell>
                                            <TableCell>{this.props.isConnected ? "1500 mA" : "-"}</TableCell>
                                            <TableCell>{this.props.isConnected ? "0 rpm" : "-"}</TableCell>
                                            <TableCell>{this.props.isConnected ? "0 rpm" : "-"}</TableCell>
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
                        color: props.isConnected ? "accent-4" : "status-unknown",
                        type: 'curved',
                    },
                    {
                        fromTarget: '2',
                        toTarget: '0',
                        thickness: 'xsmall',
                        color: props.isConnected ? "status-warning" : "status-unknown",
                        type: 'curved',
                    },
                    {
                        fromTarget: '3',
                        toTarget: '0',
                        thickness: 'xsmall',
                        color: props.isConnected ? "accent-4" : "status-unknown",
                        type: 'curved',
                    },
                    {
                        fromTarget: '4',
                        toTarget: '0',
                        thickness: 'xsmall',
                        color: props.isConnected ? "accent-4" : "status-unknown",
                        type: 'curved',
                    }
                ]}
            />
            <Box>
                <Box direction="row">
                    <Box id="1" margin="small" pad="medium" background={props.isConnected ? "status-ok" : "status-unknown"} />
                    <Box id="5" margin="small" pad="medium" background="none" />
                    <Box id="2" margin="small" pad="medium" background={props.isConnected ? "status-critical" : "status-unknown"} />
                </Box>
                <Box direction="row" justify="center">
                    <Box id="0" margin="small" pad="medium" background="#313131"><Trigger size="medium" color={props.isConnected ? "brand" : "status-unknown"} /></Box>
                </Box>
                <Box direction="row">
                    <Box id="3" margin="small" pad="medium" background={props.isConnected ? "status-ok" : "status-unknown"} />
                    <Box id="8" margin="small" pad="medium" background="none" />
                    <Box id="4" margin="small" pad="medium" background={props.isConnected ? "status-ok" : "status-unknown"} />
                </Box>
            </Box>
        </Stack>
    )
}

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
