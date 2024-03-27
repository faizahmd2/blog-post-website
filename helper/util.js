
exports.renderTemplate = function(res, name, options={}) {
    let path = 'templates/'+name;
    res.render(path, options);
}

exports.pageRender = function(req, res, page) {
    const options = req.options || {};
    if(!options.hasOwnProperty("user")) {
        options.user = null;
    }

    res.render(page, options);
}

exports.errorTemplate = function(res, options={}) {
    let path = 'templates/error-page';
    
    if(!options.title){
        options.title = "404";
    }
    if(!options.sub_title) {
        options.sub_title = "UH OH! You're lost.";
    }
    if(!options.message) {
        options.message = "The page you are looking for does not exist.How you got here is a mystery. But you can click the button belowto go back to the homepage.";
    }
    if(!options.redirect) {
        options.redirect = "/";
    }
    if(!options.button) {
        options.button = "HOME";
    }
    
    res.render(path, options);
}

exports.sendResponse = function(res, statusCode, error) {
    if(statusCode === 500 && !error) error = 'Internal Server Error';

    res.status(statusCode).json({ error, status: statusCode });
}