const express = require('express');

const app = express();

app.use('/add-product', (req, res, next) => {
  res.send('<h1>hello add product</h1>');
});

app.use('/', (req, res, next) => {
  res.send('<h1>hello edayan from express</h1>');
});

app.listen(3000);
