import React from 'react';
import { RandomBackend } from "./RandomBackend";
import GoogleButton from 'react-google-button';
import { makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles({
    root: {
        width: "90%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
    signInButton: {
        display: "block",
        margin: "auto",
        width: "max-content",
    }
});

export function UnauthenticatedApp() {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <p />
            <Typography variant="h3"> GoWatchIt.net</Typography>
            <p />
            <Typography variant="h4"> We watch your websites for you </Typography>
            <p />
            <GoogleButton className={classes.signInButton} onClick={(event) => {
                RandomBackend.login();
            }} />
        </div>
    );
}