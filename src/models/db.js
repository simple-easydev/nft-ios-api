/* eslint-disable no-undef */
const dotenv = require('dotenv');
const mysql = require('mysql');
const { Sequelize } = require('sequelize');


// initialize configuration
dotenv.config();


let pool = null;

const connect = (done) => {
  try {
    pool = mysql.createPool({
      connectionLimit: 10, // TODO is there a better number?
      host: process.env.MYSQL_HOSTNAME,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: 'db_nft',
      multipleStatements: true,
    });
    console.log('DB is connected..');
    done(false);
  } catch (e) {
    console.log('ERROR -->', e);
    done(true);
  }
};

module.exports.connect = connect;

const queryDB = (sql, params) => new Promise((resolve, reject) => {
  pool.query(sql, params, (err, result) => {
    if (err) { reject(err); } else { resolve(result); }
  });
});

module.exports.queryDB = queryDB;

exports.queryFirstRow = async (sql, params) => {
  const rows = await queryDB(sql, params);
  return rows.length > 0 ? rows[0] : null;
};

console.log("process.env.MYSQL_USER ==>", process.env.MYSQL_USER);

const sequelize = new Sequelize('db_nft', process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_HOSTNAME,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }}
);

module.exports.sequelize = sequelize;