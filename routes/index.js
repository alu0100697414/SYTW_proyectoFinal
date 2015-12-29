var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var sessionController = require('../controllers/session_controller');
var userController = require('../controllers/user_controller');

// GET home page.
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Quiz', errors: [] });
});

// GET Instrucciones.
router.get('/instructions', function(req, res, next) {
  res.render('instructions', { errors: [] });
});

// Definición de rutas de sesion
router.get('/login',  sessionController.new);     // formulario login
router.post('/login', sessionController.create);  // crear sesión
router.get('/logout', sessionController.destroy); // destruir sesión

// Autoload de comandos con :quizId
router.param('quizId', quizController.load); // autoload :quizId
router.param('commentId', commentController.load);  // autoload :commentId
router.param('userId', userController.load);  // autoload :userId

// Definición de rutas de quizes
router.get('/quizes', quizController.index);
router.get('/quizes/:quizId(\\d+)', quizController.show);
router.get('/quizes/:quizId(\\d+)/answer', quizController.answer);
router.get('/game', quizController.gameQ);
router.get('/game/:quizId(\\d+)/answer', quizController.gameA);
router.get('/quizes/new', 				   sessionController.loginRequired, quizController.new);
router.post('/quizes/create',              sessionController.loginRequired, quizController.create);
router.get('/quizes/:quizId(\\d+)/edit',   sessionController.loginRequired, quizController.ownership, quizController.edit);
router.put('/quizes/:quizId(\\d+)',        sessionController.loginRequired, quizController.ownership, quizController.update);
router.delete('/quizes/:quizId(\\d+)',     sessionController.loginRequired, quizController.ownership, quizController.destroy);

// Definición de rutas de cuenta
router.get('/user',  userController.new);     // formulario sign un
router.post('/user',  userController.create);     // registrar usuario
router.get('/user/:userId(\\d+)/edit',  sessionController.loginRequired, userController.ownership, userController.edit);     // editar información de cuenta
router.put('/user/:userId(\\d+)',  sessionController.loginRequired, userController.ownership, userController.update);     // actualizar información de cuenta
router.delete('/user/:userId(\\d+)',  sessionController.loginRequired, userController.ownership, userController.destroy);     // borrar cuenta
router.get('/user/:userId(\\d+)/perfil',  quizController.perfil);     // Ver perfil de un usuario

// Definición de rutas de comentarios
router.get('/quizes/:quizId(\\d+)/comments/new', commentController.new);
router.post('/quizes/:quizId(\\d+)/comments', commentController.create);
router.get('/quizes/:quizId(\\d+)/comments/:commentId(\\d+)/publish',
  sessionController.loginRequired, commentController.ownership, commentController.publish);

module.exports = router;
