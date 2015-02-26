var
  inquirer = require("inquirer"),
  fs = require('fs'),
  path = require('path'),
  gfile = require('gfilesync'),
  yaml = require('js-yaml');

module.exports = {
  askFor: function(callback) {

    var dependenciesChoices = [
      {
        name: "jdbc",
        value: "jdbc"
      },
      {
        name: "jpa",
        value: "data-jpa"
      },
      {
        name: "mongodb",
        value: "data-mongodb"
      },
      {
        name: "redis",
        value: "redis"
      },
      {
        name: "gemfire",
        value: "gemfire"
      },
      {
        name: "solr",
        value: "solr"
      },
      {
        name: "elasticsearch",
        value: "elasticsearch"
      },
      {
        name: "websocket",
        value: "websocket"
      },
      {
        name: "ws",
        value: "ws"
      },
      {
        name: "jersey",
        value: "jersey"
      },
      {
        name: "rest",
        value: "rest"
      },
      {
        name: "mobile",
        value: "mobile"
      },
      {
        name: "security",
        value: "security"
      },
      {
        name: "aop",
        value: "aop"
      },
      {
        name: "jta-atomikos",
        value: "jta-atomikos"
      },
      {
        name: "jta-bitronix",
        value: "jta-bitronix"
      },
      {
        name: "batch",
        value: "batch"
      },
      {
        name: "integration",
        value: "integration"
      },
      {
        name: "hornetq",
        value: "hornetq"
      },
      {
        name: "amqp",
        value: "amqp"
      },
      {
        name: "mail",
        value: "mail"
      },
      {
        name: "freemarker",
        value: "freemarker"
      },
      {
        name: "velocity",
        value: "velocity"
      },
      {
        name: "groovy-templates",
        value: "groovy-templates"
      },
      {
        name: "thymeleaf",
        value: "thymeleaf"
      },
      {
        name: "social-facebook",
        value: "social-facebook"
      },
      {
        name: "social-linkedin",
        value: "social-linkedin"
      },
      {
        name: "social-twitter",
        value: "social-twitter"
      },
      {
        name: "actuator",
        value: "actuator"
      },
      {
        name: "cloud-connectors",
        value: "cloud-connectors"
      },
      {
        name: "remote-shell",
        value: "remote-shell"
      }
    ];

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
      },
      {
        type: 'checkbox',
        name: 'dependenciesSelected',
        message: 'Which dependencies ?',
        choices: dependenciesChoices
      }
    ];
    inquirer.prompt(questions, function( answers ) {
      /*
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
      */

      var data = gfile.loadYaml(path.join(process.cwd(),'Genjsfile.yml'));

      if(data.global == null) {
        data.global = {};
      }
      if(data.global.project == null) {
        data.global.project = {};
      }
      if(data.global.project.name == null) {
        data.global.project.name = 'myapp';
      }
      if(data.global.project.version == null) {
        data.global.project.version = '0.1';
      }
      if(data.global.project.description == null) {
        data.global.project.description = '';
      }

      if(data.global.maven == null) {
        data.global.maven = {};
      }
      if(data.global.maven.groupId == null) {
        data.global.maven.groupId = 'demo';
      }
      if(data.global.maven.artifactId == null) {
        data.global.maven.artifactId = 'myapp';
      }
      if(data.global.maven.packaging == null) {
        data.global.maven.packaging = 'war'
      }

      if(data.global.version == null) {
        data.global.version = {};
      }
      if(data.global.version.springboot == null) {
        data.global.version.springboot = '1.2.1';
      }
      if(data.global.version.java == null) {
        data.global.version.java = '1.8';
      }

      gfile.writeYaml(path.join(process.cwd(),'Genjsfile.yml'), data);

      var dependencies = [];
      for(var i = 0; i<dependenciesChoices.length; i++) {
        var isSelected = false;
        for (var j = 0; j < answers.dependenciesSelected.length && !isSelected; j++) {
          if(answers.dependenciesSelected[j] == dependenciesChoices[i].value) {
            isSelected = true;
          }
        }
        var dependency = {};
        dependency[dependenciesChoices[i].value] = isSelected;
        dependencies.push(dependency);
      }
      var data = {
        dependencies: dependencies
      };

      gfile.writeYaml(path.join(process.cwd(),'model','config.@'+answers.buildTool+'.yml'), data);

      if(callback) {
        callback();
      }
    });
  }
};
