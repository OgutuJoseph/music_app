import React, { Component } from "react";
import { Grid, Button, Typography } from '@material-ui/core'
import CreateRoomPage from './CreateRoomPage';

export default class Room extends Component {
    constructor(props) {
        super (props);
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false,
            showSettings: false,
            spotifyAuthenticated: false
        };
        this.roomCode = this.props.match.params.roomCode;
        this.getRoomDetails();
        this.leaveRoom = this.leaveRoom.bind(this);
        this.updateShowSettings = this.updateShowSettings.bind(this);
        this.renderSettingsButton = this.renderSettingsButton.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
        // to allow function passed as prop to work
        this.getRoomDetails = this.getRoomDetails.bind(this);
        this.authenticateSpotify = this.authenticateSpotify.bind(this);
    };

    getRoomDetails() {
        fetch('/api/get-room' + '?code=' + this.roomCode)
        .then(
            // (response) => response.json()
            (response) => {
                if (!response.ok){ 
                    // this.props.leaveRoomCallBack();
                    this.props.history.push('/');
                } 
                return response.json()
            }
        )
        .then((data) => { 
                this.setState({
                    votesToSkip: data.votes_to_skip,
                    guestCanPause: data.guest_can_pause,
                    isHost: data.host
                })
                // if (this.state.isHost) {
                //     this.authenticateSpotify()
                // }                
            }
        )
    };

    authenticateSpotify() {
        fetch('/spotify/is-authenticated')
        .then((response) => response.json())
        .then((data) => {
                this.setState({
                    spotifyAuthenticated: data.status
                })
                if (!data.status) {
                    fetch('/spotify/get-auth-url')
                    .then((response) => response.json())
                    .then((data) => {
                        window.location.replace(data.url)
                    })
                }
            }
        )
    };

    leaveRoom() {
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        };
        fetch('/api/leave-room', requestOptions).then((_response) => {
            // this.props.leaveRoomCallBack();
            this.props.history.push('/');
        })
    };

    updateShowSettings(value) {
        this.setState({
            showSettings: value
        })
    };

    renderSettingsButton() {
        return(
            <Grid item xs={12} align='center'>
                <Button variant='contained' color='info' onClick={() => this.updateShowSettings(true)}>
                    Settings
                </Button>
            </Grid>
        )
    };

    renderSettings() {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align='center'>
                    <CreateRoomPage 
                        roomCode={this.roomCode}
                        guestCanPause={this.state.guestCanPause} 
                        votesToSkip={this.state.votesToSkip}
                        update={true} 
                        updateCallback={this.getRoomDetails}
                    />
                </Grid>
                <Grid item xs={12} align='center'>
                    <Button variant='contained' color='info' onClick={() => this.updateShowSettings(false)}>
                        Close
                    </Button>
                </Grid>
            </Grid>
        )
    };

    render() {
        if (this.state.showSettings) {
            return this.renderSettings();
        }
        return <Grid container spacing={1}>
            <Grid item xs={12} align='center'>
                <Typography variant="h4" component="h4">
                    Room Code: {this.roomCode}
                </Typography>
            </Grid>
            <Grid item xs={12} align='center'>
                <Typography variant="h6" component="h6">
                    Votes to Skip: {this.state.votesToSkip}
                </Typography>
            </Grid>
            <Grid item xs={12} align='center'>
                <Typography variant="h6" component="h6">
                    Guest Can Pause: {this.state.guestCanPause.toString()}
                </Typography>
            </Grid>
            <Grid item xs={12} align='center'>
                <Typography variant="h6" component="h6">
                    Host: {this.state.isHost}
                </Typography>
            </Grid>
            {this.state.isHost ? this.renderSettingsButton() : null}
            <Grid item xs={12} align='center'>
                <Button variant='contained' color='secondary' onClick={this.leaveRoom}>
                    Leave Room
                </Button>
            </Grid>
        </Grid>
    };
}
