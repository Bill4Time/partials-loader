// Core Libraries/Frameworks
var fs = require('fs');
var path = require('path');

// Third-Party Libraries/Frameworks
var _ = require('lodash');
var fsHelper = require('fs-helper');

/** @param { String } library_name
 *      Used as a constant so debugging is simple
 */
var library_name = 'partial-loader';

/** module.handlebars
 *  	[ This is the hook in logic for using the partial loader for the handlebars template engine. After
 *  	the call to this function the template engine that was used should have the partials that exist in the
 *  	directories provided registered and ready for use. The idea is that the template_root_directories indicate
 *  	the top level folder to parse through for a directory whose name exists in the partials_directory_names. If
 *  	a directory name is found under the template directory and it exists in the partials_directory_names, then 
 *  	the loader iterates in a recursive fashion from the partials directory down, registering each file that has an
 *  	extension that is found in the template_extensions. ]
 * @param { Object } options                                               [ This is a container object for the partials-loader to use. ]
 * @param { Object } options.engine_reference                              [ This is the template engine that the partials files found will be registered with. ]
 * @param { String or Array of Strings } options.template_root_directories [ These are the template root directories that will be recursively searched through. ]
 * @param { String or Array of Strings } options.partials_directory_names  [ These are the directory names that will be matched against in order to identify a directory to recurse through for loading partials files. SPECIAL CHARACTERS: if the character '.' is passed in, this will indicate to the partials loader that the template directory itself should be loaded as a partials directory. If it is passed in with an array of other strings the '.' will take precedence and will just iterate from the template directory down and 
 * @param { String OR Array of Strings } options.template_extensions       [ These are the extensions of the template files to load. ]
 * @param { String } options.delimiter_symbol                              [ This is the delimiter used for namespacing, when files are loaded their directories are separated by this value. ]
 * @return { undefined }                                                   [ This returns nothing. ]
 */
exports.handlebars = function(options) {
	validateInput(options);
	if(!options.delimiter_symbol) {
		options.delimiter_symbol = '/';
	}

	for(var i = 0; i < options.template_root_directories.length; i++) {
		var template_root_directory = options.template_root_directories[i];
		var partial_subdirectories_found = [];

		// checks special condition that the current directory isn't being asked for
		if(_.indexOf(options.partials_directory_names, '.') == -1) {
			partial_subdirectories_found = fsHelper.getDirPathsRecursivelyByNameSync(template_root_directory, options.partials_directory_names);
		}
		else {
			partial_subdirectories_found.push(options.template_root_directories[i]);
		}

		for(var i = 0; i < partial_subdirectories_found.length; i++) {
			loadPartials(options.template_engine_reference, template_root_directory, partial_subdirectories_found[i], options.template_extensions, options.delimiter_symbol);
		}
	}
}

/** loadPartials 
 * 		[ This function is responsible for taking all the formatted data pointing to all the partials and recurseive 
 * 		directories, and using that information to load the partial files into the template engine.]
 * @param { Object } template_engine_reference    [ This is the object reference to the template engine that is loading the the partials ]
 * @param { String } root_directory               [ This is the root directory that is being loaded from. ]
 * @param { String } current_directory            [ This is the directory that is being traversed to locate the partial directories. ]
 * @param { Array of String } template_extensions [ These are strings used to determine the file extensions that should be loaded. ]
 * @param { String } delimiter_symbol             [ This is the delimeter for the namespace path that is getting loaded into  handlebars. ]
 * @return { undefined }                          [ This returns nothing. ]
 */
var loadPartials = function(template_engine_reference, root_directory, current_directory, template_extensions, delimiter_symbol) {
	files = fs.readdirSync(current_directory);

	for(var i = 0; i < files.length; i++) {
		var fullPath = path.join(current_directory, files[i]);
		stat = fs.statSync(fullPath);

		if(stat.isFile()) {
			var file_extension = path.extname(fullPath).slice(1);
			if(_.indexOf(template_extensions, file_extension) != -1) {
				var template = fs.readFileSync(fullPath, 'utf8');
				var partial_name_space = fsHelper.getDirDifference(root_directory, fullPath);
				partial_name_space = partial_name_space.replace(/\\/g, delimiter_symbol);

				console.log('Loading Partial into Handlebars engine.');
				console.log('\tPartial Name Space: ' + partial_name_space);
				console.log('\tFull Path to NameSpace: ' + fullPath);
				console.log('-----------------------------------------');

				template_engine_reference.registerPartial(partial_name_space, template);
			}
		}
	}

	var subdirectories = fsHelper.getDirPathsSync(current_directory);
	for(var i = 0; i < subdirectories.length; i++) {
		loadPartials(template_engine_reference, root_directory, subdirectories[i], template_extensions, delimiter_symbol);
	}
}

