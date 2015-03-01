var
  inquirer = require("inquirer"),
  fs = require('fs'),
  path = require('path'),
  gfile = require('gfilesync'),
  yaml = require('js-yaml');

module.exports = {
  do: function(data, callback) {

    var dependenciesChoices = [
      {
        name: "Data - JDBC",
        value: "jdbc"
      },
      {
        name: "Data - JPA",
        value: "data-jpa"
      },
      {
        name: "Data - MongoDB",
        value: "data-mongodb"
      },
      {
        name: "Data - Redis",
        value: "redis"
      },
      {
        name: "Data - Gemfire",
        value: "gemfire"
      },
      {
        name: "Data - Solr",
        value: "solr"
      },
      {
        name: "Data - Elasticsearch",
        value: "elasticsearch"
      },
      {
        name: "Web - Websocket",
        value: "websocket"
      },
      {
        name: "Web - WS",
        value: "ws"
      },
      {
        name: "Web - Jersey (JAX-RS)",
        value: "jersey"
      },
      {
        name: "Web - Rest Repositories",
        value: "rest"
      },
      {
        name: "Web - Mobile",
        value: "mobile"
      },
      {
        name: "Web - Security",
        value: "security"
      },
      {
        name: "Core - AOP",
        value: "aop"
      },
      {
        name: "Core - Atomikos (JTA)",
        value: "jta-atomikos"
      },
      {
        name: "Core - Bitronix (JTA)",
        value: "jta-bitronix"
      },
      {
        name: "I/O - Batch",
        value: "batch"
      },
      {
        name: "I/O - Integration",
        value: "integration"
      },
      {
        name: "I/O - JMS - Hornetq",
        value: "hornetq"
      },
      {
        name: "I/O - AMQP",
        value: "amqp"
      },
      {
        name: "I/O - Mail",
        value: "mail"
      },
      {
        name: "Template Engines - Freemarker",
        value: "freemarker"
      },
      {
        name: "Template Engines - Velocity",
        value: "velocity"
      },
      {
        name: "Template Engines - Groovy Templates",
        value: "groovy-templates"
      },
      {
        name: "Template Engines - Thymeleaf",
        value: "thymeleaf"
      },
      {
        name: "Template Engines - Mustache",
        value: "mustache"
      },
      {
        name: "Social - Facebook",
        value: "social-facebook"
      },
      {
        name: "Social - Linkedin",
        value: "social-linkedin"
      },
      {
        name: "Social - Twitter",
        value: "social-twitter"
      },
      {
        name: "Ops - Actuator",
        value: "actuator"
      },
      {
        name: "Ops - Cloud Connectors",
        value: "cloud-connectors"
      },
      {
        name: "Ops - Remote Shell",
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
