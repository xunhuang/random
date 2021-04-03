import React from 'react';
import { RandomBackend } from "./RandomBackend";
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
const useStyles = makeStyles(theme => ({
    topContainer: {
        display: 'flex',
        alignItems: 'baseline',
        margin: 5,
    },
    title: {
        display: 'block',
        padding: 2,
        paddingRight: 10,
        margin: 2,
    },
    grow: {
        flex: 1,
    }
}));
export function Header() {
    const classes = useStyles();
    return (
        <div className={classes.topContainer}>
            <span className={classes.title}>
                <Typography variant="h6">
                    GoWatchIt.net
            </Typography>
                {/* <Typography variant="body2" noWrap>
                    We watch websites for you
          </Typography> */}
            </span>
            <span className={classes.grow}></span>
            <p onClick={(event) => {
                RandomBackend.logout();
            }}>
                Logout
        </p>
        </div>
    );
}
