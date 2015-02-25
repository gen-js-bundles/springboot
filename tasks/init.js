var inquirer = require("inquirer");

module.exports = {
  askFor: function() {
    var questions = [
      {
        type: 'input',
        name: 'name',
        message: 'Name'
      }
    ];
    inquirer.prompt(questions, function( answers ) {
      console.log(answers.name);
    });
  }
};
