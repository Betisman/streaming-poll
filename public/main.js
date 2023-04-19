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
