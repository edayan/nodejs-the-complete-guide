const http = require('http');
const express = require('express');

const app = express();

app.use('/users', (req, res, next) => {
  res.send('<h1>hello users</h1>');
});

app.use('/', (req, res, next) => {
  res.send('<h1>hello from express</h1>');
});

app.listen(3000);
