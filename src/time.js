import React, { Component } from "react";

export default class Time extends Component {
    constructor(props) {
        super(props);
        this.state = { time: "" };
    }
    componentDidMount() {
        setInterval(() => {
            this.setState({ time: new Date().toLocaleString() });
        },1000);
    }

    render() {
        let { customClass } = this.props
        let { time } = this.state;
        return (
            <div className={`${customClass}`}>{time}</div>
        );
    }
}
