const util = require('util')
const mysql = require('mysql2')

//const mysql = require("mysql2/promise");

/*
const pool = mysql.createPool({
    connectionLimit: 5,
    host: 'mysql669.umbler.com',
    port: '41890',
    user: 'produto.user',
    password: '#Zd*i6oo5U',
    database: 'produto.link',
    'multipleStatements': true,
    queueLimit: 0,
    waitForConnections: true
});
*/

const pool = mysql.createPool({
    connectionLimit: 5,
    host: 'mysql.lagoadaprata.mg.gov.br',
    port: '3306',
    user: 'lagoadaprata08',
    password: '102030Brasil2020',
    database: 'lagoadaprata08',
    'multipleStatements': true,
    queueLimit: 0,
    waitForConnections: true
});
 

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }
    if (connection) connection.release()
    return
})


pool.query = util.promisify(pool.query)

/*
process.on('SIGINT', () =>
    pool.end(err => {
        if (err) return console.log(err);
        console.log('pool => fechado');
        process.exit(0);
    })
);
*/
module.exports = pool;