var Path = {
    // get filename part from path
    basename : function(path) {
        path = path.replace(/\/$/, '');
        if (path === '') return path;

        return path.match(/[^/]+$/);
    },

    // get directory part from path
    dirname : function(path) {
        if (path == '/') return path;
        if (path == '../') return '.';
        if (path.indexOf('?') != -1) {
            var strings = path.split('?');
            path = strings[0];
        }
        if (!path.match(/\//)) path = './' + path;

        var dirname = path.replace(/\/$/, '').replace(/\/[^/]*$/, '');
        if (dirname === '') return '/';

        return dirname;
    },

    // join paths
    join : function(base, path) {
        var host = null;
        if (base.match(/^(\w+:\/\/[^\/]+)(.*)/)) {
            host = RegExp.$1;
            base = RegExp.$2;
        }

        var result = host == null ? '' : host;
        result += Path.collapse(Path.canonicalize(base + '/' + path));

        return result;
    },

    // canonicalize path such as "aaa/./bbb//ccc"
    // but doesn't resolve updir "../"
    canonicalize : function(path) {
        path = path.replace(/\/+/g, '/').replace(/(\/\.)+(\/|$)/g, '/');
        if (path !== './') path = path.replace(/^(\.\/)+/, '');
        path = path.replace(/^\/(\.\.\/)+/, '/').replace(/^\/\.\.$/, '/');
        if (path !== '/') path = path.replace(/\/$/, '');

        return path;
    },

    // resolve "../"
    collapse : function(path) {
        var parts = path.indexOf('/') === 0 ? path.substr(1).split(/\//) : path.split(/\//);
        var collapsed = new Array();
        var over = 0;
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] == '..') {
                if (collapsed.length) collapsed.pop();
                else over++;
            } else {
                collapsed.push(parts[i]);
            }
        }

        if (path.indexOf('/') === 0)
            return '/' + collapsed.join('/');

        while (over-- > 0)
            collapsed.unshift('..');

        return collapsed.join('/');
    }
};
