import { Component } from 'react'

export default class DashboardScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            collapsed: false
        }
    }

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed
        })
    }

    render() {
        return (
            <div>Dashboard</div>
        )
    }
}
