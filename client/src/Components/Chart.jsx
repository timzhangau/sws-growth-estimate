import React, { useState, useEffect } from "react";
import axios from "axios";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    "& > *": {
      margin: theme.spacing(2)
    }
  }
}));

const initData = { name: "", growth_analytics: { total_rev: { df: "" } } };

function Chart() {
  const classes = useStyles();

  const [ticker, setTicker] = useState("AIM:BBSN");
  const [query, setQuery] = useState("AIM:BBSN");
  const [data, setData] = useState(initData);
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
      <Typography variant="h6">{data.name}</Typography>
      <ResponsiveContainer width="100%" minHeight={500}>
        <ComposedChart
          width={500}
          height={400}
          data={data.growth_analytics.total_rev.df}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
          }}
        >
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area
            name="Actual Revenue"
            type="monotone"
            dataKey="value"
            fill="#8884d8"
            stroke="#8884d8"
          />
          <Line
            name="Predicted Revenue"
            type="monotone"
            dataKey="prediction"
            stroke="#ff7300"
            dot={false}
          />
          <Line
            name="Industry Average"
            type="monotone"
            dataKey="industry_avg"
            stroke="#7deb2f"
            dot={false}
          />
          <Line
            name="Market Average"
            type="monotone"
            dataKey="market_avg"
            stroke="#0518a6"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Chart;
