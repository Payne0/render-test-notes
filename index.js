require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Note = require('./models/note');

const requestLogger = (req, res, next) => {
  console.log('Method: ', req.method);
  console.log('Path: ', req.path);
  console.log('Body: ', req.body);
  console.log('---');
  next();
};

// middleware
const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(express.static('build'));

app.get('/', (req, res) => {
  res.send('<h1>~Hello World!</h1>');
});

app.get('/api/notes', (req, res) => {
  Note.find({})
    .then(notes => {
      console.log('all notes: ', notes);
      res.json(notes);
    })
    .catch(error => {
      console.log('error getting notes: ', error);
      res.status(500).end();
    });
});

app.get('/api/notes/:id', (req, res, next) => {
  Note.findById(req.params.id)
    .then(note => {
      if (note) {
        console.log('findById: ', note);
        res.json(note);
      } else {
        res.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.post('/api/notes', (req, res, next) => {
  const body = req.body;

  if (!body.content) {
    return res.status(400)
      .json({ error: 'content missing' });
  }

  const note = new Note({
    content: body.content,
    important: body.important || false
  });

  note.save()
    .then(note => {
      console.log('create note: ', note);
      res.json(note);
    })
    .catch(error => next(error));
});

app.put('/api/notes/:id', (req, res, next) => {
  const { content, important } = req.body;

  Note.findByIdAndUpdate(req.params.id,
    { content, important },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(note => {
      res.json(note);
    })
    .catch(error => next(error));
});

app.delete('/api/notes/:id', (req, res, next) => {
  Note.findByIdAndRemove(req.params.id)
    .then((result) => {
      console.log('delet result: ', result);
      res.status(204).end();
    })
    .catch(error => next(error));
});

const unknowEndpoint = (req, res) => {
  res.status(404)
    .send({ error: 'unknow endpoint' });
};

const errorHandler = (error, req, res, next) => {
  console.log(error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

// middleware
app.use(unknowEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});