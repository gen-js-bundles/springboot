var
  inquirer = require("inquirer"),
  chalk = require('chalk'),
  Q = require('q'),
  fs = require('fs'),
  path = require('path'),
  gfile = require('gfilesync'),
  mkdirp = require('mkdirp'),
  yaml = require('js-yaml'),
  GenJS = require('genjs');

var Task = (function() {
  function Task() {
  }
  Task.prototype.do = function(data, callback) {
    this.doMain(data, callback);
  };
  Task.prototype.getEntities = function() {
    var entities = {};
    for(var entityId in this.genJS.entities) {
      var entity = this.genJS.entities[entityId];
      if(this.hasTagDomain(entity)) {
        entities[entityId] = entity;
      }
    }
    return entities;
  };
  Task.prototype.hasTagDomain = function(entity) {
    for(var tagId in entity.tags) {
      if(tagId == 'web') {
        if(entity.tags != null && entity.tags.web != null && entity.tags.web.paths != null) {
          return true;
        }
      }
    }
    return false;
  };
  Task.prototype.loadGenJS = function(data) {
    this.genJS = new GenJS(data.Genjsfile);
    this.genJS.load();
  };
  Task.prototype.showWebURIs = function() {
    console.log('=> Web URIs:');
    var entities = this.getEntities();
    for(var entityId in entities) {
      var entity = entities[entityId];
      this.showOneEntity(entity);
    }
    console.log('');
  };
  Task.prototype.showEntity = function(entity) {
    this.showOneEntity(entity);
    console.log('');
  };
  Task.prototype.showOneEntity = function(entity) {
    console.log('');
    console.log(chalk.red.bold(entity.id));
    var hasPath = false;
    for(var pathId in entity.tags.web.paths) {
      hasPath = true;
      var path = entity.tags.web.paths[pathId];
      path.id = pathId;
      this.showOnePath(path);
    }
    if(!hasPath) {
      console.log('  < no path >');
    }
  };
  Task.prototype.showPath = function(path, entity) {
    console.log('');
    console.log(chalk.red.bold(entity.id));
    this.showOnePath(path);
    console.log('');
  };
  Task.prototype.showOnePath = function(path) {
    console.log(chalk.blue('  '+path.id));

    for(var methodId in path.methods) {
      var method = path.methods[methodId];
      method.id = methodId;
      this.showOneMethod(method);
    }
  };
  Task.prototype.showMethod = function(method, path, entity) {
    console.log('');
    console.log(chalk.red.bold(entity.id));
    console.log(chalk.blue('  '+path.id));
    this.showOneMethod(method);
    console.log('');
  };
  Task.prototype.showOneMethod = function(method) {
    console.log(chalk.blue('    '+method.id));
    if(method.name != null) {
      console.log('      name', ':', chalk.magenta(method.name));
    }
    if(method.return != null) {
      console.log('      return', ':', chalk.magenta(method.return));
    }
    if(method.params != null) {
      console.log('      parameters', ':');
      for(var paramId in method.params) {
        var param = method.params[paramId];
        param.id = paramId;
        this.showOneParam(param, '        ');
      }
    }
  };
  Task.prototype.showOneParam = function(param, indent) {
    console.log(chalk.blue(indent+param.id),':',chalk.magenta(param.type));
    if(param.valid != null && param.valid) {
      console.log(indent+'  @Valid');
    }
    if(param.pathVariable != null) {
      var out = indent+'  @PathVariable';
      if(param.pathVariable.name != null) {
        out += '("'+param.pathVariable.name+'")';
      }
      console.log(out);
    }
    if(param.requestParam != null) {
      var out = indent+'  @RequestParam';
      var hasArg = false;
      if(param.requestParam.value != null) {
        if(!hasArg) {hasArg=true; out += '(';} else {out += ', ';}
        out += 'value="'+param.requestParam.value+'"';
      }
      if(param.requestParam.required != null) {
        if(!hasArg) {hasArg=true; out += '(';} else {out += ', ';}
        out += 'required='+param.requestParam.required;
      }
      if(param.requestParam.defaultValue != null) {
        if(!hasArg) {hasArg=true; out += '(';} else {out += ', ';}
        out += 'defaultValue="'+param.requestParam.defaultValue+'"';
      }
      out += ')';
      console.log(out);
    }
  };
  Task.prototype.showOneParam_old = function(param) {
    var out = chalk.blue('        '+param.id);
    out += ' : ';
    out += chalk.magenta(param.type);
    if(param.valid != null && param.valid) {
      out += ' @Valid';
    }
    if(param.pathVariable != null) {
      out += ' @PathVariable';
      if(param.pathVariable.name != null) {
        out += '("'+param.pathVariable.name+'")';
      }
    }
    if(param.requestParam != null) {
      out += ' @RequestParam';
      if(param.requestParam.value != null) {
        out += '(value="'+param.requestParam.value+'")';
      }
      if(param.requestParam.required != null) {
        out += '(required="'+param.requestParam.required+'")';
      }
      if(param.requestParam.defaultValue != null) {
        out += '(defaultValue="'+param.requestParam.defaultValue+'")';
      }
    }
    console.log(out);
  };
  Task.prototype.cleanEntity = function(entity) {
    var entityClean = {};
    for(var eltId in entity) {
      if(eltId != 'id' && eltId != 'fields' && eltId != 'tags' && eltId != 'links') {
        entityClean[eltId] = entity[eltId];
      }
    }
    if(entity.tags.web.paths != null) {
      entityClean.tags = {
        web: {
          paths: {}
        }
      };
      for (var pathId in entity.tags.web.paths) {
        var path = entity.tags.web.paths[pathId];
        var pathClean = {};
        entityClean.tags.web.paths[pathId] = pathClean;
        for(var eltId in path) {
          if(eltId != 'id' && eltId != 'methods') {
            pathClean[eltId] = path[eltId];
          }
          if(path.methods != null) {
            var methods = path.methods;
            pathClean.methods = {};
            for(var methodId in path.methods) {
              var method = path.methods[methodId];
              var methodClean = {};
              pathClean.methods[methodId] = methodClean;
              for(var eltMethod in method) {
                if(eltMethod != 'id') {
                  methodClean[eltMethod] = method[eltMethod];
                }
              }
            }
          }
        }
      }
    }
    return entityClean;
  };
  Task.prototype.writeEntity = function(entity) {
    var entityToSave = this.cleanEntity(entity);
    var modelDir = this.genJS.modelDirs[0];
    mkdirp.sync(path.join(modelDir,'@web'));
    try {
      gfile.writeYaml(path.join(modelDir, '@web', entity.id + '.yml'), entityToSave);
    } catch(e) {
      console.log('Error for writing data',entityToSave);
      throw e;
    }
  };
  Task.prototype.deleteEntity = function(entity) {
    var modelDir = this.genJS.modelDirs[0];
    fs.unlinkSync(path.join(modelDir,'@web',entity.id+'.yml'));
  };
  Task.prototype.doMain = function(data, callback) {
    this.loadGenJS(data);
    this.showWebURIs();
    var choices = [];
    var entities = this.getEntities();
    choices.push({
      name: 'Exit',
      value: null
    });
    choices.push(new inquirer.Separator());
    choices.push({
      name: 'Add entity',
      value: 'add'
    });
    if(entities != null && Object.keys(entities).length > 0) {
      choices.push({
        name: 'Remove entity',
        value: 'remove'
      });
      choices.push(new inquirer.Separator());
      var entities = this.getEntities();
      for (var entityId in entities) {
        var entity = entities[entityId];
        choices.push({
          value: entity,
          name: entity.name,
          checked: false
        });
      }
    }
    var questions = [
      {
        type: 'list',
        name: 'action',
        message: 'Action',
        choices: choices
      }
    ];
    inquirer.prompt(questions, function( answers ) {
      if(answers.action == 'add') {
        this.doAddEntity(data, function (entity) {
          if(entity == null) {
            this.doMain(data, callback);
          } else {
            this.doEditEntity(entity, data, function () {
              this.doMain(data, callback);
            }.bind(this));
          }
        }.bind(this));
      }
      else if(answers.action == 'remove') {
        this.doSelectEntity(data, function (entity) {
          if(entity == null) {
            this.doMain(data, callback);
          } else {
            this.doRemoveEntity(entity, data, function () {
              this.doMain(data, callback);
            }.bind(this))
          }
        }.bind(this));
      }
      else if(answers.action != null) {
        var entity = answers.action;
        this.doEditEntity(entity, data, function () {
          this.doMain(data, callback);
        }.bind(this));
      }
      if(callback) {
        callback();
      }
    }.bind(this));
  };
  Task.prototype.doAddEntity = function(data, callback) {
    var questions = [
      {
        type: 'input',
        name: 'entityName',
        message: 'Entity name'
      }
    ];
    inquirer.prompt(questions, function( answers ) {
      console.log(answers.entityName);
      if(answers.entityName == null || answers.entityName == '') {
        callback(null);
      } else {
        var entity = {
          id: answers.entityName,
          name: answers.entityName,
          tags: {
            web: {
              paths: {

              }
            }
          }
        };
        this.writeEntity(entity);
        this.loadGenJS(data);
        callback(entity);
      }
    }.bind(this));
  };
  Task.prototype.doSelectEntity = function(data, callback) {
    var entitiesChoices = [];
    entitiesChoices.push({
      name: 'Exit',
      value: null
    });
    entitiesChoices.push(new inquirer.Separator());
    var entities = this.getEntities();
    for (var entityId in entities) {
      var entity = entities[entityId];
      entitiesChoices.push({
        value: entity,
        name: entity.name,
        checked: false
      });
    }
    var questions = [
      {
        type: 'list',
        name: 'entity',
        message: 'Entity',
        choices: entitiesChoices
      }
    ];
    inquirer.prompt(questions, function( answers ) {
      callback(answers.entity);
    }.bind(this));
  };
  Task.prototype.doRemoveEntity = function(entity, data, callback) {
    if(entity == null) {
      callback();
      return;
    }
    var questions = [
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Confirm remove entity: '+entity.id,
        default: true
      }
    ];
    inquirer.prompt(questions, function( answers ) {
      if(answers.confirm) {
        this.deleteEntity(entity);
      }
      callback();
    }.bind(this));
  };

  Task.prototype.doEditEntity = function(entity, data, callback) {
    if(entity == null) {
      callback();
      return;
    }
    this.loadGenJS(data);
    var entities = this.getEntities();
    entity = entities[entity.id];
    this.showEntity(entity);
    var choices = [];
    choices.push({
      name: 'Exit',
      value: ''
    });
    choices.push(new inquirer.Separator());
    choices.push({
      name: 'Add path',
      value: 'addPath'
    });
    if(entity.tags.web.paths != null && Object.keys(entity.tags.web.paths).length > 0) {
      choices.push({
        name: 'Remove path',
        value: 'removePath'
      });
      choices.push(new inquirer.Separator());
      for (var pathId in entity.tags.web.paths) {
        var path = entity.tags.web.paths[pathId];
        path.id = pathId;
        choices.push({
          value: path,
          name: pathId,
          checked: false
        });
      }
    }

    var questions = [
      {
        type: 'list',
        name: 'action',
        message: 'Action on the entity : '+entity.id,
        choices: choices
      }
    ];
    inquirer.prompt(questions, function( answers ) {
      if(answers.action == 'addPath') {
        this.doAddPath(entity, data, function() {
          if(path == null) {
            this.doEditEntity(entity, data, callback);
          } else {
            this.doEditPath(path, entity, data, function () {
              this.doEditEntity(entity, data, callback);
            }.bind(this));
          }
        }.bind(this));
      }
      else if(answers.action == 'removePath') {
        this.doSelectPath(entity, data, function(path) {
          if(path == null) {
            this.doEditEntity(entity, data, callback);
          } else {
            this.doRemovePath(path, entity, data, function () {
              this.doEditEntity(entity, data, callback);
            }.bind(this))
          }
        }.bind(this));
      }
      else if(answers.action != '') {
        var path = answers.action;
        this.doEditPath(path, entity, data, function () {
          this.doEditEntity(entity, data, callback);
        }.bind(this));
      }
      if(answers.action == '') {
        if(callback) {
          callback();
        }
      }
    }.bind(this));
  };

  Task.prototype.doSelectPath = function(entity, data, callback) {
    if(entity == null) {
      callback();
      return;
    }
    var pathsChoices = [];
    pathsChoices.push({
      name: 'Exit',
      value: null
    });
    pathsChoices.push(new inquirer.Separator());
    for (var pathId in entity.tags.web.paths) {
      var path = entity.tags.web.paths[pathId];
      path.id = pathId;
      pathsChoices.push({
        value: path,
        name: pathId,
        checked: false
      });
    }
    var questions = [
      {
        type: 'list',
        name: 'path',
        message: 'Path',
        choices: pathsChoices
      }
    ];
    inquirer.prompt(questions, function( answers ) {
      callback(answers.path);
    }.bind(this));
  };

  Task.prototype.doAddPath = function(entity, data, callback) {
    if(entity == null) {
      callback();
      return;
    }
    var questions = [
      {
        type: 'input',
        name: 'id',
        message: 'Path name'
      }
    ];
    inquirer.prompt(questions, function( answers ) {
      if(answers.name == '') {
        callback(null);
      } else {
        var path = {
          id: answers.id
        };
        entity.tags.web.paths[answers.id] = path;
        this.writeEntity(entity);
        callback(path);
      }
    }.bind(this));
  };

  Task.prototype.doRemovePath = function(path, entity, data, callback) {
    if(path == null) {
      callback();
      return;
    }
    var questions = [
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Confirm remove path: '+entity.id+'.'+path.id,
        default: true
      }
    ];
    inquirer.prompt(questions, function( answers ) {
      if(answers.confirm) {
        delete entity.tags.web.paths[path.id];
        this.writeEntity(entity);
      }
      callback();
    }.bind(this));
  };

  Task.prototype.doEditPath = function(path, entity, data, callback) {
    if(path == null) {
      callback();
      return;
    }
    this.loadGenJS(data);
    var entities = this.getEntities();
    entity = entities[entity.id];
    var pathId = path.id;
    path = entity.tags.web.paths[path.id];
    path.id = pathId;
    this.showPath(path, entity);
    var choices = [];
    choices.push({
      name: 'Exit',
      value: ''
    });
    choices.push(new inquirer.Separator());
    choices.push({
      name: 'Add method',
      value: 'addMethod'
    });
    if(path.methods != null && Object.keys(path.methods).length > 0) {
      choices.push({
        name: 'Remove method',
        value: 'removeMethod'
      });
      choices.push(new inquirer.Separator());
      for (var methodId in path.methods) {
        var method = path.methods[methodId];
        method.id = methodId;
        choices.push({
          value: method,
          name: methodId,
          checked: false
        });
      }
    }

    var questions = [
      {
        type: 'list',
        name: 'action',
        message: 'Action on the path : '+path.id,
        choices: choices
      }
    ];
    inquirer.prompt(questions, function( answers ) {
      if(answers.action == 'addMethod') {
        this.doAddMethod(path, entity, data, function(method) {
          if(method == null) {
            this.doEditPath(path, entity, data, callback);
          } else {
            this.doEditMethod(method, path, entity, data, function () {
              this.doEditPath(path, entity, data, callback);
            }.bind(this))
          }
        }.bind(this));
      }
      else if(answers.action == 'removeMethod') {
        this.doSelectMethod(path, entity, data, function(method) {
          if(method == null) {
            this.doEditPath(path, entity, data, callback);
          } else {
            this.doRemoveMethod(method, path, entity, data, function () {
              this.doEditPath(path, entity, data, callback);
            }.bind(this))
          }
        }.bind(this));
      }
      else if(answers.action != '') {
        var method = answers.action;
        this.doEditMethod(method, path, entity, data, function () {
          this.doEditPath(path, entity, data, callback);
        }.bind(this));
      }
      if(answers.action == '') {
        if(callback) {
          callback();
        }
      }
    }.bind(this));
  };
  Task.prototype.doSelectMethod = function(path, entity, data, callback) {
    if(path == null) {
      callback();
      return;
    }
    var methodsChoices = [];
    methodsChoices.push({
      name: 'Exit',
      value: null
    });
    methodsChoices.push(new inquirer.Separator());
    for (var methodId in path.methods) {
      var method = path.methods[methodId];
      method.id = methodId;
      methodsChoices.push({
        value: method,
        name: methodId,
        checked: false
      });
    }
    var questions = [
      {
        type: 'list',
        name: 'method',
        message: 'Method',
        choices: methodsChoices
      }
    ];
    inquirer.prompt(questions, function( answers ) {
      callback(answers.method);
    }.bind(this));
  };

  Task.prototype.doAddMethod = function(path, entity, data, callback) {
    if(path == null) {
      callback();
      return;
    }
    var methodChoices = [];
    var methods = {
      'GET': true,
      'POST': true,
      'PUT': true,
      'DELETE': true,
      'PATCH': true,
      'OPTIONS': true
    };
    for(var method in path.methods) {
      methods[method] = false;
    }
    for(var method in methods) {
      if(methods[method]) {
        methodChoices.push({
          name: method,
          value: method
        });
      }
    }

    var mediaTypes = [
      "application/json",
      "application/xml"
    ];
    var mediaTypesChoices = [];
    for(var i=0; i<mediaTypes.length; i++) {
      mediaTypesChoices.push({
        name: mediaTypes[i],
        value: mediaTypes[i]
      });
    }

    var questions = [
      {
        type: 'list',
        name: 'id',
        message: 'Method HTTP',
        choices: methodChoices
      }
    ];

    inquirer.prompt(questions, function( answers ) {
      if(answers.name == '') {
        callback(null);
      } else {
        var method = {
          id: answers.id
        };
        if(path.methods == null) {
          path.methods = {};
        }
        path.methods[answers.id] = method;
        this.writeEntity(entity);
        callback(method);
      }
    }.bind(this));
  };

  Task.prototype.doEditMethod = function(method, path, entity, data, callback) {
    if(path == null) {
      callback();
      return;
    }

    this.showMethod(method, path, entity);
    var $this = this;
    var showOneMethod = this.showOneMethod;
    var showOneParam = this.showOneParam;

    var mediaTypes = [
      "application/json",
      "application/xml"
    ];
    var mediaTypesChoices = [];
    for(var i=0; i<mediaTypes.length; i++) {
      mediaTypesChoices.push({
        name: mediaTypes[i],
        value: mediaTypes[i]
      });
    }

    var questions = [
      {
        type: 'input',
        name: 'name',
        message: 'Method name',
        default: function() {
          if(method.name != null) {
            return method.name;
          }
          var pathName = path.id;
          while(pathName.indexOf('/') != -1) {
            var pos = pathName.indexOf('/');
            pathName = pathName.substring(0,pos) + pathName.charAt(pos+1).toUpperCase() + pathName.substring(pos+2);
          }
          if(pathName.lastIndexOf('s') == pathName.length-1) {
            if(method.id == 'GET') {
              return 'getAll'+pathName;
            }
          } else {
            if(method.id == 'GET') {
              return 'getOne'+pathName;
            }
          }
        }
      },
      {
        type: 'input',
        name: 'return',
        message: 'Method return',
        default: function() {
          if(method.return != null) {
            return method.return;
          } else {
            var pathName = path.id;
            var pos = pathName.lastIndexOf('/');
            pathName = pathName.charAt(pos+1).toUpperCase() + pathName.substring(pos+2);
            if(path.id.lastIndexOf('s') == path.id.length-1) {
              pathName = pathName.substring(0,pathName.length-1);
              if(method.id == 'GET') {
                return 'List<'+pathName+'>';
              }
            } else {
              if(method.id == 'GET') {
                return pathName;
              }
            }
          }
        }
      },
      {
        type: 'confirm',
        name: 'hasRequestBody',
        message: 'Has request body ?',
        default: function(answers) {
          return method.hasRequestBody != null;
        }
      },
      {
        type: 'list',
        name: 'consumes',
        message: 'Request body format (consumes) ?',
        choices: mediaTypesChoices,
        default: function(answers) {
          return method.consumes;
        },
        when: function(answers) {
          return answers.hasRequestBody;
        }
      },
      {
        type: 'confirm',
        name: 'hasResponseBody',
        message: 'Has response body ?',
        default: function(answers) {
          return method.hasResponseBody != null;
        }
      },
      {
        type: 'list',
        name: 'produces',
        message: 'Response body format (produces) ?',
        choices: mediaTypesChoices,
        default: function(answers) {
          return method.produces;
        },
        when: function(answers) {
          return answers.hasResponseBody;
        }
      }
    ];
    inquirer.prompt(questions, function( answers ) {
      if(answers.name == '') {
        callback(null);
      } else {

        method.name = answers.name;

        if(answers.return == '') {
          delete method.return;
        } else {
          method.return = answers.return;
        }

        if(answers.hasRequestBody == null || ! answers.hasRequestBody) {
          delete method.hasRequestBody;
        }
        if(answers.hasRequestBody) {
          method.hasRequestBody = answers.hasRequestBody;
        }

        if(answers.consumes == null) {
          delete method.consumes;
        }
        if(answers.consumes) {
          method.consumes = answers.consumes;
        }

        if(answers.hasResponseBody == null || ! answers.hasResponseBody) {
          delete method.hasResponseBody;
        }
        if(answers.hasResponseBody) {
          method.hasResponseBody = answers.hasResponseBody;
        }

        if(answers.produces == null) {
          delete method.produces;
        }
        if(answers.produces) {
          method.produces = answers.produces;
        }

        $this.showMethod(method, path, entity);
        $this.writeEntity(entity);

        var paramInquirer = (function paramInquirer(method) {

          var parameterChoices = [];
          for(var paramId in method.params) {
            var param = method.params[paramId];
            param.id = paramId;
            parameterChoices.push({
              name: param.id + ' : ' + param.type,
              value: param
            })
          }

          var parameterActionChoices = [];
          parameterActionChoices.push({
            name: 'Exit',
            value: null
          });
          parameterActionChoices.push(new inquirer.Separator());
          parameterActionChoices.push(
            {
              name: 'Add parameter',
              value: 'add'
            }
          );
          if(parameterChoices.length > 0) {
            parameterActionChoices.push({
                name: 'Remove parameter',
                value: 'remove'
              });
            parameterActionChoices.push(new inquirer.Separator());
            for(var i=0; i<parameterChoices.length; i++) {
              parameterActionChoices.push(parameterChoices[i]);
            }
          }

          var parameterRemoveChoices = [];
          parameterRemoveChoices.push({
            name: 'Exit',
            value: null
          });
          parameterRemoveChoices.push(new inquirer.Separator());
          if(parameterChoices.length > 0) {
            for(var i=0; i<parameterChoices.length; i++) {
              parameterRemoveChoices.push(parameterChoices[i]);
            }
          }

          var paramTypesChoices = [
            {
              name: 'Other type',
              value: 'Other type'
            },
            new inquirer.Separator(),
            {
              name: 'String',
              value: 'String'
            },
            {
              name: 'Integer',
              value: 'Integer'
            },
            {
              name: 'RedirectAttributes',
              value: 'RedirectAttributes'
            },
            {
              name: 'BindingResult',
              value: 'BindingResult'
            },
            {
              name: 'Model',
              value: 'Model'
            }
          ];

          var questions = [
            {
              type: 'list',
              name: 'paramAction',
              message: 'Parameter action',
              choices: parameterActionChoices
            },
            {
              type: 'list',
              name: 'paramToRemove',
              message: 'Parameter to remove',
              when: function(answers) {
                return answers.paramAction == 'remove';
              },
              choices: parameterRemoveChoices
            },
            {
              type: 'input',
              name: 'paramName',
              message: 'Parameter name',
              when: function(answers) {
                return answers.paramAction != null && answers.paramAction !== 'remove';
              },
              default: function(answers) {
                if(answers.paramAction !== 'add') {
                  console.log('');
                  showOneParam(answers.paramAction, '');
                  console.log('');
                  return answers.paramAction.id;
                };
              }
            },
            {
              type: 'list',
              name: 'paramType',
              message: 'Parameter type',
              choices: paramTypesChoices,
              when: function (answers) {
                var when = answers.paramAction != null && answers.paramAction !== 'remove' && answers.paramName != '';
                if(when && answers.paramAction.type != '') {
                  var isStandardType = false;
                  for(var i=0; i<paramTypesChoices.length; i++) {
                    if(paramTypesChoices[i].value == answers.paramAction.type) {
                      isStandardType = true;
                    }
                  }
                  when = isStandardType;
                }
                return when;
              },
              default: function (answers) {
                if (answers.paramAction !== 'add') {
                  return answers.paramAction.type;
                }
              }
            },
            {
              type: 'input',
              name: 'paramType',
              message: 'Parameter type',
              when: function (answers) {
                var when = answers.paramAction != null && answers.paramAction !== 'remove' && answers.paramName != '';
                if(!when) {
                  return false;
                }
                if (answers.paramAction == 'add') {
                  return answers.paramType == 'Other type';
                }
                else {
                  if (answers.paramType == 'Other type') {
                    return true;
                  }
                  if (answers.paramAction.type != '') {
                    var isStandardType = false;
                    for (var i = 0; i < paramTypesChoices.length; i++) {
                      if (paramTypesChoices[i].value == answers.paramAction.type) {
                        isStandardType = true;
                      }
                    }
                    return !isStandardType;
                  }
                }
              },
              default: function (answers) {
                if (answers.paramAction !== 'add') {
                  return answers.paramAction.type;
                }
              }
            },
            {
              type: 'confirm',
              name: 'valid',
              message: '@Valid ?',
              when: function(answers) {
                return answers.paramAction != null && answers.paramAction !== 'remove' && answers.paramName != '';
              },
              default: function(answers) {
                if(answers.paramAction == 'add') {
                  return false;
                } else {
                  return answers.paramAction.valid != null && answers.paramAction.valid;
                };
              }
            },
            {
              type: 'confirm',
              name: 'pathVariable',
              message: '@PathVariable ?',
              when: function(answers) {
                return answers.paramAction != null && answers.paramAction !== 'remove' && answers.paramName != '';
              },
              default: function(answers) {
                if(answers.paramAction == 'add') {
                  return false;
                } else {
                  return answers.paramAction.pathVariable != null;
                };
              }
            },
            {
              type: 'input',
              name: 'pathVariableName',
              message: '@PathVariable("?")',
              when: function(answers) {
                return answers.paramAction != null && answers.paramAction !== 'remove' && answers.paramName != '' && answers.pathVariable;
              },
              default: function(answers) {
                if(answers.paramAction !== 'add' && answers.paramAction.pathVariable != null) {
                  return answers.paramAction.pathVariable.name;
                };
              }
            },
            {
              type: 'confirm',
              name: 'requestParam',
              message: '@RequestParam ?',
              when: function(answers) {
                return answers.paramAction != null && answers.paramAction !== 'remove' && answers.paramName != '';
              },
              default: function(answers) {
                if(answers.paramAction == 'add') {
                  return false;
                } else {
                  return answers.paramAction.requestParam != null;
                };
              }
            },
            {
              type: 'input',
              name: 'requestParamValue',
              message: 'Request parameter name : @RequestParam(value=?)',
              when: function(answers) {
                return answers.paramAction != null && answers.paramAction !== 'remove' && answers.paramName != '' && answers.requestParam;
              },
              default: function(answers) {
                if(answers.paramAction !== 'add' && answers.paramAction.requestParam != null) {
                  return answers.paramAction.requestParam.value;
                };
              }
            },
            {
              type: 'confirm',
              name: 'requestParamRequired',
              message: 'Is required ?',
              when: function(answers) {
                return answers.paramAction != null && answers.paramAction !== 'remove' && answers.paramName != '' && answers.requestParam;
              },
              default: function(answers) {
                if(answers.paramAction !== 'add' && answers.paramAction.requestParam != null) {
                  return answers.paramAction.requestParam.required;
                };
              }
            },
            {
              type: 'input',
              name: 'requestParamDefaultValue',
              message: 'Default value ?',
              when: function(answers) {
                return answers.paramAction != null && answers.paramAction !== 'remove' && answers.paramName != '' && answers.requestParam;
              },
              default: function(answers) {
                if(answers.paramAction !== 'add' && answers.paramAction.requestParam != null) {
                  return answers.paramAction.requestParam.defaultValue;
                };
              }
            }
          ];
          var deferred = Q.defer();
          inquirer.prompt(questions, function (answers) {
            if(answers.paramAction != null && answers.paramName != '') {
              if(answers.paramAction == 'remove') {
                delete method.params[answers.paramToRemove.id];
              }
              else {
                if(answers.paramAction == 'add') {
                  if (method.params == null) {
                    method.params = {};
                  }
                  var param = {
                    id: answers.paramName
                  };
                  method.params[param.id] = param;
                }
                else { // action : modify
                  var paramName = answers.paramAction.id;
                  var param = method.params[paramName];
                  if(paramName != answers.paramName) {
                    delete method.params[paramName];
                    method.params[answers.paramName] = param;
                    param.id = answers.paramName;
                  }
                }
                param.type = answers.paramType;
                if(answers.valid) {
                  param.valid = true;
                } else {
                  delete param.valid;
                }
                if(answers.requestBody) {
                  param.requestBody = true;
                } else {
                  delete param.requestBody;
                }
                if(answers.pathVariable) {
                  param.pathVariable = {};
                  if(answers.pathVariableName != '') {
                    param.pathVariable.name = answers.pathVariableName;
                  }
                } else {
                  delete param.pathVariable;
                }
                if(answers.requestParam) {
                  param.requestParam = {};
                  if(answers.requestParamValue.trim() != '') {
                    param.requestParam.value = answers.requestParamValue;
                  } else {
                    delete param.requestParam.value;
                  }
                  if(answers.requestParamRequired) {
                    param.requestParam.required = answers.requestParamRequired
                  } else {
                    delete param.requestParam.required;
                  }
                  if(answers.requestParamDefaultValue.trim() != '') {
                    param.requestParam.defaultValue = answers.requestParamDefaultValue
                  } else {
                    delete param.requestParam.defaultValue;
                  }
                } else {
                  delete param.requestParam;
                }

              }

              $this.showMethod(method, path, entity);
              $this.writeEntity(entity);

              paramInquirer(method)
                .then(function() {
                  deferred.resolve();
                }.bind(this));
            } else {
              deferred.resolve();
            }
          });
          return deferred.promise;
        });
        paramInquirer(method)
          .then(function() {

            $this.writeEntity(entity);

            callback();
          }.bind(this));
      }
    }.bind(this));
  };

  Task.prototype.doRemoveMethod = function(method, path, entity, data, callback) {
    if(method == null) {
      callback();
      return;
    }
    var questions = [
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Confirm remove method: '+path.id+'.'+method.id,
        default: true
      }
    ];
    inquirer.prompt(questions, function( answers ) {
      if(answers.confirm) {
        delete path.methods[method.id];
        this.writeEntity(entity);
      }
      callback();
    }.bind(this));
  };

  return Task;
})();

module.exports = new Task();