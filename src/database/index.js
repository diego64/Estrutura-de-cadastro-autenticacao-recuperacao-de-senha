const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://omnistack:omnistack@omnistack-77ls0.mongodb.net/autenticacaodeusuario?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});
mongoose.Promise = global.Promise;

module.exports = mongoose;