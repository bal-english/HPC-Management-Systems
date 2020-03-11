import express from 'express';

const app = express();

app.get('/', (request, response) => {
  console.log("asdf");
  response.send('Hello World!');
});

app.listen(80);
