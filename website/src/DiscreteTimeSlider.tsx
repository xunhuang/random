import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";
const moment = require("moment");

const useStyles = makeStyles({
    root: {
        width: "90%"
    }
});

export interface DiscreteTimeSliderItems {
    timestamp: number;
    item: any;
}

export default function DiscreteTimeSlider(props: {
    items: DiscreteTimeSliderItems[],
    callback?: (item: any) => void;
}) {
    const classes = useStyles();
    var marks: any[] = [];
    const length = props.items.length;

    if (length < 2) return null

    for (let i = 0; i < length; i++) {
        marks.push({
            value: i * 100 / (length - 1),
            label: moment(props.items[i].timestamp).format("M/D"),
            time: moment(props.items[i].timestamp),
        })
    }
    function valueLabelFormat(value: number) {
        let index = marks.findIndex((mark) => mark.value === value);
        return marks[index].time.format("HH:MM");
    }

    return (
        <div className={classes.root}>
            <Slider
                defaultValue={100}
                valueLabelFormat={valueLabelFormat}
                aria-labelledby="discrete-slider-restrict"
                step={null}
                valueLabelDisplay="auto"
                marks={marks}
                onChangeCommitted={
                    (event, value) => {
                        if (props.callback) {
                            let index = marks.findIndex((mark) => mark.value === value);
                            props.callback(props.items[index])
                        }
                    }
                }
            />
        </div>
    );
}
