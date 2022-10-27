//Routes for industries of biztime

const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

//GET /industries - show all industries registered
router.get('/', async (req, res, next) => {
    try{
        const results = await db.query(`
        SELECT i.industry, c.code
        FROM industries AS i
        LEFT JOIN companies_industries AS ci
        ON ci.ind_code = i.code
        LEFT JOIN companies AS c
        ON c.code = ci.comp_code`);

        return res.json({ industries: results.rows })
    } catch(e){
        return next(e);
    }
})

//POST /industries - add an industry
router.post('/', async (req, res, next) => {
    try{
        const { code, industry } = req.body;
        const results = await db.query('INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING *', [code, industry]);
        return res.status(201).json({ industry: results.rows[0] })
    }catch(e){
        return next (e);
    }
})

//POST /industries/:code - associate company and industry
router.post('/:code', async (req, res, next) => {
    try{
        const { code } = req.params;
        const { comp_code } = req.body;
        const results = await db.query('INSERT INTO companies_industries (comp_code, ind_code) VALUES ($1, $2) RETURNING *', [comp_code, code]);
        return res.status(201).json({ status: "associated" })
    }catch(e){
        next(e)
    }
})


module.exports = router;
