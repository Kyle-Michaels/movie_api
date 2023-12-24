const express = require('express'),
    app = express(),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    uuid = require('uuid');

let users = [
    {
        id: 1,
        name: 'Kyle',
        favoriteMovies: []
    },
    {
        id: 2,
        name: 'Alyssa',
        favoriteMovies: []
    },
];

let movies = [
    {
        'Title': 'Harry Potter and the Sorcerer\'s Stone',
        'Director': {
            'Name': 'Chris Columbus',
            'Bio': '...',
            'Birth': '09.10.1958'
        },
        'Genre': {
            'Name': 'Fantasy',
            'Description': 'Fantasy films are films that belong to the fantasy genre with fantastic themes, usually magic, supernatural events, mythology, folklore, or exotic fantasy worlds.'
        }
    },
    {
        'Title': 'Lord of the Rings: The fellowship of the Ring',
        'Director': {
            'Name': 'Peter Jackson',
            'Bio': '...',
            'Birth': '10.31.1961'
        },
        'Genre': {
            'Name': 'Fantasy',
            'Description': 'Fantasy films are films that belong to the fantasy genre with fantastic themes, usually magic, supernatural events, mythology, folklore, or exotic fantasy worlds.'
        }
    },
    {
        'Title': 'Twilight',
        'Director': {
            'Name': 'Katheryn Hardwick',
            'Bio': '...',
            'Birth': '10.21.1955'
        },
        'Genre': {
            'Name': 'Drama',
            'Description': 'In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.'
        }
    },
    {
        'Title': 'The Shawshank Redemption',
        'Director': {
            'Name': 'Frank Darabont',
            'Bio': '...',
            'Birth': '01.28.1959'
        },
        'Genre': {
            'Name': 'Drama',
            'Description': 'In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.'
        }
    },
    {
        'Title': 'The Godfather',
        'Director': {
            'Name': 'Francis Ford Coppola',
            'Bio': '...',
            'Birth': '04.07.1939'
        },
        'Genre': {
            'Name': 'Crime',
            'Description': 'Crime fiction, detective story, murder mystery, mystery novel, and police novel are terms used to describe narratives that centre on criminal acts and especially on the investigation, either by an amateur or a professional detective, of a crime, often a murder.'
        }
    },
];


// Use functions for all requests (Middleware functions)
// Order for middleware functions 1.logging 2.user authentication 3.app routing

app.use(morgan('common'));
app.use(express.static('public'));
app.use(bodyParser.json());


// GET requests

app.get('/', (req, res) => {
    let responseText = 'Welcome to myFlix!';
    res.send(responseText);
});


// READ All movies 

app.get('/movies', (req, res) => {
    res.status(200).json(movies);
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


// READ Info about a genre

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

app.post('/users', (req, res) => {
    const newUser = req.body;

    if(newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).send(newUser);
    } else {
        res.status(400).send('Missing name in request body');
    }
}); 


// UPDATE a user by name

app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id == id );

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('user not found');
    }
}); 


// CREATE add movie to favoriteMovies list

app.post('/users/:id/:movieTitle', (req, res) => {
    const { id,  movieTitle } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(movieTitle + ' has been added to user ' + id + '\'s array');
    } else {
        res.status(400).send('user or movie not found');
    }
})


// DELETE remove movie to favoriteMovies list

app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id,  movieTitle } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
        res.status(200).send(movieTitle + ' has been removed from user ' + id + '\'s array');
    } else {
        res.status(400).send('user or movie not found');
    }
})


// DELETE remove user from users list

app.delete('/users/:id', (req, res) => {
    const { id } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).send('user ' + id + ' has been deleted');
    } else {
        res.status(400).send('user not found');
    }
})

// error handling

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


// listen for requests

app.listen(8080, () => {
    console.log('App is listening on port 8080.');
});