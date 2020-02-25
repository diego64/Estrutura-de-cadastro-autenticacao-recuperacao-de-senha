const mongoose = require('../../database');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true, // Toda a string em caixa baixa
    },
    password: {
        type: String,
        required: true,
        select: false, // Esconder essa informação no array de usuário
    },
    passwordResetToken: {
        type:String,
        select: false,
    },
    passwordResetExpires: {  //Guarda a data de expiração do token
        type: Date,
        select: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

UserSchema.pre('save', async function(next){
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;