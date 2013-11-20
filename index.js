// http://help.fogcreek.com/8202/xml-api
var http = require('request'),
    xml2js = require('xml2js'),
    Q = require('q'),
    convert = require('./lib/converters'),
    extend = require('./lib/extenders');

var log = false;

function identity(x) { return x; }

function format(f) {
	var args = [].slice.call(arguments, 1);
	return f.replace(/{(\d+)}/g, function(match, i) {
		return typeof args[i] != 'undefined' ? args[i] : "";
	});
}

function get() {
	var url = format.apply(null, [].slice.call(arguments));
	log && console.log("GET %s", url);
	
	var def = Q.defer();
	
	http.get(url, function(err, res, body) {
		if (err) {
			def.reject(err);
		} else {
			log && console.log(body);
			xml2js.parseString(body, function(error, d) {
				if (error) {
					def.reject(error);
				} else if (!d.response) {
					def.reject("unexpected response!");
				} else if (d.response.error) {
					def.reject(d.response.error[0]._);
				} else {
					def.resolve(d.response);
				}
			});
		}
	});

	return def.promise;
}

// creates new client with specified options
module.exports = function(options) {

	if (!options) {
		throw new Error("Options are not specified.");
	}
	if (!options.url || typeof options.url != "string") {
		throw new Error("Required url option is not specified.");
	}

	// normalize url
	var apiUrl = options.url;
	if (apiUrl.charAt(apiUrl.length - 1) != '/') {
		apiUrl += '/';
	}
	apiUrl += 'api.asp?';

	function client(token) {

		var clientUrl = format("{0}token={1}&", apiUrl, token);

		function simpleCmd(name) {
			return get("{0}cmd={1}", clientUrl, name);
		}

		function list(name) {
			var fns = [].slice.call(arguments, 1);
			return function() {
				var p = simpleCmd("list" + name);
				fns.forEach(function(fn) {
					p = p.then(fn);
				});
				return p;
			};
		}

		function cmd(name) {
			var url = format("{0}cmd={1}&", clientUrl, name);
			var i = 1;
			while (i + 1 < arguments.length) {
				var arg = arguments[i++];
				var val = arguments[i++];
				if (val) {
					url += "&" + arg;
					url += "=" + encodeURIComponent(val);
				}
			}
			return get(url);
		}

		function search(q, max) {
			return cmd("search", "q", q, "max", max, "cols", convert.searchCols).then(convert.cases);
		}

		function create(info) {
			return cmd("new",
				"sTitle", info.title,
				"sProject", info.project.id,
				"sArea", info.area,
				"sFixFor", info.milestone,
				"sCategory", info.category, // TODO map categories
				"sPersonAssignedTo", info.person,
				"sPriority", info.priority, // TODO map priority
				"sTags", info.tags,
				"sCustomerEmail", info.customerEmail,
				"sEvent", info.event
			);
		}

		var fb = {
			search: search
		};
		
		function map(fn) {
			return function(arr) {
				return arr.map(fn);
			};
		}

		return {
			token: token,
			logout: function() { return simpleCmd("logoff"); },
			
			// lists
			filters: list("Filters", convert.filters),
			projects: list("Projects", convert.projects),
			people: list("People", convert.people),
			areas: list("Areas", convert.areas),
			categories: list("Categories", convert.categories),
			priorities: list("Priorities", convert.priorities),
			milestones: list("FixFors", convert.milestones, map(extend.milestone(fb))),
			// TODO provide converters for below lists
			mailboxes: list("Mailboxes"),
			wikis: list("Wikis"),
			templates: list("Templates"), // wiki templates
			snippets: list("Snippets"),
			
			// list cases
			search: search,
			
			// editing cases
			open: create,
			"new": create,
		};
	}

	// creating client with given token
	if (typeof options.token == "string") {
		if (!options.token) {
			throw new Error("token option is empty.");
		}
		return client(options.token);
	}

	// login then create client
	if (!options.email || typeof options.email != "string") {
		throw new Error("Required email option is not specified.");
	}
	if (!options.password || typeof options.password != "string") {
		throw new Error("Required password option is not specified.");
	}

	return get("{0}cmd=logon&email={1}&password={2}", apiUrl, options.email, options.password).then(function(d) {
		return client(d.token);
	});
};

