function reset(key, tag) {
	tag.onerror = tag.onload = null;
	URL.revokeObjectURL(tag.temp);
	URL.revokeObjectURL(tag.src);
	delete window[key];
	tag.remove();
}

function toBlob(txt) {
	return URL.createObjectURL(
		new Blob([txt], {
			type: 'application/javascript'
		})
	);
}

var CACHE = {};

export default function dimport(url) {
	try {
		return new Function("return import('" + url + "')").call();
	} catch (tag) {
		url = new URL(url, location.href).href;
		if (CACHE[url]) return Promise.resolve(CACHE[url]);

		return fetch(url)
			.then(function (r) {
				return r.text();
			})
			.then(function (txt) {
				window.dimport = dimport;
				return new Promise(function (res, rej, key) {
					tag = document.createElement('script');
					key = '$' + Math.random().toString(32).slice(2);
					tag.type = 'module';

					tag.onerror = function () {
						reset(key, tag);
						rej(new TypeError('Failed to fetch dynamically imported module: ' + url));
					};

					tag.onload = function () {
						res(CACHE[url] = window[key]);
						reset(key, tag);
					};

					tag.temp = toBlob(
						// Ensure full URLs & rewrite dynamic imports
						txt.replace(/(^|\s|;)(import\s*\(|import\s*.*\s*from\s*)['"]([^'"]+)['"]/gi, function (_, pre, req, loc) {
							return pre + (/\s+from\s*/.test(req) ? req : 'window.dimport(') + "'" + new URL(loc, url) + "'";
						})
						// Ensure we caught all dynamics (multi-line clauses)
						.replace(/(^|\s|;)(import)(?=\()/g, '$1window.dimport')
					);

					tag.src = toBlob("import * as m from '" + tag.temp + "';window." + key + "=m;");

					document.head.appendChild(tag);
				});
			});
	}
}

// Runtime hookups
var tag = document !== void 0 && document.currentScript || document.querySelector('script[data-main]');
if (tag) tag.text ? dimport(toBlob(tag.text)) : (tag=tag.getAttribute('data-main')) && dimport(tag);
