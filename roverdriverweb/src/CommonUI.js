import { Box, Heading, DataChart } from 'grommet'

export function StateBox(props) {
    return <>
        <Box align="center" justify="between" direction="row" margin={{ "bottom": "small" }}>
            {props.icon}
            <Box align="end" justify="center">
                <Heading level="4" margin="none">
                    {props.name}
                </Heading>
                <Heading level="3" margin="none">
                    {props.value}{props.unit ? " " + props.unit : ""}
                </Heading>
            </Box>
        </Box>
    </>;
}

export function MovingGraph(props) {
    return <>
        <DataChart axis={{ "x": { "granularity": "coarse" }, "y": { "granularity": "medium" } }} chart={[{ "property": "X", "type": "line", "thickness": "xsmall", "dash": false, "round": false, "color": "accent-4" }, { "property": "Y", "type": "line", "color": "accent-3", "thickness": "xsmall", "round": false }, { "property": "Z", "type": "line", "color": "accent-2", "thickness": "xsmall", "round": false }]} data={props.data} guide={{ "x": { "granularity": "fine" }, "y": { "granularity": "medium" } }} series={[{ "property": "time", "label": "Time" }, { "property": "X", "label": "X" }, { "property": "Y", "label": "Y" }, { "property": "Z", "label": "Z" }]} size={{ "width": "medium", "height": "200px" }} detail={false} legend />
    </>;
}
