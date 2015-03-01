var
  inquirer = require("inquirer"),
  fs = require('fs'),
  path = require('path'),
  exec = require('child_process').exec;

module.exports = {
  do: function(data, callback) {
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
        
        function exec(command,dir) {
          console.log('=>',command,' in ',dir);
          var child = exec(command, {cwd: dir});
          child.stdout.pipe(process.stdout);
          child.stderr.pipe(process.stderr);
        }
        
        
        var dir = path.join(process.cwd(), data.Genjsfile.config.outDir);
        var command = 'mvn spring-boot:run';
        
        exec(command, dir);
      }

    });
  }
};
