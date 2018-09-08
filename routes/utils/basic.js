var mysql = require('mysql');
var pool = mysql.createPool({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'root',
  database : 'wii_db'
});

var basic = {
    dbHelper:function(sql,params,callback){
        pool.getConnection(function(err,connection){
            connection.query(sql, params, function(err, rows) {
                callback && callback(err,JSON.parse(JSON.stringify(rows))); //去除rows中的RowDataPacket
                connection.release();
            });

        });
    }
}

module.exports = basic