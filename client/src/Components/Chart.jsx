import React, { Fragment, useState, useEffect } from "react";
import axios from "axios";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    "& > *": {
      margin: theme.spacing(2)
    }
  }
}));

function Chart() {
  const classes = useStyles();

  const [ticker, setTicker] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.post(
        "https://t2ufylwlr9.execute-api.ap-southeast-2.amazonaws.com/dev/growth_estimate",
        { ticker }
      );
      console.log(result);
      setData(result.data);
    };
    fetchData();
  }, [ticker]);
  return (
    <div className={classes.root}>
      <TextField
        type="text"
        label="Ticker"
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => setTicker(query)}
      >
        Estimate Growth
      </Button>
      <Typography>{data}</Typography>
    </div>
  );
}

export default Chart;
