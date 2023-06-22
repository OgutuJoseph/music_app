import React, { Component } from "react";
// import Button from '@material-ui/core/Button';
// import Grid from '@material-ui/core/Grid';
// import Typography from '@material-ui/core/Typography';
import { Button, Grid, Typography, TextField, FormHelperText, FormControl, FormControlLabel, Radio, RadioGroup, Collapse } from "@material-ui/core";
import { Alert } from '@material-ui/lab'
import { Link } from "react-router-dom";

export default class CreateRoomPage extends Component  {
    // defaultVotes = 2;

    static defaultProps = {
        roomCode: null,
        guestCanPause: true,
        votesToSkip: 2,
        update: false,
        updateCallback: () => { }
    }

    constructor(props) {
        super (props)
        this.state = {
            guestCanPause: this.props.guestCanPause,
            votesToSkip: this.props.votesToSkip,
            successMsg: "",
            errorMsg: ""
        };

        this.handleVotesChange = this.handleVotesChange.bind(this);
        this.handleGuestCanPauseChange = this.handleGuestCanPauseChange.bind(this);
        this.handleCreateRoom = this.handleCreateRoom.bind(this);
        this.handleUpdateRoom = this.handleUpdateRoom.bind(this);
    }

    handleVotesChange(e) {
        this.setState({
            votesToSkip: e.target.value,
        });
    };

    handleGuestCanPauseChange(e) {
        this.setState({
            guestCanPause: e.target.value === "true" ? true : false,
        });
    };

    renderCreateButtons() {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Button color="primary" variant="contained" onClick={this.handleCreateRoom}>Create a Room</Button>
                </Grid>
                <hr />
                <Grid item xs={12} align="center">
                    <Button color="info" variant="contained" to="/" component={Link}>Back</Button>
                </Grid>
            </Grid>
        )
    };

    renderUpdateButtons() {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Button color="primary" variant="contained" onClick={this.handleUpdateRoom}>Update Details</Button>
                </Grid>
                <hr />
            </Grid>
        )
    };

    handleCreateRoom() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                guest_can_pause: this.state.guestCanPause,
                votes_to_skip: this.state.votesToSkip,
            })
        }
        fetch('/api/create-room', requestOptions).then(
            (response) => response.json()
        ).then(
            // (data) => console.log('data returned: ', data)
            (data) => this.props.history.push('/room/' + data.code)
        )
    };

    handleUpdateRoom() {
        const requestOptions = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: this.props.roomCode,
                guest_can_pause: this.state.guestCanPause,
                votes_to_skip: this.state.votesToSkip,
            })
        }
        fetch('/api/update-room', requestOptions).then(
            (response) => {
                if (response.ok) {
                    this.setState({
                        successMsg : "Room updated successfully."
                    })
                } else {
                    this.setState({
                        errorMsg : "Failed to update room."
                    })
                }
                this.props.updateCallback();
            }
        )
    };

    render() {
        const title = this.props.update ? "Update Room Details.": "Create Room" 

        return <Grid container spacing={1}> 
            <Grid item xs={12} align="center">
                <Collapse in={this.state.errorMsg != "" || this.state.successMsg != ""}>
                    {
                        this.state.successMsg != "" 
                        ? (<Alert severity="success" onClose={() => { this.setState({ successMsg: "" }) }}>{this.state.successMsg}</Alert>) 
                        : (<Alert severity="error" onClose={() => { this.setState({ errorMsg: "" }) }}>{this.state.errorMsg}</Alert>)
                    }
                </Collapse>
            </Grid>
            <Grid item xs={12} align="center">
                <Typography component="h4" variant="h4">{title}</Typography>
            </Grid>
            <Grid item xs={12} align="center">
                <FormControl component="fieldset">
                    <FormHelperText>
                        <div align="center">Guest control of playback state</div>
                    </FormHelperText>
                    <RadioGroup row defaultValue={this.props.guestCanPause.toString()} onChange={this.handleGuestCanPauseChange}>
                        <FormControlLabel value="true" control={<Radio color="primary" />} label="Play/Pause" labelPlacement="bottom" />
                        <FormControlLabel value="false" control={<Radio color="secondary" />} label="No Control" labelPlacement="bottom" />
                    </RadioGroup>
                </FormControl>
            </Grid>
            <Grid item xs={12} align="center">
                <FormControl>
                    <TextField 
                        required={true} 
                        type="number" 
                        defaultValue={this.state.votesToSkip} 
                        inputProps={{
                            min: 1,
                            style: { textAlign: "center" }
                        }}
                        onChange={this.handleVotesChange}
                    />
                    <FormHelperText>
                        <div align="center">Votes required to skip song</div>
                    </FormHelperText>
                </FormControl>
            </Grid>
            {this.props.update ? this.renderUpdateButtons() : this.renderCreateButtons()}
        </Grid>
    }
}