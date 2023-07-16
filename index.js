const express = require('express');
const cors = require('cors');
const util = require('./helper/util.js');

const requestLogger = (req, res, next) => {
  console.log('Method: ', req.method);
  console.log('Path: ', req.path);
  console.log('Body: ', req.body);
  console.log('---');
  next();
};

const unknowEndpoint = (req, res) => {
  res.status(404)
    .send({ error: 'unknow endpoint'});
};

const app = express();
app.use(express.json());
app.use(requestLogger);
app.use(cors());
app.use(express.static('build'));

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
];

app.get('/', (req, res) => {
  res.send('<h1>~Hello World!</h1>');
});

app.get('/api/notes', (req, res) => {
  res.json(notes);
});

app.get('/api/notes/:id', (req, res) => {
  const id = Number(req.params.id);
  const note = notes.find(n => n.id === id);

  if (note) {
    res.json(note);
  } else {
    res.status(404).end();
  }
});

app.delete('/api/notes/:id', (req, res) => {
  const id = Number(req.params.id);
  notes = notes.filter(n => n.id !== id);

  res.status(204).end();
});

app.post('/api/notes', (req, res) => {
  const body = req.body;

  if (!body.content) {
    return res.status(400)
      .json({ error: 'content missing' });
  }

  const note = {
    id: util.generateId(notes),
    content: body.content,
    important: body.important || false
  };

  notes = notes.concat(note);

  res.json(body);
});

app.use(unknowEndpoint);

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});