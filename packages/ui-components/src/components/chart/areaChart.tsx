import React,{useRef} from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const options: Highcharts.Options = {
    chart: {
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'Manrope'
      }
    },
    title: {
        text: '',
        style: {
            display: 'none'
        }
    },
    yAxis: {
      title: {
          text: '',
          style: {
              display: 'none'
          }
      },
      gridLineWidth: 0,
      labels: {
        enabled:false,
      },
      lineWidth: 0,
      minorGridLineWidth: 0,
    },
    xAxis: {
      gridLineWidth: 0,
      alignTicks:false,
      labels: {
          style: {
              color: 'transparent'
          }
      },
      lineWidth: 0,
      minorGridLineWidth: 0,
      tickWidth: 0,
    },
    legend: {
      enabled: false,
    },
    plotOptions: {
      areaspline: {
          fillColor: {
              linearGradient: {
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
          marker: {
              radius: 2
          },
          lineWidth: 2,
          states: {
              hover: {
                  lineWidth: 2
              }
          },
          threshold: null
      }
    },
    series: [{
      marker: {
        enabled: false
      },
      color:'#003BF5',
      type: 'areaspline',
      data: [1, 2, 1.5, 4, 3.25, 6, 2.11, 7, 1, 2, 1.5, 4, 5, 6, 2.11, 7]
    }],
    credits: {
      enabled: false
    }
}

export const AreaChart = (props: HighchartsReact.Props) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={options}
      ref={chartComponentRef}
      {...props}
    />
  );
}