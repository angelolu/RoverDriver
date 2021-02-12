import React from 'react';
import { Box, Diagram, Stack, Button } from "grommet";
import { StyledCard } from "./CommonUI";
import { Trigger, Halt, Power } from 'grommet-icons'

class TabDrive extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            lightMode: false,
        };
        this.handleDriveStart = this.handleDriveStart.bind(this);
        this.handleDriveStop = this.handleDriveStop.bind(this);
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

    render() {
        return <Box justify="center" pad={{ "top": "none", "bottom": "medium", "left": "small", "right": "small" }} className="tabContents" animation={{ "type": "fadeIn", "size": "small" }} direction="row" fill hoverIndicator={false}>
            <StyledCard title="Remote Control">
                {this.props.roverState.status !== 0x02 && <Button margin={{ "top": "small", "bottom": "small", "left": "none", "right": "none" }} label="Start Control" color={this.props.roverState.status ? "brand" : "status-unknown"} disabled={this.props.roverState.status ? false : true} onClick={this.handleDriveStart} icon={<Power />} primary />}
                {this.props.roverState.status === 0x02 && <Button margin={{ "top": "small", "bottom": "small", "left": "none", "right": "none" }} label="STOP MOTORS" color="status-critical" onClick={this.handleDriveStop} icon={<Halt />} primary />}
            </StyledCard>
            <StyledCard title="Controller State" foottext={this.props.isConnected ? "Error: right front controller - low voltage" : ""}>
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
        </Box>;
    }
}

export default TabDrive;