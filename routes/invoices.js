//Routes for invoices of biztime

const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

//GET /invocies
router.get('/', async (req, res, next) => {
    try{
        const results = await db.query(`SELECT id, comp_code FROM invoices`);
        return res.json({ invoices: results.rows });
    }catch(e) {
        return next(e);
    }
})

//GET /invoices/[id]
router.get('/:id', async (req, res, next) => {
    try{
        const { id } = req.params;
        const results = await db.query('SELECT id, amt, paid, add_date, paid_date, code, name, description FROM companies JOIN invoices ON (invoices.comp_code=companies.code) WHERE id=$1', [id])

        if (results.rows.length === 0){
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404)
        }
        //deconstructure the results to be able to form the return in a certain away
        const { amt, paid, add_date, paid_date, code, name, description } = results.rows[0];

        return res.json({invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}})
    }catch(e){
        return next(e);
    }
})

//POST /invoices
router.post('/', async (req, res, next) => {
    try{
        const { comp_code, amt } = req.body;
        const results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *', [comp_code, amt]);
        console.log('results', results.rows[0]);

        return res.status(201).json({ invoice: results.rows[0] })
    }catch(e){
        return next(e);
    }
})

//PUT /invoices/[id]
router.put('/:id', async (req, res, next) => {
    try{
        const { id } = req.params;
        const { amt, paid } = req.body;

        const currPaidStatus = await db.query('SELECT paid FROM invoices WHERE id=$1', [id]);

        if(currPaidStatus.rows.length === 0){
            throw new ExpressError(`Can't update invoice with id of ${id}`, 404);
        }

        const currPaidDate = currPaidStatus.rows[0].paid_date;

        if (!currPaidDate && paid){
            paidDate = new Date();
        }else if (!paid){
            paidDate = null
        }else {
            paidDate = currPaidDate;
        }

        const results = await db.query('UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING *', [amt, paid, paidDate, id]);

        
        return res.json({invoice: results.rows[0]})
    }catch(e){
        return next(e);
    }
})

//DELETE /invoices/[id]
router.delete('/:id', async (req, res, next) => {
    try{
        const { id } = req.params;
        const results = await db.query('DELETE FROM invoices WHERE id=$1 RETURNING id', [id]);
        if(results.rows.length === 0){
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
        }
        return res.json({ status: "deleted" });
    }catch(e){
        next(e);
    }
})


module.exports = router;