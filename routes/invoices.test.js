// Tell Node that we're in test "mode"
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const { createData } = require('../_test-common');
const db = require('../db');



beforeEach(createData);


afterAll(async () => {
    await db.end()
})

describe('GET /invoices', () => {
    test('It should return a list of invoices', async () => {
        const res = await request(app).get('/invoices');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ "invoices": [
            {id: 1, comp_code: "apple"},
            {id: 2, comp_code: "apple"},
            {id: 3, comp_code: "ibm"},
        ]});
    })
})

describe('GET /1', () => {
    test('It should return infor of the invoice', async () => {
        const res = await request(app).get('/invoices/1');
        expect(res.body).toEqual({
            invoice: {
                id: '1',
                amt: 100,
                add_date: '2018-01-01T08:00:00.000Z',
                paid: false,
                paid_date: null,
                company: {
                    code: 'apple',
                    name: 'Apple',
                    description: 'Maker of OSX.'
                }
            }
        })
    })
    test('It should return 404', async () => {
        const res = await request(app).get('/invoices/5');
        expect(res.status).toEqual(404);
    })
})

describe('POST /', () => {
    test('It should add an invocie', async () => {
        const res = await request(app).post('/invoices').send({ amt: 500, comp_code: 'apple' });
        console.log('res.body', res.body)
        
        expect(res.body).toEqual({
            invoice: {
                id: 4,
                comp_code: 'apple',
                amt: 500,
                add_date: expect.any(String),
                paid: false,
                paid_date: null
            }
        })
    })
})

describe('PUT /1', () => {
    test('It should update the invoice', async () => {
        const res = await request(app).put('/invoices/1').send({ amt: 500, paid: false });

        expect(res.body).toEqual({
            invoice: {
                id: 1,
                comp_code: 'apple',
                paid: false,
                amt: 500,
                add_date: expect.any(String),
                paid_date: null
            }
        })
    })
    test('It should return 404', async () => {
        const res = await request(app).put('/invoices/100').send({});

        expect(res.status).toEqual(404)
    })
})

describe('DELETE /1', () => {
    test('it should delete the invoice', async () => {
        const res = await request(app).delete('/invoices/1');

        expect(res.body).toEqual({ status: 'deleted' });
    })
    test('it should return 404', async () => {
        const res = await request(app).delete('/invoices/900');

        expect(res.status).toEqual(404);
    })
})

