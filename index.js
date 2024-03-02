const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    mongoose = require('mongoose'),
    Models = require('./models.js'),
    { check, validationResult } = require('express-validator'),

    Movies = Models.Movie,
    Users = Models.User,
    app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
let allowedOrigins = ['http://localhost:1234', 'https://k-michaels-my-flix.netlify.app', 'https://kyle-michaels.github.io'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
            let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

// mongoose.connect('mongodb://localhost:27017/myFlix', { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true })

// Use functions for all requests (Middleware functions)
// Order for middleware functions 1.logging 2.user authentication 3.app routing

app.use(morgan('common'));
app.use(express.static('public'));

// GET
app.get('/', (req, res) => {
    let responseText = 'Welcome to myFlix!';
    res.send(responseText);
});

/**
 * Handles GET request for all movies.
 * 
 * @function
 * @name getAllMovies
 * @param {Object} - Express request.
 * @param {Object} - Express response.
 * @returns {Promise<void>} - A promise that resolves when getAllMovies request process is complete.
 * @throws {Error} - If permission is denied or unexpected error.
 * @returns {Object}[] allMovies - An array of the movies collection.
 */

app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * Handles GET request for a single movie by title.
 * 
 * @function
 * @name getMovie
 * @param {Object} - Express request with movie title parameter.
 * @param {Object} - Express response.
 * @returns {Promise<void>} - A promise that resolves when the getMovie request process is complete.
 * @throws {Error} - If permission is denied or unexpected error.
 * @returns {Object} Movie - Object containing the requested movies data.
 */

app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.status(201).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * Handles GET request for a genre by name.
 * 
 * @function
 * @name getGenre
 * @param {Object} - Express request with genre name parameter.
 * @param {Object} - Express response.
 * @returns {Promise<void>} - A promise that resolves when the getGenre request process is complete.
 * @throws {Error} - If permission is denied or unexpected error.
 * @returns {Object} Genre - Object containing the requested genre data.
 */

app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ "Genre.Name": req.params.genreName })
        .then((genre) => {
            res.status(201).json(genre.Genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        })
})

/**
 * Handles GET request for a director by name.
 * 
 * @function
 * @name getDirector
 * @param {Object} - Express request with director name parameter.
 * @param {Object} - Express response.
 * @returns {Promise<void>} - A promise that resolves when the getDirector request process is complete.
 * @throws {Error} - If permission is denied or unexpected error.
 * @returns {Object} Director - Object containing the requested director data.
 */

app.get('/movies/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ "Director.Name": req.params.directorName })
        .then((director) => {
            res.status(201).json(director.Director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        })
})

/**
 * Handles POST request to register a new user.
 * 
 * @function
 * @name registerUser
 * @param {Object} - Express request.
 * @param {Object} - Express response.
 * @returns {Promise<void>} - A promise that resolves when registerUser request process is complete.
 * @throws {Error} - If permission is denied or unexpected error.
 * @returns {Object} newUser - New user object
 */

app.post('/users',
    [
        check('Username', 'Username requires minimum length of 5 characters').isLength({ min: 5 }),
        check('Username', 'Username is required.').not().isEmpty(),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ],
    async (req, res) => {
        let errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let hashedPassword = Users.hashPassword(req.body.Password);
        await Users.findOne({ Username: req.body.Username })
            .then((user) => {
                if (user) {
                    return res.status(400).send(req.body.Username + ' already exists');
                } else {
                    Users
                        .create({
                            Username: req.body.Username,
                            Password: hashedPassword,
                            Email: req.body.Email,
                            Birthday: req.body.Birthday
                        })
                        .then((user) => { res.status(201).json(user) })
                        .catch((error) => {
                            console.error(error);
                            res.status(500).send('Error: ' + error);
                        })
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    }
);

/**
 * Handles PUT request to update a user by username.
 * 
 * @function
 * @name updatedUser
 * @param {Object} - Express request with username parameter.
 * @param {Object} - Express response.
 * @returns {Promise<void>} - A promise that resolves when the updateUser request process is complete.
 * @throws {Error} - If permission is denied or an unexpected error.
 * @fires {Object} - updatedUser - Updated user object is sent in the response.
 * @description Expects at least one field to update in the request body
 */

app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // VERIFY THAT USERNAME THAT REQUESTS TO EDIT IS THE SAME USERNAME
    if (req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission denied');
    }
    // CONDITION ENDS
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOneAndUpdate({ Username: req.params.Username },
        {
            $set:
            {
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            }
        },
        { new: true })
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        })
})

/**
 * Handles POST request to add a movie to user's favorites.
 * 
 * @function
 * @name addToFavorites
 * @param {Object} - Express request with movieID and username perameters.
 * @param {Object} - Express response.
 * @returns {Promise<void>} - A promise that resolves when the addToFavorites request process is complete.
 * @throws {Error} - If permission is denied or unexpected error.
 * @returns {Object} updatedUser - Updated user object with movie added to FavoriteMovies array is sent in the response.
 */

app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // VERIFY THAT USERNAME THAT REQUESTS TO EDIT IS THE SAME USERNAME
    if (req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission denied');
    }
    // CONDITION ENDS
    await Users.findOneAndUpdate({ Username: req.params.Username },
        {
            $push: { FavoriteMovies: req.params.MovieID }
        },
        { new: true })
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * Handles DELETE request to remove a movie from user's favorites.
 * 
 * @function
 * @name removeFromFavorites
 * @param {Object} - Express request with movieID and username perameters.
 * @param {Object} - Express response.
 * @returns {Promise<void>} - A promise that resolves when the removeFromFavorites request process is complete.
 * @throws {Error} - If permission is denied or unexpected error.
 * @returns {Object} updatedUser - Updated user object with movie removed from FavoriteMovies array is sent in the response.
 */

app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // VERIFY THAT USERNAME THAT REQUESTS TO EDIT IS THE SAME USERNAME
    if (req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission denied');
    }
    // CONDITION ENDS
    await Users.findOneAndUpdate({ Username: req.params.Username },
        {
            $pull: { FavoriteMovies: req.params.MovieID }
        },
        { new: true })
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * Handles DELETE request to delete user account.
 * 
 * @function
 * @name deleteUser
 * @param {Object} - Express request with username parameter.
 * @param {Object} - Express response.
 * @returns {Promise<void>} - A promise that resolves when the deleteUser request process is complete.
 * @throws {Error} - If permission is denied or an unexpected error.
 * @fires {string} Message - A message with the result of the user deletion process.
 */

app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    // VERIFY THAT USERNAME THAT REQUESTS TO EDIT IS THE SAME USERNAME
    if (req.user.Username !== req.params.Username) {
        return res.status(400).send('Permission denied');
    }
    // CONDITION ENDS    
    await Users.findOneAndDelete({ Username: req.params.Username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.Username + ' was not found');
            } else {
                res.status(200).send(req.params.Username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// error handling

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('App is listening on port ' + port);
});