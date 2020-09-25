const express = require('express');
const cors = require('cors');
const app = express();

const { Sequelize, DataTypes } = require('sequelize');
// const sequelize = new Sequelize('sqlite::memory');
const sequelize = new Sequelize('task_server', 'root', 'password', {
    dialect: 'mysql',
    // host: '/cloudsql/ianpattison-demo-app:europe-west1:task-server', 
    dialectOptions: {
        socketPath: '/cloudsql/ianpattison-demo-app:europe-west1:task-server',
    }
});

// define the ORM model
const Todo = sequelize.define('Todo', { 
    id:          { type: DataTypes.INTEGER, allowNull: false, primaryKey: true},
    text:        { type: DataTypes.STRING,  allowNull: false},
    isCompleted: { type: DataTypes.BOOLEAN, allowNull: false}
});

// set up test data if required
// check the size of the collection 
Todo.sync()
.then(p => Todo.count())
.then(count => {
    console.log(count);
    if (count == 0) {
        Todo.create({ id:1, text: "Learn React", isCompleted: false });
        Todo.create({ id:2, text: "Have lunch", isCompleted: false });
        Todo.create({ id:3, text: "Write React app", isCompleted: false });
    }
})

app.use(cors());
app.use(express.json());

// GET a todo item by its ID value
app.get('/todos/:id', (req, res) => {
    Todo.findByPk(parseInt(req.params.id))
    .then(todo => {
        if (todo === null) {
            res.sendStatus(404);
        } else {
            res.json(todo);
        }
    })
})

// GET all todo items
app.get('/todos', (req, res) => {
    const todos = [];
    Todo.findAll()
    .then(result => {
        result.forEach(todo => {
            todos.push(todo);
        })
        res.json(todos);
    })
})

// GET default behaviour
app.get('/', (req, res) => {
    return res.json('Hello!');
});

// POST a new item
app.post('/todos', (req, res) => {
    const { id, text, isCompleted } = req.body;

    // check for any required fields
    if (!id || !text) { return res.status(400).send('One or more required fields are missing'); }

    // add the new todo item
    const newTodo = { id, text, isCompleted };
    Todo.create(newTodo)
    .then(p => res.sendStatus(200));
})

// PUT an item - updates existing
app.put('/todos/:id', (req, res) => {
    const { id, text, isCompleted } = req.body;

    // check for any required fields
    if (!id || !text) { return res.status(400).send('One or more required fields are missing'); }

    // update the todo item
    const updatedTodo = { id, text, isCompleted };
    Todo.findByPk(parseInt(req.params.id))
    .then(todo => todo.update(updatedTodo))
    .then(p => res.sendStatus(200));

})

// DELETE an item
app.delete('/todos/:id', (req, res) => {
    Todo.findByPk(parseInt(req.params.id))
    .then(todo => todo.destroy())
    .then(p => res.sendStatus(200));
})

// we need to set up an app.js and server.js in this way so that we can test it with Jest
module.exports = app;