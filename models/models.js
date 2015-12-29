var path = require('path');

// Postgres URL: postgres://user:pass@host:port/database
// Sqlite URL:   sqlite://@/:/

var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);

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

// Importar la definicion de la tabla Comment
var comment_path = path.join(__dirname,'comment');
var Comment = sequelize.import(comment_path);

// Importar definicion de la tabla Comment
var user_path = path.join(__dirname,'user');
var User = sequelize.import(user_path);

Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

// Las preguntas pertenecen a un usuario registrado
Quiz.belongsTo(User);
User.hasMany(Quiz);

// Exportamos las tablas
exports.Quiz = Quiz;
exports.Comment = Comment;
exports.User = User;

// sequelize.sync() inicializa la tabla de preguntas en la DB
sequelize.sync({ force: true }).then(function() {
  // then(..) ejecuta el manejador una vez creada la tabla
  User.count().then(function (count){
    if(count === 0) {   // la tabla se inicializa solo si está vacía
      User.bulkCreate( // bulkCreate es lo mismo que usar varios Create
        [ {username: 'admin',   password: '1234', isAdmin: true},
          {username: 'pepe',   password: '5678'} // el valor por defecto de isAdmin es 'false'
        ]
      ).then(function(){console.log('Base de datos (tabla user) inicializada');});
    }
  });

  Quiz.count().then(function (count){
    if(count === 0) {   // la tabla se inicializa solo si está vacía
      Quiz.bulkCreate(
        [ {pregunta: 'Capital de Italia',   respuesta: 'Roma', UserId: 2}, // estos quizes pertenecen al usuario pepe (2)
          {pregunta: 'Capital de Portugal', respuesta: 'Lisboa', UserId: 2}
        ]
      ).then(function(){console.log('Base de datos (tabla quiz) inicializada')});
    };
  });
});
