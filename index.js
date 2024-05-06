const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const sender_FIO = 'sender_FIO';
const sender_email = 'sender_email';
const message_date = 'message_date';
const message = 'message';

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// API to fetch data with pagination
app.get('/messages', (req, res) => {
  let { page, size, filters } = req.query;
  page = page ? parseInt(page) : 1;
  size = size ? parseInt(size) : 10;
  const offset = (page - 1) * size;

  let sql = 'SELECT * FROM cms_elobraschenie WHERE 1=1';
  let sqlCount = 'SELECT COUNT(*) AS count FROM cms_elobraschenie WHERE 1=1';
  let params = [];

  if (filters[sender_FIO]) {
    sql += ` AND ${sender_FIO} LIKE ?`;
    sqlCount += ` AND ${sender_FIO} LIKE ?`;
    params.push(`%${filters[sender_FIO]}%`);
  }

  if (filters[sender_email]) {
    sql += ' AND sender_email LIKE ?';
    sqlCount += ' AND sender_email LIKE ?';
    params.push(`%${filters[sender_email]}%`);
  }

  if (filters[message_date]) {
    sql += ' AND message_date LIKE ?';
    sqlCount += ' AND message_date LIKE ?';
    params.push(`%${filters[message_date]}%`);
  }

  if (filters[message]) {
    sql += ' AND message LIKE ?';
    sqlCount += ' AND message LIKE ?';
    params.push(`%${filters[message]}%`);
  }

  sql += ' LIMIT ?, ?';
  params.push(offset, size);

  db.query(sqlCount, params.slice(0, -2), (err, countResult) => {
    if (err) throw err;
    const totalRows = countResult[0].count;

    db.query(sql, params,
      (err, results) => {
        console.log(results);
        if (err) throw err;
        res.json({
          data: results,
          totalRows: totalRows,
          totalPages: Math.ceil(totalRows / size)
        });
      }
    );
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
