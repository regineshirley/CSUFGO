var express = require('express');
var router = express.Router();

// adding mongoose
var mongoose = require('mongoose');
var Event = mongoose.model('Event');
var Subscriber = mongoose.model('Subscriber');

// added a router.get to retrive the list of Events from the DB
router.get('/events', function(req, res, next) {
  Event.find(function(err, events){
    if(err){ return next(err); }

    res.json(events);
  });
});

// added a router.post to place a event into the DB
router.post('/events', function(req, res, next){
  var event = new Event(req.body);

  event.save(function(err, event){
    if(err){ return next(err); }

    res.json(event);
  });
});

/* old code --
// added router.get to retrieve a single event
router.get('/events/:event', function(req, res) {
  res.json(req.event);
});
*/
// added router.get to retrieve a single event (UPDATED)
router.get('/events/:event', function(req, res, next) {
  req.event.populate('subscribers', function(err, event) {
    if(err) { return next(err); }

    res.json(event);
  });
});

// added a router.param to preload event objects
router.param('event', function(req, res, next, id){
  var query = Event.findById(id);

  query.exec(function (err, event){
    if (err) { return next(err); }
    if (!event) { return next(new Error('can\t find event')); }

    req.event = event;
    return next();
  });
});

// added a router.post to place a subscribers in the DB attached to a Event
router.post('/events/:event/subscribers', function(req, res, next){
  var subscriber = new Subscriber(req.body);
  subscriber.event = req.event;

  subscriber.save(function(err, subscriber){
    if (err){ return next(err); }

    req.event.subscribers.push(subscriber);
    req.event.save(function(err, event){
      if(err){ return next(err); }

      res.json(subscriber);
    });
  });
});

// added a router.param to preload a subscriber from the DB
router.param('subscriber', function(req, res, next, id){
  var query = Subscriber.findById(id);

  query.exec(function (err, subscriber){
    if (err) { return next(err); }
    if (!Subscriber) { return next(new Error('can\t find event')); }

    req.subscriber = subscriber;
    return next();
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
