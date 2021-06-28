const express = require('express');
const cors = require('cors');

const app = express();

const BAUMANN_USER = process.env.BAUMANN_USER || 'baumann';
const LUCAS_USER = process.env.LUCAS_USER || 'lucas';
const PORT = process.env.PORT || 3000;

let results = [1, 1];
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get('/', (req, res) => {
  return res.send('CSS Battle API');
});
app.get('/scores', (req, res) => {
  res.json(results);
});

app.post('/vote', (req, res) => {
  if (req.body.text.includes(BAUMANN_USER)) {
    results[0] = results[0] + 1;
  }
  if (req.body.text.includes(LUCAS_USER)) {
    results[1] = results[1] + 1;
  }
  return res.send('Tu voto fue registrado');
});

app.get('/reset', (req, res) => {
  results = [1, 1];
  return res.json({ success: true });
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
