import { Box, DataChart, Text, Heading, CardFooter, Card, CardHeader, CardBody } from 'grommet'

export function StateBox(props) {
    return <>
        <Box align="center" justify="start" direction="row" margin={{ "bottom": "small" }}>
            {props.icon}
            <Box align="start" margin={{ "left": "medium" }}>
                <Text margin="none">
                    {props.name}
                </Text>
                <Text weight="bold" level="4" margin="none">
                    {props.value}{props.unit ? " " + props.unit : ""}
                </Text>
            </Box>
        </Box>
    </>;
}

export function StyledCard(props) {
    return <>
        <Card width={props.wide ? { "min": "300px", "max": "500px" } : { "min": "300px", "max": "400px" }} elevation="0" margin="small" background={{ "color": "background-front" }}>
            {props.title && <CardHeader background={{ "color": "background-contrast" }} align="center" direction="row" justify="between" gap="medium" pad={{ "top": "small", "bottom": "small", "left": "medium", "right": "medium" }}>
                <Text weight="bold">
                    {props.title}
                </Text>
            </CardHeader>}
            {props.children && <CardBody pad={{ "top": "small", "bottom": "none", "left": "medium", "right": "medium" }} >{props.children}</CardBody>}
            {props.foottext && <CardFooter align="center" direction="row" justify="center" gap="medium" pad="small">
                <Heading level="4" textAlign="center" margin={{ "top": "xsmall", "bottom": "xsmall" }}>
                    {props.foottext}
                </Heading>
            </CardFooter>}
        </Card>
    </>;
}

export function MovingGraph(props) {
    return <>
        <Text>
            X: {props.data[props.data.length - 1]["X"]}, Y: {props.data[props.data.length - 1]["Y"]}, Z: {props.data[props.data.length - 1]["Z"]} [{props.unit}]
                        </Text>
        <DataChart axis={{ "x": { "granularity": "coarse" }, "y": { "granularity": "medium" } }} chart={[{ "property": "X", "type": "line", "thickness": "xxsmall", "dash": false, "round": false, "color": "accent-4" }, { "property": "Y", "type": "line", "color": "accent-3", "thickness": "xxsmall", "round": false }, { "property": "Z", "type": "line", "color": "accent-2", "thickness": "xxsmall", "round": false }]} data={props.data} guide={{ "x": { "granularity": "fine" }, "y": { "granularity": "medium" } }} series={[{ "property": "time", "label": "Time" }, { "property": "X", "label": "X" }, { "property": "Y", "label": "Y" }, { "property": "Z", "label": "Z" }]} size={{ "width": "medium", "height": "150px" }} detail={false} legend />
    </>;
}
