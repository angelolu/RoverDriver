import React from 'react'
import { Grommet, Box, Header, Heading, Button, Tabs, Tab, Card, CardHeader, CardBody, DataChart } from 'grommet'
import { Connect, StatusGoodSmall, Trigger, Wifi, Info, Gamepad, DocumentTest, Configure, Close } from 'grommet-icons'
import Rover from './Rover'
import { RoverTheme } from './theme'
import './App.css';


class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      rover: null,
      connected: false,
      roverState: {}
    };
    this.handleConnectClick = this.handleConnectClick.bind(this);
    this.handleDisconnectClick = this.handleDisconnectClick.bind(this);
  }

  componentDidMount() {
    this.setState({ ...this.state, rover: new Rover() });
    console.log("Mounted");
  }

  componentWillUnmount() {
    console.log("Unmounting");
    this.disconnectRover()
  }

  handleConnectClick(e) {
    e.preventDefault();
    this.state.rover.request()
      .then(_ => this.state.rover.connect())
      .then((bluetoothRemoteGATTServer) => { /* Do something with rover... */
        console.log(this.state.rover.getDevice());
        this.state.rover.getDevice().addEventListener('gattserverdisconnected', _ => {
          this.setState({ ...this.state, connected: false, roverState: {} });
        });
        this.state.rover.startTxNotifications((event) => {
          this.handleUARTTX(event)
        });
        this.setState({ ...this.state, connected: true });
      })
      .catch(error => {
        console.log(error);
        this.setState({ ...this.state, connected: false });
      });
  }

  handleUARTTX(event) {
    let message = new Uint8Array(event.target.value.buffer);
    if (message.length > 1) {
      switch (message[0]) {
        case 0xA1:
          // Status
          this.setState({ ...this.state, roverState: { ...this.state.roverState, status: message[1] } });
          break;
        case 0xA2:
          this.setState({ ...this.state, roverState: { ...this.state.roverState, voltage: String.fromCharCode.apply(null, message.slice(1)) } });
          break;
        default:
          console.log("Unknown Message: " + String.fromCharCode.apply(null, message));
      }
    }
  }

  disconnectRover() {
    if (this.state.connected === true) {
      this.state.rover.disconnect();
    }
    this.setState({ ...this.state, connected: false, roverState: {} });
  }

  handleDisconnectClick(e) {
    e.preventDefault();
    this.state.rover.disconnect();
    this.setState({ ...this.state, connected: false, roverState: {} });
  }
  render() {
    let statusColor = "status-unknown";
    let statusMessage = "UNKNOWN";
    switch (this.state.roverState.status) {
      case 0:
        console.log("OK");
        statusColor = "status-ok";
        statusMessage = "IDLE - SAFE TO APPROACH";
        break;
      case 1:
        console.log("WARNING");
        statusColor = "status-warning";
        statusMessage = "READY - STAND CLEAR";
        break;
      case 2:
        console.log("CRITICAL");
        statusColor = "status-critical";
        statusMessage = "MOTORS POWERED - DO NOT APPROACH";
        break;
      default:
        console.log("None");
        statusColor = "status-unknown";
        statusMessage = "UNKNOWN";
        break;
    }
    return (
      <Grommet full theme={RoverTheme}>
        <Box fill="vertical" overflow="auto" align="center" flex="grow">
          <Header className="appHeader" align="end" justify="center" gap="medium" background={{ "color": "background-contrast" }} fill="horizontal">
            <Box className="appHeaderBox" align="center" direction="row" flex="grow" pad="medium">
              <Box align="start" justify="center" direction="column" gap="small">
                <Heading level="2" margin="none" textAlign="start">
                  {this.state.connected ? "Connected" : "Not Connected"}
                </Heading>
                {this.state.connected ? <Button label="Disconnect" onClick={this.handleDisconnectClick} icon={<Close />} disabled={false} primary /> : <Button label="Connect" onClick={this.handleConnectClick} icon={<Connect />} disabled={false} primary />}
              </Box>
              <Box align="center" justify="center" direction="row" gap="medium">
                <Box align="end" justify="center" direction="column">
                  <Heading level="3" margin="none" textAlign="start">
                    {this.state.connected ? this.state.rover.getDevice().name : "-"}
                  </Heading>
                  <Heading level="4" margin="none" textAlign="start">
                    {statusMessage}
                </Heading>
                </Box>
                <StatusGoodSmall color={statusColor} size="large" />
              </Box>
            </Box>
          </Header>
          <Box className="box_Content">
            <Tabs justify="center" margin="small" flex>
              <Tab title="Status" icon={<Info />}>
                <Box justify="center" className="tabContents" animation={{ "type": "fadeIn", "size": "small" }} direction="row" fill hoverIndicator={false}>
                  <Card className="card card-basic" elevation="0" width={{ "min": "300px", "max":"400px" }} margin="small" pad="xsmall" background={{ "color": "background-front" }}>
                    <CardHeader align="center" direction="row" justify="between" gap="medium" pad="small">
                      <Heading level="3" margin={{ "top": "xsmall", "bottom": "xsmall" }}>
                        System
                    </Heading>
                    </CardHeader>
                    <CardBody pad="small">
                      <Box align="center" justify="between" direction="row" margin={{ "bottom": "small" }}>
                        <Trigger size="large" />
                        <Box align="end" justify="center">
                          <Heading level="4" margin="none">
                            Battery
                        </Heading>
                          <Heading level="3" margin="none">
                          {this.state.connected ? this.state.roverState.voltage : "-"} V
                        </Heading>
                        </Box>
                      </Box>
                      <Box align="center" justify="between" direction="row" margin={{ "bottom": "small" }}>
                        <Wifi size="large" />
                        <Box align="end" justify="center">
                          <Heading level="4" margin="none" textAlign="end">
                            Signal
                        </Heading>
                          <Heading level="3" margin="none">
                            Medium
                        </Heading>
                        </Box>
                      </Box>
                    </CardBody>
                  </Card>
                  <Card className="card card-wide" elevation="0" width={{ "min": "300px", "max":"600px" }} margin="small" pad="xsmall" background={{ "color": "background-front" }}>
                    <CardHeader align="center" direction="row" justify="between" gap="medium" pad="small">
                      <Heading level="3" margin={{ "top": "xsmall", "bottom": "xsmall" }}>
                        Acceleration
                    </Heading>
                    </CardHeader>
                    <CardBody pad="small" >
                      <Box align="center" justify="center" gap="xxsmall">

                        <Heading level="4" margin="none">
                          X: 0, Y: 0, Z: 0
                        </Heading>
                      
                      <DataChart axis={{ "x": { "granularity": "fine" }, "y": { "granularity": "fine" } }} chart={[{ "property": "X", "type": "line", "thickness": "xsmall", "dash": false, "round": false, "color": "accent-4" }, { "property": "Y", "type": "line", "color": "accent-3", "thickness": "xsmall", "round": false }, { "property": "Z", "type": "line", "color": "accent-2", "thickness": "xsmall", "round": false }]} data={[{ "date": "2020-01-15", "X": 22, "Y": 27, "Z": 60 }, { "date": "2020-02-15", "X": 11, "Y": 25, "Z": 50 }, { "date": "2020-03-15", "X": 33, "Y": 5, "Z": 52 }, { "date": "2020-04-15", "X": 77, "Y": 16, "Z": 48 }, { "date": "2020-05-15", "X": 88, "Y": 28, "Z": 42 }]} guide={{ "x": { "granularity": "coarse" }, "y": { "granularity": "coarse" } }} series={[{ "property": "date", "label": "Time" }, { "property": "X", "label": "X" }, { "property": "Y", "label": "Y" }, { "property": "Z", "label": "Z" }]} size={{ "width": "medium", "height": "small" }} detail={false} legend />
                      </Box>
                    </CardBody>
                  </Card>
                </Box>
              </Tab>
              <Tab title="Drive" icon={<Gamepad />} />
              <Tab title="Collect Data" icon={<DocumentTest />} />
              <Tab title="Settings" plain={false} disabled={false} icon={<Configure />} />
            </Tabs>
          </Box>
        </Box>
      </Grommet>
    )
  }
}

export default App;