var express = require('express');
var router = express.Router();
var topfive = require('../public/javascripts/topfive')
var unirest = require('unirest')
var getupcoming = require('../public/javascripts/getupcoming')
var format = require('../public/javascripts/helpers')
var knex = require('../db/knex');
var db = require('../src/db')
var localStorage = require('localStorage');

function Movies(){
  return knex('movies');
  console.log(knex('movies'));
}



router.get('/', function(req, res, next) {
      res.render('index')
  })

router.get('/vote', function(req, res, next) {
  var movies= []
  var usersName = localStorage.getItem('name').replace(/['"]+/g, '');
  var originalUrl = localStorage.getItem('photo');
  var email = localStorage.getItem('email').replace(/['"]+/g, '');
  var url = originalUrl.replace(/['"]+/g, '');
  getupcoming.then(function(data){
    data['results'].forEach(function(movie){
      console.log(movie.poster_path);
      if(movie.original_language === "en"){
        if(movie.poster_path !== null && movie.poster_path !== "" && movie.poster_path !== "null"){
          movies.push( {image:'https://image.tmdb.org/t/p/w185'+movie.poster_path, title: movie.title})
        }
      }
    });

    res.render('vote', {movies: movies, photoUrl: url, userName: usersName, toppboxemail:email})
  })
});


//need to add id to render the right page
router.get('/show/:id', function(req, res, next) {
  var movies= []
  var usersName = localStorage.getItem('name').replace(/['"]+/g, '');
  console.log(usersName + "***************************");
  var originalUrl = localStorage.getItem('photo');
  var email = localStorage.getItem('email').replace(/['"]+/g, '');
  var url = originalUrl.replace(/['"]+/g, '');
  getupcoming.then(function(data){
    data['results'].forEach(function(movie){
      movies.push( {image:'https://image.tmdb.org/t/p/w185'+movie.poster_path, title: movie.title})
    });
  })
  res.render('show', {movies:movies, photoUrl: url, userName: usersName, toppboxemail:email});
})

router.get('/approved', function(req, res, next) {
  res.render('profile');
});

router.post('/vote', function(req, res, next){
  var date = new Date();
  var email = localStorage.getItem('email').replace(/['"]+/g, '');
  var picks = format.formatPicks(req.body);
  db.userByEmail(email).then(function(result) {
    var userId = result[0].id;
    console.log('result = !!!', result);
    db.insertVote({'user_id': userId,
                  'date': date}).then (function(results) {
      console.log('insert Vote results', results);
      db.votesByUserDate(userId, date).then(function(results) {
        console.log('vote id is ', results);
        format.addMovieVotes(picks, results.id);
      })
    })
  })
  console.log('picks!!!', picks);
  res.redirect('/')
})

router.get('/show', function(req, res, next) {
  res.render('show');
});

// router.get('/:title', function(req, res, next) {
//   getupcoming.then(function(data){
//     data['results'].forEach(function(movie){
//       var movieName = movie.title.replace(/ /g,'').toLowerCase();
//       movieName = movieName.replace(/,/g, '');
//       movieName = movieName.replace(/-/g, '');
//       console.log(movieName);
//       if(req.params.title === movieName){
//         res.render('show', {title: movieName, movie[0]});
//       }
//     })
//   })
// })


module.exports = router;
