#partials-loader

## Overview 
This is a node module to help facilitate registering partials with their respective templating engine. In doing so it creates a namespace from the directory it is loaded from.

This means that when using this module you will be able to reference partials in your templates directory by providing the relative path from your template directory to the partial being loaded and handlebars will be aware of it.

## Example Usage

First, pretend that we have a folder called  
/Users/username/node project/


And in this folder there is this directory structure  
/Users/username/node project/  
|__templates  
&nbsp;&nbsp;&nbsp;&nbsp;|__example.hbs  
&nbsp;&nbsp;&nbsp;&nbsp;|__index.hbs  
&nbsp;&nbsp;&nbsp;&nbsp;|__more partials  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|__header.hbs  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|__content.html  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|__footers.hbs  
&nbsp;&nbsp;&nbsp;&nbsp;|__partials  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|__header.hbs  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|__content.html  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|__footers.hbs  

### Register all files from the templates folder
```javascript
// First load your engine and the partials-loader
var handlebars = require('handlebar');
var partialLoader = require('partials-loader');

//  This registers every handlebar file 
partialLoader.handlebars({ template_engine_reference: handlebars, 
                            template_root_directories: '/Users/username/node project/templates',
                            partials_directory_names: '.',
                            template_extensions: 'hbs',
                            delimiter_symbol: '/'
                        });
```
This will result in handlebars having the registered partials:
- templates/example
- templates/index
- templates/more partials/header
- templates/more partials/footer
- templates/partials/header
- templates/partials/footer

### Register files from a specific subfolder
```javascript
// First load your engine and the partials-loader
var handlebars = require('handlebar');
var partialLoader = require('partials-loader');

//  This registers every handlebar file in the partials folder
partialLoader.handlebars({ template_engine_reference: handlebars, 
                            template_root_directories: '/Users/username/node project/templates',
                            partials_directory_names: 'partials',
                            template_extensions: 'hbs',
                            delimiter_symbol: '/'
                        });
```
This will result in handlebars having the registered partials:
- templates/partials/header
- templates/partials/footer

### Register files from multiple specific subfolders
```javascript
// First load your engine and the partials-loader
var handlebars = require('handlebar');
var partialLoader = require('partials-loader');

//  This registers every handlebar file in the specified folders
partialLoader.handlebars({ template_engine_reference: handlebars, 
                            template_root_directories: '/Users/username/node project/templates',
                            partials_directory_names: ['more partials', 'partials'],
                            template_extensions: 'hbs',
                            delimiter_symbol: '/'
                        });
```
This will result in handlebars having the registered partials:
- templates/more partials/header
- templates/more partials/footer
- templates/partials/header
- templates/partials/footer

### Register multiple file types from multiple specific subfolders
```javascript
// First load your engine and the partials-loader
var handlebars = require('handlebar');
var partialLoader = require('partials-loader');

//  This registers every handlebar file in the specified folders
partialLoader.handlebars({ template_engine_reference: handlebars, 
                            template_root_directories: '/Users/username/node project/templates',
                            partials_directory_names: ['more partials', 'partials'],
                            template_extensions: ['hbs', 'html'],
                            delimiter_symbol: '/'
                        });
```
This will result in handlebars having the registered partials:
- templates/more partials/header
- templates/more partials/content
- templates/more partials/footer
- templates/partials/header
- templates/partials/content
- templates/partials/footer

## Currently Supported Template Engines
- Handlebars
 
If there is a desire for supporting more engines, please post in the issues section of the repository, or feel free to implement it yourself and send a pull request for integration.

