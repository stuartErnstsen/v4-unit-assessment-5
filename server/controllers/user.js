const bcrypt = require('bcryptjs');
const { isElementOfType } = require('react-dom/test-utils');

module.exports = {
    register: async (req, res) => {
        const { username, password } = req.body;
        const db = req.app.get('db')

        const checkUser = await db.user.find_user_by_username({ username });
        if (checkUser[0]) {
            return res.status(409).send('Username is already in use')
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        const newUser = await db.user.create_user({ username, hash, profile_pic: `https://robohash.org/${username}.png` })

        req.session.user = newUser
        res.status(201).send(req.session.user)
    },
    login: async (req, res) => {
        const { username, password } = req.body;
        const db = req.app.get('db')

        const foundUser = await db.user.find_user_by_username({ username });
        if (!foundUser[0]) {
            return res.status(401).send('Username does not exist')
        }
        const isAuthenticated = bcrypt.compareSync(password, foundUser[0].password)
        if (!isAuthenticated) {
            return res.status(403).send('Password is incorrect')
        }
        req.session.user = foundUser[0];
        res.status(200).send(req.session.user)
    },
    logout: async (req, res) => {
        req.session.destroy()
        res.sendStatus(200)
    },
    getUser: async (req, res) => {
        if (!req.session.user) {
            return res.sendStatus(404)
        }
        res.status(200).send(req.session.user)
    }
}