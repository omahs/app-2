import React,{useRef} from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export type AreaProps = {
  /** chart input data [Date, Value] */
  data: number[][];
} & HighchartsReact.Props;

export const AreaChart: React.FC<AreaProps> = ({data, ...props}) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  const options: Highcharts.Options = {
    chart: {
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'Manrope'
      }
    },
    title: {
      style: {
        display: 'none'
      }
    },
    yAxis: {
      title: {
        style: {
          display: 'none'
        }
      },
      gridLineWidth: 0, // remove grid line
      labels: {
        enabled:false, // disable Axis label
      },
      lineWidth: 0,
      minorGridLineWidth: 0,
    },
    xAxis: {
      type: 'datetime',
      gridLineWidth: 0,
      alignTicks:false,
      labels: {
        enabled:false, 
      },
      lineWidth: 0,
      minorGridLineWidth: 0,
      tickWidth: 0, // remove xAxis tick lines
    },
    legend: {
      enabled: false, // remove legend
    },
    plotOptions: {
      areaspline: {
        fillColor: {
          linearGradient: { // defining gradient direction
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1
          },
          stops: [
            [0, '#003BF516'],
            [1, '#003BF500']
          ]
        },
        lineWidth: 2, // defining series width
        states: { // defining different views based on events(hover,inactive,normal,select)
          hover: {
            lineWidth: 2 // need to be because default is 1 px
          }
        },
        threshold: null // controlling chart bottom area
      }
    },
    series: [{
      name:'Price',
      marker: { 
        enabled: false // remove series points
      },
      color:'#003BF5',
      type: 'areaspline',
      data: data
    }],
    credits: {  // remove highchart credits label
      enabled: false
    }
  };

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      ref={chartComponentRef}
      {...props}
    />
  );
}