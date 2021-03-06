'use strict';

var _ = require('lodash');

module.exports = function(app) {

  app.controller('cardsController', ['$scope', 'RESTResource', 'copy', 'setEmpty', '$location', 'auth', '$mdToast', '$animate', '$timeout', function($scope, resource, copy, empty, $location, auth, $mdToast, $animate, $timeout) {
    // If not signed in, redirect
    if (!auth.isSignedIn()) { $location.path('/login'); }

    var Card = resource('cards');
    $scope.cards   = [];
    $scope.guesses = [];
    $scope.errors  = [];

    $scope.getAll = function() {
      Card.getAll(function(err, data) {
        if (err && err.reset) { return auth.resetEat(); }
        if(err) { return $scope.errors.push({msg: 'error retrieving cards'}); }

        $scope.cards   = data;
        $scope.guesses = [];
      });
    };

    $scope.isFriend = function(guess) {
      updateGuesses(guess);

      if (guess === $scope.cards.answer) {
        document.getElementsByName(guess)[0].style.backgroundColor = "green";
        showToast('Correct!!', 'correct');

        // send data to server & go to next card
        return submitAndNext($scope.guesses);
      }
      showToast('Wrong, Try Again!', 'incorrect');
        document.getElementsByName(guess)[0].style.backgroundColor = 'lightcoral';

      function showToast(message, className) {
        $mdToast.show({
          parent: 'main',
          template: '<md-toast class="md-toast ' + className + '">' + message + '</md-toast>',
          hideDelay: 1000,
          position: 'bottom left'
        });
      }
    };

    function submitAndNext(guesses) {
      var guessesObj = {
        _id:     $scope.cards._id,
        guesses: $scope.guesses
      };
      Card.update(guessesObj, function(err, data) {
        if (err && err.reset) { return auth.resetEat(); }
        if (err) { $scope.errors.push('Sorry, something went wrong & we could not save last card score'); }
        if ($location.path() === '/cards') {
          return ($timeout($scope.redirectCards2, 500));
        }
        return ($timeout($scope.redirectCards, 500));
      });
    }

    $scope.redirectCards = function() {
      $location.path('/cards');
    };

    $scope.redirectCards2 = function() {
      $location.path('/cards2');
    };

    // Add name to guesses array, if not already in
    function updateGuesses(name) {
      if (!(_.includes($scope.guesses, name))) {
        $scope.guesses.push(name);
      }
    }

    $scope.createNewCard = function(card) {
      var newCard = copy(card);
      card = empty(card);
      $scope.cards.push(newCard);
      Card.create(newCard, function(err, data) {
        if(err) return $scope.errors.push({msg: 'could not save new card' + newCard.personName});
        $scope.cards.splice($scope.cards.indexOf(newCard), 1, data);
      });
    };

    $scope.removeCard = function(card) {
      $scope.cards.splice($scope.cards.indexOf(card), 1);
      Card.remove(card, function(err) {
        if(err) {
          $scope.errors.push({msg: 'could not remove card: ' + card.personName});
        }
      });
    };

    $scope.saveCard = function(card) {
      card.editing = false;
      Card.save(card, function(err, data) {
        if(err) $scope.errors.push({msg: 'could not update card'});
      });
    };

    $scope.toggleEdit = function(card) {
      if(card.editing) {
        card.personName = card.personNameBackup;
        card.personPic = card.personPicBackup;
        card.personNameBackup = undefined;
        card.personPicBackup = undefined;
        card.editing = false;
      } else {
        card.personNameBackup = card.personName;
        card.personPicBackup = card.personPic;
        card.editing = true;
      }
    };

    $scope.clearErrors = function() {
      $scope.errors = [];
      $scope.getAll();
    };

  }]);
};
