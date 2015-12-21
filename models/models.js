var path = require('path');

// Postgres URL: postgres://user:pass@host:port/database
// Sqlite URL:   sqlite://@/:/

var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\/(.*)/);

var DB_name = (url[6] || null);
var user = (url[2] || null);
var pwd = (url[3] || null);
var protocol = (url[1] || null);
var dialect = (url[1] || null);
var port = (url[5] || null);
var host = (url[4] || null);
var storage = process.env.DATABASE_STORAGE;

// Cargar modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD Sqlite
var sequelize = new Sequelize(DB_name, user, pwd, {
  dialect: protocol,
  protocol: protocol,
  port: port,
  host: host,
  storage: storage, // solo sqlite
  omitNull: true // solo postgres
});

// Importar la definicion de la tabla Quiz en quiz.js
var Quiz = sequelize.import(path.join(__dirname,'quiz'));

exports.Quiz = Quiz; // Exportar definicion de la tabla Quiz

//sequelize.sync() crea e inicializa tabla de preguntas en DB
sequelize.sync().success(function(){
  // success(..) ejecuta el manejador una vez creada la tabla
  Quiz.count().success(function(count){
    if(count === 0){ // La tabla se inicializa solo si esta vacia
      Quiz.create({
        pregunta: '¿Capital de Italia?',
        respuesta: 'Roma'
      })
      .success(function(){
        console.log('BDD inicializada!');
      });
    };
  });
});
