function parseQueryString() {
    let queryString = window.location.search;
    let queryParams = _.chain(queryString)
    .replace('?', '')
    .split('&')
    .map(_.partial(_.split, _, '=', 2))
    .fromPairs()
    .value();

  return queryParams;
}