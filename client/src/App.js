import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import { Paper } from "@material-ui/core";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import blue from "@material-ui/core/colors/blue";
import { makeStyles } from "@material-ui/core/styles";

import logo from "./logo.svg";
import "./App.css";
import Chart from "./Components/Chart";

const theme = createMuiTheme({
  palette: {
    primary: blue
  },
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
                Summary
              </Typography>
              <Typography variant="h6" align="left" gutterBottom>
                Text text textText text textText text textText text text Text
                text textText text textText text text Text text textText text
                textText text textText text text Text text textText text
                textText text text
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
                Summary
              </Typography>
              <Typography variant="h6" align="left" gutterBottom>
                Text text textText text textText text textText text text Text
                text textText text textText text text Text text textText text
                textText text textText text text Text text textText text
                textText text text
              </Typography>
            </Paper>
          </Grid>
        </Container>
      </ThemeProvider>
    </div>
  );
}

export default App;
