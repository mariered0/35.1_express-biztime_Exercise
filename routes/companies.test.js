//tests for companies


// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const { createData } = require('../_test-common');
const db = require('../db');


//Here, the function, createData to create data from _test-common.js is is run before each test to prepare data for testing. It will be used for both companies and invoices tables. Deleting process is also included.
beforeEach(createData);


afterAll(async () => {
    await db.end()
})

describe('GET /', () => {
    test('It should return a list of companies', async () => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ "companies": [
            {code: "apple", name: "Apple"},
            {code: "ibm", name: "IBM"}

        ]})
    })
});


describe('GET /apple', () => {
    test('It should return info of the company', async () => {
        const res = await request(app).get('/companies/apple');
        expect(res.body).toEqual({
            company: {
                code: "apple",
                name: "Apple", 
                description: "Maker of OSX.",
                invoices: [1,2]
            }
        })
    })
    test('It should return 404 code', async () => {
        const res = await request(app).get('/companies/abc');
        expect(res.status).toEqual(404);
    } )
})


describe('POST /', () => {
    test('It should add a company', async () => {
        const res = await request(app).post('/companies').send({name: 'Test', description: 'Test test test'});

        expect(res.body).toEqual({
            company: {
                code: 'test',
                name: 'Test',
                description: 'Test test test'
            }
        })
        
    })
})

describe('PUT /apple', () => {
    test('It should update the company info', async () => {
        const res = await request(app).put('/companies/apple').send({ name: "Applee", description: "Updated" });

        expect(res.body).toEqual({
            company: {
                code: 'apple',
                name: 'Applee',
                description: 'Updated'
            }
        })
    })
    test('It should return 404', async () => {
        const res = await request(app).put('/companies/app').send({});

        expect(res.status).toEqual(404);
    })
})

describe('DELETE /', () => {
    test('It should delete the company', async () => {
        const res = await request(app).delete('/companies/apple');

        expect(res.body).toEqual({status: 'deleted'});
    })
    test('It should return 404', async () => {
        const res = await request(app).delete('/companies/app');

        expect(res.status).toEqual(404);
    })
    
})



