//Routes for companies of biztime

const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");


//GET /companies
router.get('/', async (req, res, next) => {
    try{
        const results = await db.query(`SELECT code, name FROM companies`);
        return res.json({ companies: results.rows })
    } catch(e){
        return next(e);
    }
})

//GET /companies/[code]
router.get('/:code', async (req, res, next) => {
    try{
        const { code } = req.params;
        const results = await db.query('SELECT * FROM companies JOIN invoices on (invoices.comp_code=companies.code) WHERE code = $1', [code]);
        
        if (results.rows.length === 0){
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        }

        const { name, description, id, comp_code, amt, paid, add_date, paid_date } = results.rows[0];
        
        return res.json({company: { code, name, description }, invoices: [id, comp_code, amt, paid, add_date, paid_date] });
    }catch(e){
        return next(e);
    }
})

//POST /companies/[code]
router.post('/:code', async (req, res, next) => {
    try{
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING *', [code, name, description])
        return res.status(201).json({ company: results.rows[0] })
    }catch(e){
        return next(e);
    }
})

//PUT /companies/[code]
router.put('/:code', async (req, res, next) => {
    try{
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING *', [name, description, code])
        if (results.rows.length === 0){
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        }
        return res.json({ company: results.rows });
    }catch(e){
        return next(e);
    }
})

//DELETE /companies/[code]
router.delete('/:code', async (req, res, next) => {
    try{
        const results = db.query('DELETE FROM companies WHERE code = $1', [req.params.code])
        return res.send({status: "deleted"})
    }catch(e){
        next(e)
    }
})



module.exports = router;