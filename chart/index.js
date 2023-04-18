const QuickChart = require('quickchart-js');

const getChart = ({ labels, data, colors, eventName}) => {
  const total = data.reduce((acc, value) => acc + parseInt(value), 0);
  const dataPercentage = data.map(value => Math.round((value / total) * 100));
  const chart = new QuickChart();
  chart.setWidth(500);
  chart.setConfig({
    type: 'doughnut',
    data: {
      datasets: [
        {
          data: dataPercentage,
          backgroundColor: colors,
          label: eventName,
        }
      ],
      labels,
    },
    options: {
      legend: {
        labels: {
          fontColor: '#000000',
        }
      },
      plugins: {
        doughnutlabel: {
          labels: [
            {
              text: total,
              font: { size: '20' },
            },
            { text: 'Total' },
          ],
        },
        datalabels: {
          formatter: (value) => (!value ? null : value + '%'),
          color: '#fff',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: 5,
        },
      },
    },
  });
  return chart;
};

module.exports = { getChart };