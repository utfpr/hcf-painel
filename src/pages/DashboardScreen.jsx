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
            // eslint-disable-next-line react-x/no-access-state-in-setstate
            collapsed: !this.state.collapsed
        })
    }

    render() {
        return (
            <div>Dashboard</div>
        )
    }
}
