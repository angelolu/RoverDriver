import { Box, DataChart, Text, Heading, CardFooter, Card, CardHeader, CardBody, Button } from 'grommet'
import { FormClose, StatusInfo } from 'grommet-icons'

export function StateBox(props) {
    return <>
        <Box align="center" justify="start" direction="row" margin={{ "bottom": "small" }}>
            {props.icon}
            <Box align="start" margin={{ "left": "medium" }}>
                <Heading level={5} margin="none">
                    {props.name}
                </Heading>
                {props.children && <Box margin="none">{props.children}</Box>}
                {(props.unit || props.value) &&
                    <Text margin="none">
                        {props.value}{props.unit ? " " + props.unit : ""}
                    </Text>
                }
            </Box>
        </Box>
    </>;
}

export function SettingsGroup(props) {
    return <>
        <Box margin={{ "bottom": "small" }}>
            <Heading level={5} margin="none">
                {props.name}
            </Heading>
            {props.children && <Box align="start" margin={{ "top": "small", "bottom": "none", "left": "small", "right": "none" }}>{props.children}</Box>}
            {(props.unit || props.value) &&
                <Text weight="bold" level="4" margin="none">
                    {props.value}{props.unit ? " " + props.unit : ""}
                </Text>
            }
        </Box>
    </>;
}

export function StyledCard(props) {
    return <>
        <Card className={props.wide ? "wideCard" : "normalCard"} elevation="0" margin="small" background={{ "color": "background-front" }}>
            {props.title && <CardHeader background={{ "color": "background-contrast" }} align="center" direction="row" justify="between" gap="medium" pad={{ "top": "small", "bottom": "small", "left": "medium", "right": "medium" }}>
                <Text weight="bold">
                    {props.title}
                </Text>
            </CardHeader>}
            {props.children && <CardBody pad={{ "top": "small", "bottom": "small", "left": "medium", "right": "medium" }} justify={props.centered ? "center" : "start"}>{props.children}</CardBody>}
            {props.foottext && <CardFooter align="center" direction="row" justify="center" gap="medium" pad={{ "top": "small", "bottom": "small", "left": "medium", "right": "medium" }}>
                <Heading level="4" textAlign="center" margin={{ "top": "xsmall", "bottom": "xsmall" }}>
                    {props.foottext}
                </Heading>
            </CardFooter>}
        </Card>
    </>;
}

export function MovingGraph(props) {
    if (props.data)
        return <>
            <Text>
                X: {props.data[props.data.length - 1]["X"].toFixed(2)}, Y: {props.data[props.data.length - 1]["Y"].toFixed(2)}, Z: {props.data[props.data.length - 1]["Z"].toFixed(2)} [{props.unit}]
                        </Text>
            <DataChart axis={{ "x": { "granularity": "coarse" }, "y": { "granularity": "medium" } }} chart={[{ "property": "X", "type": "line", "thickness": "xxsmall", "dash": false, "round": false, "color": "accent-4" }, { "property": "Y", "type": "line", "color": "accent-3", "thickness": "xxsmall", "round": false }, { "property": "Z", "type": "line", "color": "accent-2", "thickness": "xxsmall", "round": false }]} data={props.data} guide={{ "x": { "granularity": "medium" }, "y": { "granularity": "medium" } }} series={[{ "property": "time", "label": "Time" }, { "property": "X", "label": "X" }, { "property": "Y", "label": "Y" }, { "property": "Z", "label": "Z" }]} size={{ "width": "medium", "height": "150px" }} detail={false} legend />
        </>;
    return <></>;
}

export function StyledNotification(props) {

    function handleClick(e) {
        props.onClose(props.id);
    }

    function handleAction(e) {
        props.actionHandle(props.id);
    }

    return (
        <Box
            align="center"
            direction="row"
            gap="medium"
            justify="between"
            elevation="xxsmall"
            pad={{ vertical: 'small', horizontal: 'medium' }}
            background={props.background}
            animation={["slideUp"]}
        >
            <StatusInfo color="#ffffff" />
            <Text>
                {props.text}
            </Text>
            {props.actionText && props.actionHandle && <Button onClick={handleAction} label={props.actionText} plain />}
            {props.onClose && <Button icon={<FormClose />} onClick={handleClick} plain />}
        </Box>
    );
}