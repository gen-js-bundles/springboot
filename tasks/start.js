var
  inquirer = require("inquirer"),
  fs = require('fs'),
  path = require('path');

module.exports = (function Task() {
  function Task() {
  }
  Task.prototype.do = function(callback) {
    var $this = this;
    
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
        console.log($this);
        console.log($this.Genjsfile);
      }

    });
  };
  return Task;
})();
