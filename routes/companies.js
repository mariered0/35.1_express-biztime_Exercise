//Routes for companies of biztime

const express = require("express");
const router = express.Router();
const db = require("../db");
const slugify = require('slugify')
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

        const compResult = await db.query(`SELECT code, name, description FROM companies WHERE code = $1`, [code]);
        const invResult = await db.query(`SELECT id FROM invoices WHERE comp_code = $1`, [code]);

        const indResult = await db.query(`
        SELECT industry
        FROM industries AS i
        LEFT JOIN companies_industries AS ci
        ON ci.ind_code = i.code
        LEFT JOIN companies AS c
        ON c.code = ci.comp_code
        WHERE ci.comp_code = $1`, [code]);
        
        if (compResult.rows.length === 0){
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        }

        const company = compResult.rows[0];
        const invoices = invResult.rows;
        const industries = indResult.rows;

        company.industries = industries.map(ind => ind.industry);
        company.invoices = invoices.map(inv => inv.id);

        return res.json({ company: company });
    }catch(e){
        return next(e);
    }
})


//POST /companies
router.post('/', async (req, res, next) => {
    try{
        const { name, description } = req.body;
        
        const code = slugify(name, {lower: true});

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
        return res.json({ company: results.rows[0] });
    }catch(e){
        return next(e);
    }
})

//DELETE /companies/[code]
router.delete('/:code', async (req, res, next) => {
    try{
        const { code } = req.params;
        const results = await db.query('DELETE FROM companies WHERE code=$1 RETURNING code', [code])
        
        if(results.rows.length === 0){
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        }
        return res.send({status: "deleted"})
    }catch(e){
        next(e)
    }
})



module.exports = router;