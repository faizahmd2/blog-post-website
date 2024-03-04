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

function setSearchQueryParam(key, value, reload = false) {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set(key, value);

  const newUrl = `${window.location.origin}${window.location.pathname}?${searchParams.toString()}`;

  if (reload) {
    window.location.href = newUrl;
  } else {
    history.pushState({}, null, newUrl);
  }
}

function logout() {
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  window.location.href = '/logout';
}

function fetchData(endpoint, method = "GET", body=null, options={}) {
  return new Promise((resolve, reject) => {
    const fetchOptions = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Request': 'json'
      }
    };

    if(options.header) fetchOptions.headers = {...fetchOptions.headers, ...options.header};
    if(options.render) delete fetchOptions.headers['X-Content-Request'];

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

function getCookie(name) {
  if(!document.cookie) return null;
  
  const allCookies = document.cookie.split(';');
  for (const cookie of allCookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}

function deviceInfo() {
  let deviceInfo = {};
  deviceInfo['mobile'] = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if(deviceInfo['mobile']) {
    deviceInfo['screen'] = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }
  return deviceInfo;
}

// TODO: Handle add post page on mobile device orientation
// function deviceOrientationEvent() {
//   $(window).on("orientationchange", function(event) {
//     // Code to handle orientation change
//     if (window.orientation === 0) {
//         // Portrait orientation
//         console.log("Device is in portrait orientation");
//     } else {
//         // Landscape orientation
//         console.log("Device is in landscape orientation");
//     }
//   });
// }

// Function to detect device orientation (portrait or landscape)
function getOrientation() {
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

function showLoader() {
  let progress = document.getElementById("custom-progress-bar");
  if(progress) progress.style.display = "block";
}

function hideLoader() {
  let progress = document.getElementById("custom-progress-bar");
  if(progress) progress.style.display = "none";
}