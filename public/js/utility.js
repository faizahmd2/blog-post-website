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

function logout() {
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  window.location.href = '/logout';
}

function fetchData(endpoint, method = "GET", body) {
  return new Promise((resolve, reject) => {
    const fetchOptions = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // let token = localStorage.getItem("token");
    // if(token) fetchOptions.headers["Authorization"] = `Bearer ${token}`;
    
    if(body) fetchOptions.body = JSON.stringify(body);

    let status = 404;
    fetch(getCurrentBaseUrl() + endpoint, fetchOptions)
      .then(response => {
        status = response.status;
        if (!response.ok) {
          if(status == 401) {
            logout();
            return resolve({});
          }
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return response.json();
        } else {
          return {status};
        }
      })
      .then(result => {
        console.log("RESULT", result);
        resolve(result);
      })
      .catch(e => {
        console.log("CATCHE error--",e, typeof e, e.error, e.status);
        if(e && e.error && e.status) {
          resolve(e);
        } else {
          reject(e);
        }
      });
  })
}

const notyf = new Notyf({
  duration: 3000, // Display duration in milliseconds
  position: { x: 'right', y: 'top' },
  types: [
    {
      type: 'error',
      background: 'indianred',
      duration: 2000,
      dismissible: true
    },
    {
      type: 'warning',
      background: 'orange',
      icon: {
        className: 'material-icons',
        tagName: 'i',
        text: 'warning'
      }
    },
    {
      type: 'info',
      background: 'blue',
      icon: false
    }
  ]
});

const notify = {
  error: (message) => {
    notyf.error(message);
  },
  success: (message) => {
    notyf.success(message);
  },
  info: (message) => {
    notyf.open({
      type: 'info',
      message: message
    });
  },
  warning: (message) => {
    notyf.open({
      type: 'warning',
      message: message
    });
  }
}
