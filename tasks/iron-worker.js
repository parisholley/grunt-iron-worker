/*
 * grunt-iron-worker
 *
 * Copyright (c) 2013 Eric Kryski.
 * MIT Licensed
 */

'use strict';

module.exports = function(grunt) {

  // TODO: Update the task to use node-ironio or ruby gem CLI
  var exec = require('child_process').exec;
  var path = require('path');

  var optionsMapping = {
    payloadFile: '--payload-file',
    payload: '--payload',
    projectId: '--project-id',
    environment: '--env',
    name: '--name',
    concurrency: '--max-concurrency',
    retries: '--retries',
    retriesDelay: '--retries-delay',
    host: '--host',
    async: '--async',
    fullRemoteBuild: '--full-remote-build',
    priority: '--priority',
    timeout: '--timeout',
    delay: '--delay',
    start: '--start-at',
    end: '--end-at',
    runTimes: '--run-times',
    runEvery: '--end-times'
  };

  function generateOptionsString(target, options, data){
    var string = [];
    var key;

    for (key in options){
      // Skip payload and payload file options for upload targets
      if (target === 'upload' && (key === 'payloadFile' || key === 'payload')){
        continue;
      }

      string.push(optionsMapping[key]);
      string.push(options[key]);
    }

    for (key in data){
      if (data[key] || data[key] === 0){
        string.push(optionsMapping[key]);
      }

      // async and full remote build are just flags, they have no values
      if (key !== 'async' || key !== 'fullRemoteBuild'){
        string.push(data[key]);
      }
    }

    return string.join(' ');
  }

  grunt.registerMultiTask('ironworker', 'Grunt iron_worker interface', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({});
    var callback = this.async();

    grunt.verbose.writeflags(options, 'Options');

    var cmd = grunt.template.process(['iron_worker', this.target, generateOptionsString(this.target, options, this.data)].join(' '));

    grunt.verbose.writeln('Command:', cmd.yellow);

    var worker = exec(cmd, function (err, stdout, stderr) {
      if (err) grunt.warn(err);
      callback();
    });

    worker.stdout.pipe(process.stdout);
    worker.stderr.pipe(process.stderr);
  });
};