
class CustomError {
    constructor(res,options){
        let path = 'templates/error-page';
        if(typeof options != 'object') options = {};
        
        if(!options.title){
            options.title = "404";
        }
        if(!options.sub_title) {
            options.sub_title = "UH OH! You're lost.";
        }
        if(!options.message) {
            options.message = "The page you are looking for does not exist.How you got here is a mystery. But you can click the button belowto go back to the homepage.";
        }
        
        res.render(path,options);
    }
}

module.exports = { CustomError }