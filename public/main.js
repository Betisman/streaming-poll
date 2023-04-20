const TEAMS = {
  SMILING_DOG: {
    label: '🗡️ Smiling Dog 🗡️',
  },
  DEBUGGING_DEMONS: {
    label: '🛡️ Debugging Demons 🛡️',
  },
  undefined: 'just a minute...'
}

const data = {
  datasets: [{
    data: [1, 1],
    backgroundColor: [
      'rgb(75, 192, 192)',
      'rgb(255, 99, 132)',
    ],
    borderWidth: 2,
    borderColor: 'rgb(255, 255, 255)',
  }]
};


const doughnutlabel = total => ({
  labels: [
    {
      text: total,
      font: { size: 30, family: 'luminari' },
    },
    {
      text: 'Total votes',
      font: { size: 20, family: 'luminari' },
      color: '#333',
    },
  ],
});

const formatFloat = (value, decimals) => (value % 1 !== 0 ? parseFloat(value).toFixed(decimals) : value);
const getTotal = myDoughnutChart => myDoughnutChart.config.data.datasets[0].data.reduce((acc, value) => acc + parseInt(value), 0);
const getTotalFromContext = context => context.dataset.data.reduce((acc, value) => acc + parseInt(value), 0);
const getLabelPercentage = (value, context) => (!value ? null : `${value} vote${parseInt(value) === 1 ? '' : 's'}\n${formatFloat(parseFloat(value * 100 / getTotalFromContext(context)), 2)}%`);

const config = {
  type: 'doughnut',
  data: data,
  options: {
    animation: false,
    plugins: {
      legend: false,
      datalabels: {
        borderColor: '#ababab',
        borderWidth: 2,
        borderRadius: 5,
        color: 'black',
        backgroundColor: 'white',
        labels: {
          name: {
            align: 'top',
            font: { size: 10, family: 'luminari' },
            formatter: (value, context) => TEAMS[context.chart.data.labels[context.dataIndex]].label,
          },
          value: {
            align: 'bottom',
            font: { size: 20, family: 'luminari' },
            formatter: getLabelPercentage,
          }
        }
      },
      doughnutlabel: {
        labels: [
          {
            text: getTotal,
            font: { size: 50, family: 'luminari' },
          },
          {
            text: 'Total votes',
            font: { size: 30, family: 'luminari' },
            color: '#333',
          },
        ],
      },
    },
  },
};

Chart.register(ChartDataLabels);
Chart.register(DoughnutLabel);
const myChart = new Chart(
  document.getElementById('myChart'),
  config
);

const myInterval = setInterval(() => {
  fetch('/scores')
    .then(res => res.json())
    .then(({ labels, data, colors }) => {
      myChart.data = {
        datasets: [{
          data,
          backgroundColor: colors,
        }],
        labels,
      };
      myChart.update();
    })
    .catch(() => clearInterval(myInterval))
}, 1500);
