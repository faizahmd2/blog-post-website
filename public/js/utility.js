function getCurrentBaseUrl() {
    return window.location.protocol + "//" + window.location.host;
}

function parseSearchQuery() {
    const queryString = window.location.search;
    const searchParams = new URLSearchParams(queryString);
    
    const params = {};
    
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    
    return params;
}

function fetchData(endpoint, method = "GET", body) {
    return new Promise((resolve, reject) => {
        const fetchOptions = {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem("userToken")
          }
        };
        
        if(body) fetchOptions.body = JSON.stringify(body);
    
        return fetch(getCurrentBaseUrl() + endpoint, fetchOptions)
          .then(response => {
            if (!response.ok) {
              const errorCode = response.status;
              if(errorCode == 403) {
                localStorage.clear();
                window.location.reload();
                return resolve({});
              }

              console.log("FETCH ERROR::", response.status, response.statusText);
              return resolve({});
            }
            response.json().then(result=> {
                resolve(result);
            });
          });
    })
}
  