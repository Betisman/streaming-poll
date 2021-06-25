const data = {
  labels: [
    'Baumann',
    'Lucas',
  ],
  datasets: [{
    data: [0, 0],
    backgroundColor: [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
    ]
  }]
};

const config = {
  type: 'pie',
  data: data,
  options: {
    animation: false,
  },
};

const myChart = new Chart(
  document.getElementById('myChart'),
  config
);

const myInterval = setInterval(() => {
  fetch('/scores')
    .then(res => res.json())
    .then(data => {
      myChart.data.datasets[0].data = data;
      myChart.update();
    })
    .catch(() => clearInterval(myInterval))
}, 1500);
