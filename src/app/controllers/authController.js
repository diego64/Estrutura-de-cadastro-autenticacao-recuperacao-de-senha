//const User = require('../models/user');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

const authConfig = require('../../config/auth');

const User = require('../models/user');

const router = express.Router();

function generateToken(params = {}) {
     return jwt.sign( params, authConfig.secret, {
            expiresIn: 172800,
        })
}
//Registro de usuario
router.post('/register', async (req, res) => {
    const { email } = req.body;

    try {
        if (await User.findOne({ email }))
        return res.status(400).send({ error: 'Usuário já registrado em nosso sistema'});

        const user = await User.create(req.body);

        user.password = undefined;

        return res.send({ 
            user,
            token: generateToken({ id: user.id}),
        });
    }   catch (err) {
        return res.status(400).send({ error: 'Falha no registro' });
    }
});

//Autenticação de usuario
router.post('/authenticate', async (req, res) => {
    const { email, password} = req.body;

    const user = await User.findOne({ email }).select('+password');

    if(!user)
        return res.status(400).send({ error: 'Usuário não emcontrado em nosso sistema'});

        if(!await bcrypt.compare(password, user.password)) //Comparando se a senha digitada é a mesma que foi salva no Banco de Dados
        return res.status(400).send( {error: 'A senha digitada não confere com o usuário'});

        user.password = undefined;

        //const token = jwt.sign({ id: user.id}, authConfig.secret, {
            //expiresIn: 172800,
        //})

        res.send({ 
            user, 
            token: generateToken({ id: user.id}),
         });
});

//Esqueci minha senha
router.post('/forgot_password', async (req, res) => {
    const { email } = req.body; //E-mail que quer recuperar a senha

    try {
        const user = await User.findOne({ email }); //Faz a busca do usuário no Banco de dados, verificando se ele está cadastrado

        if(!user) 
            return res.status(400).send({ error: 'Usuário não encontrado em nossa base de dados'});

        //Geração do token para o usuário poder alterar a senha 
        const token = crypto.randomBytes(20).toString('hex');

        //Data e tempo de expiração do token
        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
                  }
            }, { new: true, useFindAndModify: false }
            );

        console.log(token, now);

        mailer.sendMail({
            to: email, 
            subject: 'Recuperação de acesso',
            from: 'diego.ferreira@irondev.com.br',
            template: 'auth/forgot_password',
            context: { token },
        }, (err) => {
           if (err) 
            return res.status(400).send({ error: 'Não foi possivel enviar o e-mail de recuperação de senha'});

            return res.status(200).send({ status: 'E-mail enviado com sucesso'});
        });
    } catch (err) {
        console.log(err);
        res.status(400).send({ error: 'Falha no sistema de recuperação de senha, tente novamente mais tarde'});
    }
});

//Cadastro da nova senha
router.post('/reset_password', async (req, res) => {
    const { email, token, password} = req.body;

    try {
        const user = await User.findOne({ email })
            .select('+passwordResetToken passwordResetExpires');

        if(!user) 
            return res.status(400).send({ error: 'Usuário não encontrado em nossa base de dados'});

        if(token !== user.passwordResetToken)
            return res.status(400).send({ error: 'O tokken informado não é valido'});

        //Verificação da expiração do token
        const now = new Date();

        if (now > user.passwordResetExpires)
        return res.status(400).send({ error: 'O tokken informado está espirado, por favor gere um novo'});

        user.password = password;

        await user.save();

        return res.status(200).send({ status: 'Senha alterada com sucesso'});

    } catch (err) {
        return res.status(400).send({ error: 'Não foi possivel alterar sua senha, tente novamente mais tarde'});
    }
});

module.exports = app => app.use('/auth', router);