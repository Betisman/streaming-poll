const data = {
  datasets: [{
    data: [1, 1],
    backgroundColor: [
      'rgb(224, 224, 224)',
      'rgb(0, 143, 95)',
    ],
    borderWidth: 6,
    borderColor: 'rgb(26, 26, 26)',
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
