var models = require('../models/models.js');

// MW que permite acciones solamente si el quiz objeto pertenece al usuario
// logeado o si es cuenta admin
exports.ownership = function(req, res, next){
  var objQuizOwner = req.quiz.UserId;
  var logUser = req.session.user.id;
  var isAdmin = req.session.user.isAdmin;

  if (isAdmin || objQuizOwner === logUser) {
    next();
  } else {
    res.redirect('/');
  }
};

// Con autoload se factoriza el codigo si la ruta incluye :quizId
exports.load = function(req,res,next,quizId){
  models.Quiz.find({ where: { id:Number(quizId) }, include:[{ model: models.Comment }]}).then(function(quiz){
      if(quiz){
        req.quiz = quiz;
        req.quiz.respuesta = req.quiz.respuesta.toUpperCase();
        next();
      }
      else {
        next(new Error('No existe quizId=' + quizId))
      }
    }
  ).catch(function(error){ next(error) });
};

// GET /game
exports.gameQ = function(req,res) {
  models.Quiz.count().then(function(count) { // Cuento el numero de filas en la tabla
    var index = Math.floor((Math.random() * count) + 1); // Numero aleatorio

    models.Quiz.find(index).then(function(project) {
      res.render('quizes/game_q', {quiz: project, index: index, errors: []});
    })
  })
};

// GET /game/:id/answer
exports.gameA = function(req,res) {
  if(!req.session.user){
    var resultado = 'Incorrecto';
    if(req.query.respuesta.toUpperCase() === req.quiz.respuesta){
      resultado = 'Correcto';
    }
    res.render('quizes/game_a', {quiz: req.quiz, respuesta: resultado, errors: []});
  }
  else {
    if(req.query.respuesta.toUpperCase() === req.quiz.respuesta){
      req.session.user.qAcertadas = req.session.user.qAcertadas + 1;
      res.render('quizes/game_a', {quiz: req.quiz, respuesta: 'Correcto', errors: []});
    } else {
      req.session.user.qFalladas = req.session.user.qFalladas + 1;
      res.render('quizes/game_a', {quiz: req.quiz, respuesta: 'Incorrecto', errors: []});
    }
  }
};

// GET /quizes/:id
exports.show = function(req,res) {
  res.render('quizes/show', {quiz: req.quiz, errors: []});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if(req.query.respuesta.toUpperCase() === req.quiz.respuesta){
    resultado = 'Correcto';
  }
  res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors: []});
};

// GET /quizes
exports.index = function(req,res) {
  models.Quiz.findAll().then(function(quizes){
    res.render('quizes/index', {quizes: quizes, errors: []});
  })
};

// GET /quizes/new
exports.new = function(req,res){
  var quiz = models.Quiz.build(
    {pregunta: "Pregunta", respuesta: "Respuesta"}
  );

  res.render('quizes/new', {quiz: quiz, errors: []});
}

// POST /quizes/create
exports.create = function(req,res){
  req.body.quiz.UserId = req.session.user.id;
  var quiz = models.Quiz.build( req.body.quiz );

  //guarda en la BD los campos pregunta y respuesta del quiz
  quiz.validate().then(function(err){
    if (err) {
      res.render('quizes/new', {quiz: quiz, errors: err.errors});
    } else {
      quiz // save: guarda en DB campos pregunta y respuesta de quiz
      .save({fields: ["pregunta", "respuesta", "UserId"]}).then( function(){ res.redirect('/quizes')})
      }  // res.redirect: Redirección HTTP a lista de preguntas
    }
  );
};

// GET /quizes/:id/edit
exports.edit = function(req,res){
  var quiz = req.quiz; // autoload de instanca de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};

exports.update = function(req,res){
  req.quiz.pregunta = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;

  req.quiz.validate().then(function(err){
    if (err) {
      res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
    } else {
      req.quiz     // save: guarda campos pregunta y respuesta en DB
      .save( {fields: ["pregunta", "respuesta"]}).then( function(){ res.redirect('/quizes');});
    }  // Redirección HTTP a lista de preguntas (URL relativo)
  });
};

// DELETE /quizes/:id
exports.destroy = function(req,res){
  req.quiz.destroy().then(function(){
    res.redirect('/quizes');
  }).catch(function(error){ next(error) });
};

// GET /users/:userId/perfil
exports.perfil = function(req, res) {
  var options = {};
  if(req.user){
    options.where = {UserId: req.user.id}
  }

  models.Quiz.findAll(options).then(function(quizes) {
    res.render('quizes/perfil', {quizes: quizes, errors: []});
  }).catch(function(error){next(error)});
 };
