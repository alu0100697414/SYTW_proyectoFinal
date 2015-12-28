// Modelo User con validación y encriptación de contraseñas

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      validate: { notEmpty: {msg: "~ Falta el nombre de usuario." }}
    },

    password: {
      type: DataTypes.STRING,
      validate: { notEmpty: {msg: "~ Falta la contraseña."}}
    },

    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  return User;
}
