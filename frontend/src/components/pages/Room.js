import React, { Component } from "react";
import { Grid, Button, Typography } from '@material-ui/core'
import { Link } from 'react-router-dom'

export default class Room extends Component {
    constructor(props) {
        super (props);
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false
        };
        this.roomCode = this.props.match.params.roomCode;
        this.getRoomDetails();
        this.leaveRoom = this.leaveRoom.bind(this);
    }

    getRoomDetails() {
        fetch('/api/get-room' + '?code=' + this.roomCode).then(
            // (response) => response.json()
            (response) => {
                if (!response){
                    console.log('response here: ', response)
                    console.log('props here: ', this.props)
                    this.props.leaveRoomCallBack();
                    this.props.history.push('/');
                }
                console.log('response here: ', response)
                console.log('props here: ', this.props)
                return response.json()
            }
        ).then(
            (data) => {
                this.setState({
                    votesToSkip: data.votes_to_skip,
                    guestCanPause: data.guest_can_pause,
                    isHost: data.host
                })
            }
        )
    }

    leaveRoom() {
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        }
        fetch('/api/leave-room', requestOptions).then(
            (_response) => {
                this.props.leaveRoomCallBack();
                this.props.history.push('/');
            }
        )
    }

    render() {
        return <Grid container spacing={1}>
            <Grid item xs={12} align='center'>
                <Typography variant="h4" component="h4">
                    Code: {this.roomCode}
                </Typography>
            </Grid>
            <Grid item xs={12} align='center'>
                <Typography variant="h4" component="h4">
                    Votes to Skip: {this.state.votesToSkip}
                </Typography>
            </Grid>
            <Grid item xs={12} align='center'>
                <Typography variant="h4" component="h4">
                    Guest Can Pause: {this.state.guestCanPause.toString()}
                </Typography>
            </Grid>
            <Grid item xs={12} align='center'>
                <Typography variant="h4" component="h4">
                    Host: {this.state.isHost}
                </Typography>
            </Grid>
            <Grid item xs={12} align='center'>
                <Button variant='contained' color='secondary' onClick={this.leaveRoom}>
                    Leave Room
                </Button>
            </Grid>
        </Grid>
    }
}
