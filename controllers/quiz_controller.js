var models = require('../models/models.js');

// Con autoload se factoriza el codigo si la ruta incluye :quizId
exports.load = function(req,res,next,quizId){
  models.Quiz.find({ where: { id:Number(quizId) }, include:[{ model: models.Comment }]}).then(function(quiz){
      if(quiz){
        req.quiz = quiz;
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
  var resultado = 'Incorrecto';
  if(req.query.respuesta === req.quiz.respuesta){
    resultado = 'Correcto';
  }
  res.render('quizes/game_a', {quiz: req.quiz, respuesta: resultado, errors: []});
};

// GET /quizes/:id
exports.show = function(req,res) {
  res.render('quizes/show', {quiz: req.quiz, errors: []});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if(req.query.respuesta === req.quiz.respuesta){
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
