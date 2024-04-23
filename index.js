const express = require("express");
const bodyParser = require("body-parser");
const mysql = require('mysql');
const url = require('url');

const app = express();
app.use(express.json())


var con = mysql.createConnection({
    host: "nodejs-technical-test.cm30rlobuoic.ap-southeast-1.rds.amazonaws.com",
    user: "admin",
    password: "NoTeDeSt^C10.6?SxwY882}",
    database: "conqtvms_dev"
})
con.connect((err) => {
    if (err) {
        console.log("Erorr connecting to db");
    } else {
        console.log("connected to db");
    }
})

// app.get('/getProducts/:currentPage/:pageSize/:orderBy/:orderDir/:searchBy/:searchFields',(req,res)=>{
app.get('/getProducts', (req, res) => {
    const currentPage = Number(req.query.currentPage) || 1;
    const pageSize = req.query.pageSize || 10;
    const orderBy = req.query.orderBy || 'createdAt';
    const orderDir = req.query.orderBy || 'desc';
    const searchBy = req.query.searchBy || '';

    var searchArr = req.query.searchFields ;
    var searchFields = JSON.parse(searchArr) || [];

    // var sql = 'select * from ProductV2';
    
    var sql = 'select productId, productName, brandName, description, itemCode, itemType, currency, currencyCode, saleAmount, vendors, status, createdBy, createdAt, updatedAt, subCategoryId, categoryId, uomId from ProductV2';

    // var sqlJoin = `select productId, productName, brandName, description, itemCode, itemType, currency, currencyCode, saleAmount, vendors, status, createdBy, createdAt, updatedAt, subCategoryId, categoryId, uomId from ProductV2 INNER JOIN VendorsOrganizations ON ProductV2.vendors=VendorsOrganizations.VendorOrganizationId`

    if (searchBy && searchFields.length > 0) {
        console.log(searchFields[0]);
        console.log(searchBy);
        const searchCondition = searchFields.map(field => `${field} LIKE '%${searchBy}'`).join(' OR ');
        sql += ` WHERE ${searchCondition}`
    }
    const offset = (currentPage - 1) * pageSize;
    sql += ` ORDER BY ${orderBy} ${orderDir} LIMIT ${offset}, ${pageSize}`
    con.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ err: "error",err });
            return;
        }
        con.query(`SELECT COUNT(*) AS totalCount FROM ProductV2`, (err1, data) => {
            console.log("data", data);
            if (err) {
                res.status(500).json({ err1: "error",err1 });
                return;
            }
            const totalCount = data[0].totalCount;
            const totalPages = Math.ceil(totalCount / pageSize);
            let result = {
                currentPage: currentPage,
                pageSize: pageSize,
                totalPages: totalPages,
                totalCount: totalCount,
                data: results
            }
            res.json({ msg: "data", data:result })
        })
    })
})
app.listen(8080, () => {
    console.log("server is running on http://localhost:8080")

})