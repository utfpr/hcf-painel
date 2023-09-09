import React, { Component } from 'react';


export default class DashboardScreen extends Component {

    state = {
        collapsed: false,
    };

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };

    render() {
        return (
            <div>Dashboard</div>
        );
    }
}
