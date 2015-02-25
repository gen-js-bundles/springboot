var
  inquirer = require("inquirer"),
  fs = require('fs'),
  path = require('path'),
  gfile = require('gfilesync');

module.exports = {
  askFor: function() {
    var questions = [
      {
        type: 'list',
        name: 'buildTool',
        message: 'Which build tool ?',
        choices: [{
          name: 'Maven',
          value: 'maven'
        },{
          name: 'Gradle',
          value: 'gradle'
        }],
        default: 'maven'
      }
    ];
    inquirer.prompt(questions, function( answers ) {
      if(answers.buildTool == 'maven') {
        gfile.copy(
          path.join(__dirname,'../model/config.@maven.yml'),
          path.join(process.cwd(),'model/config.@maven.yml'));
      }
      if(answers.buildTool == 'gradle') {
        gfile.copy(
          path.join(__dirname,'../model/config.@gradle.yml'),
          path.join(process.cwd(),'model/config.@gradle.yml'));
      }
    });
  }
};
