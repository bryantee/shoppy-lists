global.DATABASE_URL = 'mongodb://localhost/shopping-list-test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server.js');
const Item = require('../models/item');

const should = chai.should();
const app = server.app;

chai.use(chaiHttp);

describe('Shopping List', function () {
  before(function (done) {
    server.runServer(function () {
      Item.create({
          name: 'Broad beans'
        }, {
          name: 'Tomatoes'
        }, {
          name: 'Peppers'
        },
        function () {
          done();
        });
    });
  });

  after(function (done) {
    Item.remove(function () {
      done();
    });
  });
  it('should list items on GET', function(done) {
    chai.request(app)
      .get('/items')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.should.have.length(3);
        res.body[0].should.be.a('object');
        res.body[0].should.have.property('_id');
        res.body[0].should.have.property('name');
        res.body[0]._id.should.be.a('string');
        res.body[0].name.should.be.a('string');
        res.body
        done();
      });
  });
  it('should add an item on post', function(done) {
    chai.request(app)
      .post('/items')
      .send({'name': 'Kale'})
      .end(function(err, res) {
        should.equal(err, null);
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('name', 'Kale');
        res.body.should.have.property('_id');
        res.body._id.should.be.a('string');
        res.body.name.should.be.a('string');
        chai.request(app)
          .get('/items')
          .end(function(err, res) {
            res.body.should.be.a('array');
            res.body.length.should.equal(4);
            res.body[3].name.should.equal('Kale');
            res.body[3]._id.should.be.a('string');
            done();
          });
      });
  });
  it('should edit an item on put', function(done) {
    chai.request(app)
      .get('/items')
      .end(function(err, res) {
        let id = res.body[0]._id;
        chai.request(app)
          .put('/items/' + id)
          .send({'name': 'Brownies', '_id': id})
          .end(function(err, res) {
            res.should.have.status(200);
            chai.request(app)
              .get('/items')
              .end(function(err, res) {
                res.body[0].should.have.property('name', 'Brownies');
                res.body[0].should.have.property('_id', id);
                done();
              });
          });
      });
  });
  it('should delete an item on delete', function (done) {
    chai.request(app)
      .get('/items')
      .end(function (err, res) {
        const id = res.body[3]._id;
        res.body[3].name.should.equal('Kale');
        chai.request(app)
          .delete('/items/' + id)
          .end(function (err, res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.have.property('name', 'Kale');
            res.body.should.have.property('_id', id);
            done();
          });
      });
  });
  it('should get 400 when no data on post', function(done) {
    chai.request(app)
      .post('/items')
      .send({})
      .end(function(err, res) {
        res.should.have.status(400);
        done();
      });
  });
  it('should get 400 when not valid json data on post', function(done) {
    chai.request(app)
      .post('/items')
      .send('blah blah blah')
      .end(function(err, res) {
        res.should.have.status(400);
        done();
      });
  });
  it('should get 404 when different id in endpoint than body on put', function(done) {
    chai.request(app)
      .get('/items')
        .end(function(err, res) {
          const id = res.body[2]._id;
          chai.request(app)
            .put('/items/' + id)
            .send({'name': 'Hand Sanitizer', '_id': 42})
            .end(function(err, res) {
              res.should.have.status(400);
              done();
          });
        });
  });
  it('should get 404 when id doesn\'t exist on delete', function(done) {
    chai.request(app)
      .delete('/items/26')
      .end(function(err, res) {
        res.should.have.status(404);
        done();
      });
  });
  it('should get 400 when no id in endoint on delete', function(done) {
    chai.request(app)
      .delete('/items/')
      .end(function(err, res) {
        res.should.have.status(404);
        done();
      });
  });

  // TODO: Add tests for users once API / functionality added
  // ----------------------------------------------------------
  // it('should return items for user', function(done) {
  //   chai.request(app)
  //     .get('/user/bryan')
  //     .end(function(err, res) {
  //       res.should.have.status(200);
  //       res.body.should.be.a('array');
  //       done();
  //     });
  // });
  // it('should return 404 on user not found', function(done) {
  //   chai.request(app)
  //     .get('/user/Mario')
  //     .end(function(err, res) {
  //       res.should.have.status(404);
  //       res.body.should.be.empty;
  //       done();
  //     });
  // });
  //  ---------------------- END USER TESTS ----------------------
  it('should return 404 when id doesn\'t exist on PUT', function(done) {
    chai.request(app)
      .put('/items/29')
      .send({'name': 'Berries', '_id': 29})
      .end(function(err, res) {
        res.should.have.status(404);
        done();
      });
  });
});
