const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    mongoose = require('mongoose'),
    Models = require('./models.js'),

    Movies = Models.Movie,
    Users = Models.User,
    app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/myFlix', { useNewUrlParser: true, useUnifiedTopology: true })

// Use functions for all requests (Middleware functions)
// Order for middleware functions 1.logging 2.user authentication 3.app routing

app.use(morgan('common'));
app.use(express.static('public'));


// GET requests

app.get('/', (req, res) => {
    let responseText = 'Welcome to myFlix!';
    res.send(responseText);
});


// READ All movies 

// app.get('/movies', (req, res) => {
//     res.status(200).json(movies);
// });


// NEW READ ALL movies

app.get('/movies', async (req, res) => {
    await Movies.find()
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// READ Info about single movie

app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find( movie => movie.Title.toLowerCase() === title.toLowerCase())

    if (movie) {
        return res.status(200).json(movie);
    } else {
        return res.status(400).send('No movie found')
    }
});


// READ Info about a genre

app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find( movie => movie.Genre.Name.toLowerCase() === genreName.toLowerCase()).Genre;

    if (genre) {
        return res.status(200).json(genre);
    } else {
        return res.status(400).send('No genre found')
    }
});


// READ Info about a director

app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find( movie => movie.Director.Name.toLowerCase() === directorName.toLowerCase()).Director;

    if (director) {
        return res.status(200).json(director);
    } else {
        return res.status(400).send('No director found');
    }
});


// CREATE register a user

// app.post('/users', (req, res) => {
//     const newUser = req.body;

//     if(newUser.name) {
//         newUser.id = uuid.v4();
//         users.push(newUser);
//         res.status(201).send(newUser);
//     } else {
//         res.status(400).send('Missing name in request body');
//     }
// }); 

// NEW CREATE register a user

app.post('/users', async (req, res) => {
    await Users.findOne({ Username: req.body.Username })
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.Username +  'already exists');
        } else {
            Users
                .create({
                    Username: req.body.Username,
                    Password: req.body.Password,
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
});


// UPDATE a user by name

// app.put('/users/:id', (req, res) => {
//     const { id } = req.params;
//     const updatedUser = req.body;

//     let user = users.find( user => user.id == id );

//     if (user) {
//         user.name = updatedUser.name;
//         res.status(200).json(user);
//     } else {
//         res.status(400).send('user not found');
//     }
// }); 


// NEW UPDATE a user by username

app.put('/users/:Username', async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username },
    { $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
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

// CREATE add movie to favoriteMovies list

// app.post('/users/:id/:movieTitle', (req, res) => {
//     const { id,  movieTitle } = req.params;

//     let user = users.find( user => user.id == id );

//     if (user) {
//         user.favoriteMovies.push(movieTitle);
//         res.status(200).send(movieTitle + ' has been added to user ' + id + '\'s array');
//     } else {
//         res.status(400).send('user or movie not found');
//     }
// })


// NEW CREATE add movie to favoriteMovies list

app.post('/users/:Username/movies/:MovieID', async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username },
        { $push: { FavoriteMovies: req.params.MovieID }
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


// DELETE remove movie to favoriteMovies list

// app.delete('/users/:id/:movieTitle', (req, res) => {
//     const { id,  movieTitle } = req.params;

//     let user = users.find( user => user.id == id );

//     if (user) {
//         user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
//         res.status(200).send(movieTitle + ' has been removed from user ' + id + '\'s array');
//     } else {
//         res.status(400).send('user or movie not found');
//     }
// })


// NEW DELETE remove movie to favoriteMovies list

app.delete('/users/:Username/movies/:MovieID', async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username },
        { $pull: { FavoriteMovies: req.params.MovieID }
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


// DELETE remove user from users list

// app.delete('/users/:id', (req, res) => {
//     const { id } = req.params;

//     let user = users.find( user => user.id == id );

//     if (user) {
//         users = users.filter( user => user.id != id);
//         res.status(200).send('user ' + id + ' has been deleted');
//     } else {
//         res.status(400).send('user not found');
//     }
// })


// NEW DELETE remove user from user list

app.delete('/users/:Username', async (req, res) => {
    await Users.findOneAndRemove({ Username: req.params.Username })
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

app.listen(8080, () => {
    console.log('App is listening on port 8080.');
});