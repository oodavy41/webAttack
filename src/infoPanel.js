import React, { Component } from "react";
import style from "./infoPanel.css"
export default class Panel extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let { data } = this.props;
    let { type, country,sender, senderIP, aim, aimIP, time } = data;
    return (<div className={`${style.panel}`}>
      <div className={`${style.path}`}>{`${senderIP}(${country} ${sender}) -> ${aimIP}(中国 ${aim})`}</div>
      <div className={`${style.type}`}>类型: {type}</div>
      <div className={`${style.time}`}>时间: {time}</div>
    </div>);
  }
}
