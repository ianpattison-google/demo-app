// supertest gives us access to HTTP requests & responses
const request = require('supertest');

// get our server app for the correct routes
const app = require('../app');

// set up the test data
const todo1 = { id:1, text: "Learn React", isCompleted: false };
const todo2 = { id:2, text: "Have lunch", isCompleted: false };
const todo3 = { id:3, text: "Write React app", isCompleted: false };
const todo3_updated = { id:3, text: "Write React app", isCompleted: true };
const todo4 = { id:267, text: "Finish work", isCompleted: false };

// initial data
beforeAll(async () => {
    await request(app).post('/todos').send(todo1);
    await request(app).post('/todos').send(todo2);
    await request(app).post('/todos').send(todo3);
})

// tear down
afterAll(async () => {
    await request(app).delete('/todos/2');
    await request(app).delete('/todos/3');
    await request(app).delete('/todos/267');
})

// test the basic response of the app - GET '/' returns 'Hello!'
describe('GET /', () => {
    test('It should respond with Hello!', async () => {
        const response = await request(app).get('/');
        expect(response.body).toBe('Hello!');
        expect(response.statusCode).toBe(200);
    });
});

// test GET '/todos' returns three entries
describe('GET /todos', () => {
    test('It should respond with three entries', async () => {
        const response = await request(app).get('/todos');
        expect(response.body.length).toBe(3);
        expect(response.body[0]).toHaveProperty('text');
        expect(response.body[0].text).toBe('Learn React');
        expect(response.statusCode).toBe(200);
    });
});

// test GET '/todos/:id' returns the correct entry
describe('GET /todos/2', () => {
    test('It should respond with one entry', async () => {
        const response = await request(app).get('/todos/2');
        expect(response.body).toHaveProperty('text');
        expect(response.body.text).toBe('Have lunch');
        expect(response.statusCode).toBe(200);
    });
});

// test GET '/todos/:id' returns 404 for an incorrect entry
describe('GET /todos/999', () => {
    test('It should respond with 404 not found', async () => {
        const response = await request(app).get('/todos/999');
        expect(response.statusCode).toBe(404);
    });
});

// test POST 'todos' adds a new entry
describe('POST /todos', () => {
    test('It should respond with four entries', async () => {
        const response1 = await request(app).post('/todos').send(todo4);
        expect(response1.statusCode).toBe(200);
        const response2 = await request(app).get('/todos');
        expect(response2.body.length).toBe(4);
        expect(response2.body[3].text).toBe('Finish work');
        expect(response2.statusCode).toBe(200);
    });
});

// test PUT 'todos/:id' updates an entry
describe('PUT /todos/3', () => {
    test('It should respond with the updated entry', async () => {
        const response1 = await request(app).put('/todos/3').send(todo3_updated);
        expect(response1.statusCode).toBe(200);
        const response2 = await request(app).get('/todos/3');
        expect(response2.body.text).toBe('Write React app');
        expect(response2.body.isCompleted).toBeTruthy();
        expect(response2.statusCode).toBe(200);
    });
});

// test DELETE 'todos/:id' removes an entry
describe('DELETE /todos/1', () => {
    test('It should respond with 404 for the removed entry', async () => {
        const response1 = await request(app).delete('/todos/1');
        expect(response1.statusCode).toBe(200);
        const response2 = await request(app).get('/todos/1');
        expect(response2.statusCode).toBe(404);
    });
});


