const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader)
        return res.status(401).send({error: 'Token não informado'});

        const parts = authHeader.split(' ');

        if (!parts.length === 2)
            return res.status(401).send({ error: 'Erro no token'});

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme)) 
            return res.status(401).send({ error: 'O formato do token não corresponde ao padrão'})

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) return res.status(401).send({ error: 'Token Invalido'});

        req.userId = decoded.id;
        return next();
    });
};