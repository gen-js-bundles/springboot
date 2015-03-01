var
  inquirer = require("inquirer"),
  fs = require('fs'),
  path = require('path');

module.exports = {
  do: function(callback) {

    // Start
    var questions = [
      {
        type: 'confirm',
        name: 'start',
        message: 'Start the application ?',
        default: true
      }
    ];
    inquirer.prompt(questions, function( answers ) {

      if(answers.start) {
        console.log('start');
      }

    });
  }
};