/** validateInput
 *      [ This is the top level entry point for validating the options provided. ]
 * @param { Object } options                                               [ This is a container object for the partials-loader to use. ]
 * @param { Object } options.engine_reference                              [ This is the template engine that the partials files found will be registered with. ]
 * @param { String or Array of Strings } options.template_root_directories [ These are the template root directories that will be recursively searched through. ]
 * @param { String or Array of Strings } options.partials_directory_names  [ These are the directory names that will be matched against in order to identify a directory to recurse through for loading partials files. SPECIAL CHARACTERS: if the character '.' is passed in, this will indicate to the partials loader that the template directory itself should be loaded as a partials directory. If it is passed in with an array of other strings the '.' will take precedence and will just iterate from the template directory down. ]
 * @param { String OR Array of Strings } options.template_extensions       [ These are the extensions of the template files to load. ]
 * @param { String } options.delimiter_symbol                              [ This is the delimiter used for namespacing, when files are loaded their directories are separated by this value. ]
 * @return { undefined }                                                   [ This returns nothing. ]
 */
var validateInput = function(options) {
	// TODO: validate that the strings passed in don't have invalid characters either
	if(options.engine_reference) {
		validateEngineReference(options.engine_reference)
	}
	else {
		new Error('An engine reference is a required property in order to use partial-loader. Please provide this in the functional that calls this.')
	}

	if(options.template_root_directories) {
		options.template_root_directories = validateTemplateRootDirectories(options.template_root_directories);
	}
	else {
		new Error('The "template_root_directories" is a required property in order to use partial-loader. Please provide this in the function that calls this.')
	}

	if(options.partials_directory_names) {
		options.partials_directory_names = validatePartialDirectoryNames(options.partials_directory_names);
	}
	else {
		new Error('The "template_partials_directory(s)" is a required property in order to use partial-loader. Please provide this in the functional that calls this.')
	}

	if(options.template_extensions) {
		options.template_extensions = validateTemplateExtensions(options.template_extensions);
	}
	else {
		new Error('The "template_extensions" is a required property in order to use partial-loader. Please provide this in the functional that calls this.')
	}
}

var validateEngineReference = function(engine_reference) {
	if(!_.isObject(engine_reference)) {
		new Error('The template engine passed into the ' + library_name + ' function is not an OBJECT type. Please fix this.')
	}
}

var validateTemplateRootDirectories = function(template_root_directories) {
	if(_.isString(template_root_directories)) {
		template_root_directories = [template_root_directories];
	}
	else if(_.isArray(template_root_directories)) {
		for(var i = 0; i < template_root_directories.length; i++) {
			if(!_.isString(template_root_directories[i])) {
				new Error('The values for the template root directory must all be strings, please validate that this option parameter is correct.');
			}
		}
	}
	else {
		new Error('The template extensions passed into the ' + library_name + ' function are not an ARRAY or STRING type. Please fix this.')
	}
	return template_root_directories;
}

var validatePartialDirectoryNames = function(partials_directory_names) {
	if(_.isString(partials_directory_names)) {
		partials_directory_names = [partials_directory_names];
	}
	else if(_.isArray(partials_directory_names)) {
		for(var i = 0; i < partials_directory_names.length; i++) {
			if(!_.isString(partials_directory_names[i])) {
				new Error('The values for the partials directory names must all be strings, please validate that this option parameter is correct.');
			}
		}
	}
	else {
		new Error('The template extensions passed into the ' + library_name + ' function are not an ARRAY or STRING type. Please fix this.')
	}
	return partials_directory_names;
}

var validateTemplateExtensions = function(template_extensions) {
	if(_.isString(template_extensions)) {
		template_extensions = [template_extensions];
	}
	else if(_.isArray(template_extensions)) {
		for(var i = 0; i < template_extensions.length; i++) {
			if(!_.isString(template_extensions[i])) {
				new Error('The values for the template extensions must all be strings, please validate that this option parameter is correct.');
			}
		}
	}
	else {
		new Error('The template extensions passed into the ' + library_name + ' function are not an ARRAY or STRING type. Please fix this.')
	}
	return template_extensions;
} 