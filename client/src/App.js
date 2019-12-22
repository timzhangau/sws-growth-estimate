import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import { Paper } from "@material-ui/core";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";

import "./App.css";
import Chart from "./Components/Chart";

const theme = createMuiTheme({
  root: {
    margin: 10,
    padding: 10
  }
});

const useStyles = makeStyles(theme => ({
  textBlock: {
    padding: theme.spacing(2),
    margin: theme.spacing(5)
  }
}));

function App() {
  const classes = useStyles();

  return (
    <div className="App">
      <header>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h5">Growth Analytics</Typography>
          </Toolbar>
        </AppBar>
      </header>
      <ThemeProvider theme={theme}>
        <Container maxWidth="lg" spacing={5}>
          <Grid item xs={12}>
            <Paper className={classes.textBlock} mt={5}>
              <Typography variant="h4" align="left" gutterBottom>
                Estimate Growth for Loss Making Companies
              </Typography>
              <Typography variant="h6" align="left" gutterBottom>
                Generally there are a few basic ways to assess company growth
                potential: <br />
                1. Look at analyst estimate <br />
                2. Extrapolating from the historical growth rate <br />
                3. Decompose and derive growth from fundamentals <br />
                4. Forecast from company's management team <br />
                <br />
                For loss making companies with no analyst coverage, the options
                are rather limited. No consensus data is available. Simple
                calculation of historical earnings growth could be misleading if
                the starting data point is negative. Any fundamental
                decomposition with negative earnings is not meaningful either.
                The management forecast is not always available and it requires
                the natural language process to extract the information on a
                large scale.
                <br />
                <br />
                To estimate growth potential of loss making companies, we have
                to move up the income statement and look at growth in EBITDA or
                revenues. In general the revenue growth tends to be more
                persistent and less volatile than earnings growth and is much
                less likely to be swayed by accounting choices.
                <br />
                <br />
                While past growth is not always a good indicator of future
                growth, it still provides valuable information for the companies
                with no analyst coverage. Here for simplicity, I'm using the
                linear regression model to project the future revenue of loss
                making companies.
                <br />
                <br />I use the raw revenue data from CIQ. This data point is
                the revenue for the last twelve months and available every
                quarter. Looking at some sample data, most of the history is
                back to 2013, with about 6 years data. As the length of period
                is not long enough to be impacted by the structural changes in
                general, all the available data points will be included to find
                the line of best fit. The quarterly frequency also helps to
                smooth out the result.
                <br />
                <br />
                The industry and market averages are also used to project the
                revenue for comparison.
                <br />
                <br />
                This approach based on historical data is subject to some
                limitations. First, we need sufficient data points, at least 3
                to 5 years, to regress the history. It is also less reliable for
                firms with volatile growth rates. The estimate from these
                historical data should only be used as the basis for projections
                in the near future.
                <br />
                <br />
                To improve the estimate result, we could look further into the
                drivers of the revenue if additional data points are available.
                For example, trying to forecast the number of subscribers for
                companies with paid subscription pricing model. We could also
                include the cost related data points in combination to provide
                some insight on the net income for loss making companies.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.textBlock}>
              <Chart />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper className={classes.textBlock}>
              <Typography variant="h4" align="left" gutterBottom>
                Notes to Investors
              </Typography>
              <Typography variant="h6" align="left" gutterBottom>
                When the company has negative earnings, the regular calculated
                earnings growth rate can be misleading. Say Company Unicorn lost
                $10mil 1 year ago, but its product made a big progress in the
                last 12 months and it finally broke even this year. The
                traditional growth rate calculation would give you -100%.
                <br />
                <br />
                ($0 - (-$10 mil)) / ( -$10 mil) = -100%
                <br />
                <br />
                That's not right. We have an earnings improvement, but the
                formula tells you a different story.
                <br />
                <br />
                Greater challenge is posed to loss making companies with no
                analyst coverage. But we can still find valuable information
                about the company growth potential using linear regression
                model. The line of best fit is plotted against the historical
                revenue data and then projected to the future. The slope of the
                line represents the change of revenue for each period. This can
                be compared to the industry and market average revenue growth.
                The steeper of the line, the higher the growth rate.
              </Typography>
            </Paper>
          </Grid>
        </Container>
      </ThemeProvider>
    </div>
  );
}

export default App;
