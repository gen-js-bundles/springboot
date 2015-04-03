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
        name: "Test - Spring Boot Test",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-test",
            scope: "test"
          }
        }
      },
      {
        name: "Security",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-security"
          },
          facets: ['security']
        }
      },
      {
        name: "Spring Cloud - Eureka",
        value: {
          dependency: {
            groupId: "org.springframework.cloud",
            artifactId: "spring-cloud-starter-eureka-server",
            isSpringCloud: true
          }
        }
      },
      {
        name: "Spring Cloud - Hystrix",
        value: {
          dependency: {
            groupId: "org.springframework.cloud",
            artifactId: "spring-cloud-starter-hystrix",
            isSpringCloud: true
          }
        }
      },
      {
        name: "Spring Cloud - Config Client",
        value: {
          dependency: {
            groupId: "org.springframework.cloud",
            artifactId: "spring-cloud-config-client",
            isSpringCloud: true
          }
        }
      },
      {
        name: "Spring Data - JDBC",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-jdbc"
          }
        }
      },
      {
        name: "Spring Data - JPA",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-data-jpa"
          }
        }
      },
      {
        name: "Spring Data - MongoDB",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-data-mongodb"
          }
        }
      },
      {
        name: "Spring Data - Redis",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-redis"
          }
        }
      },
      {
        name: "Spring Data - Gemfire",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-data-gemfire"
          }
        }
      },
      {
        name: "Spring Data - Solr",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-data-solr"
          }
        }
      },
      {
        name: "Spring Data - Elasticsearch",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-data-elasticsearch"
          }
        }
      },
      {
        name: "Database Driver - Derby",
        value: {
          dependency: {
            groupId: "org.apache.derby",
            artifactId: "derby"
          }
        }
      },
      {
        name: "Database Driver - H2",
        value: {
          dependency: {
            groupId: "com.h2database",
            artifactId: "h2"
          }
        }
      },
      {
        name: "Database Driver - HSQLDB",
        value: {
          dependency: {
            groupId: "org.hsqldb",
            artifactId: "hsqldb"
          }
        }
      },
      {
        name: "Database Driver - MySQL",
        value: {
          dependency: {
            groupId: "mysql",
            artifactId: "mysql-connector-java"
          }
        }
      },
      {
        name: "Web - Web",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-web"
          },
          facets: ['web']
        }
      },
      {
        name: "Web - Websocket",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-websocket"
          }
        }
      },
      {
        name: "Web - WS (WebServices)",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-ws"
          }
        }
      },
      {
        name: "Web - Jersey (JAX-RS)",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-jersey"
          }
        }
      },
      {
        name: "Web - Rest Repositories",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-data-rest"
          }
        }
      },
      {
        name: "Web - Mobile",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-mobile"
          }
        }
      },
      {
        name: "Core - AOP",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-aop"
          }
        }
      },
      {
        name: "Core - Atomikos (JTA)",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-jta-atomikos"
          }
        }
      },
      {
        name: "Core - Bitronix (JTA)",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-jta-bitronix"
          }
        }
      },
      {
        name: "I/O - Batch",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-batch"
          }
        }
      },
      {
        name: "I/O - Integration",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-integration"
          }
        }
      },
      {
        name: "I/O - JMS - Hornetq",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-hornetq"
          }
        }
      },
      {
        name: "I/O - AMQP",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-amqp"
          }
        }
      },
      {
        name: "I/O - Mail",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-mail"
          }
        }
      },
      {
        name: "Template Engines - Freemarker",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-freemarker"
          }
        }
      },
      {
        name: "Template Engines - Velocity",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-velocity"
          }
        }
      },
      {
        name: "Template Engines - Groovy Templates",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-groovy-templates"
          }
        }
      },
      {
        name: "Template Engines - Thymeleaf",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-thymeleaf"
          }
        }
      },
      {
        name: "Template Engines - Mustache",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-mustache"
          }
        }
      },
      {
        name: "Social - Facebook",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-social-facebook"
          }
        }
      },
      {
        name: "Social - Linkedin",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-social-linkedin"
          }
        }
      },
      {
        name: "Social - Twitter",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-social-twitter"
          }
        }
      },
      {
        name: "Ops - Actuator - Hystrix Metrics Stream",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-actuator"
          }
        }
      },
      {
        name: "Ops - Cloud Connectors",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-cloud-connectors"
          }
        }
      },
      {
        name: "Ops - Remote Shell",
        value: {
          dependency: {
            groupId: "org.springframework.boot",
            artifactId: "spring-boot-starter-remote-shell"
          }
        }
      }
    ];

    var questions = [
      {
        type: 'list',
        name: 'javaVersion',
        message: 'Which Java version ?',
        choices: [{
          name: '1.8',
          value: '1.8'
        },{
          name: '1.7',
          value: '1.7'
        },{
          name: '1.6',
          value: '1.6'
        },{
          name: '1.5',
          value: '1.5'
        }],
        default: '1.8'
      },
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
        type: 'list',
        name: 'packaging',
        message: 'Which packaging ?',
        choices: [{
          name: 'Jar',
          value: 'jar'
        },{
          name: 'War',
          value: 'war'
        }],
        default: 'jar'
      },
      {
        type: 'input',
        name: 'serverPort',
        message: 'Which server port ?',
        default: '8080'
      },
      {
        type: 'checkbox',
        name: 'dependenciesSelected',
        message: 'Which dependencies ?',
        choices: dependenciesChoices
      },
      {
        type: 'confirm',
        name: 'wro4j',
        message: 'Use wro4j to manage static resources ?',
        default: true,
        when: function(answers) {
          var hasWeb = false;
          if(answers.dependenciesSelected != null) {
            for (var i = 0; i < answers.dependenciesSelected.length; i++) {
              var facets = answers.dependenciesSelected[i].facets;
              if( facets != null) {
                for (var j = 0; j < facets.length; j++) {
                  if (facets[j] == 'web') {
                    hasWeb = true;
                  }
                }
              }
            }
          }
          return hasWeb;
        }
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
        data.global.maven.packaging = answers.packaging;
      }

      if(data.global.version == null) {
        data.global.version = {};
      }
      data.global.version.springboot = '1.2.2';
      if(data.global.version.java == null) {
        data.global.version.java = answers.javaVersion;
      }

      var isSpringCloud = false;
      for(var i=0; i<answers.dependenciesSelected.length; i++) {
        var dependency = answers.dependenciesSelected[i];
        if(dependency.isSpringCloud) {
          isSpringCloud = true
        }
      }
      if(isSpringCloud) {
        data.global.version.springcloud = '1.0.0.RELEASE';
      }

      if(data.global.build == null) {
        data.global.build = {};
      }
      data.global.build.tool = answers.buildTool;

      if(data.global.server == null) {
        data.global.server = {};
      }
      data.global.server.port = answers.serverPort;

      var facets = {};
      for(var i=0; i<answers.dependenciesSelected.length; i++) {
        var dependencyFacets = answers.dependenciesSelected[i].facets;
        if(dependencyFacets != null) {
          for (var j = 0; j<dependencyFacets.length; j++) {
            if(facets == null) {
              facets = {};
            }
            facets[dependencyFacets[j]] = true;
          }
        }
      }
      if(answers.wro4j) {
        facets.wro4j = true;
      }
      data.global.facets = facets;

      gfile.writeYaml(path.join(process.cwd(),'Genjsfile.yml'), data);

      var data = {
        dependencies: [],
        properties: {}
      };
      for(var i=0; i<answers.dependenciesSelected.length; i++) {
        data.dependencies.push(answers.dependenciesSelected[i].dependency);
      }
      if(answers.wro4j) {
        data.properties = {
          'wro4j.version': '1.7.6'
        };
      }

      gfile.writeYaml(path.join(process.cwd(),'model','config.@build.yml'), data);

      console.log(facets);
      console.log(facets.security);
      if(facets.security) {
        var data = {
          user: {
            name: 'user',
            password: 'user',
            role: 'USER'
          }
        };
        gfile.writeYaml(path.join(process.cwd(),'model','config.@security.yml'), data);
      }

      if(callback) {
        callback();
      }
    });
  }
};
