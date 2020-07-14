
import echarts from "echarts/lib/echarts";
import "echarts/lib/chart/line";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/title";
import "echarts/lib/component/legend";

import React, { Component } from "react";

export default class EchartEle extends Component {
    myChart = echarts.init(this.echartDiv);
    return <div id="echartDiv"></div>;
}
