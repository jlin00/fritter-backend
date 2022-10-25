/* eslint-disable @typescript-eslint/restrict-template-expressions */

/**
 * Fields is an object mapping the names of the form inputs to the values typed in
 * e.g. for createUser, fields has properites 'username' and 'password'
 */

function getFilters(fields) {
  fetch('/api/filters')
    .then(showResponse)
    .catch(showResponse);
}

function getFilterByName(fields) {
  fetch(`/api/filters?name=${fields.name}`)
    .then(showResponse)
    .catch(showResponse);
}

function createFilter(fields) {
  if (String(fields.usernames) === '') {
    fields.usernames = [];
  } else {
    fields.usernames = String(fields.usernames).split(',');
  }

  if (String(fields.tags) === '') {
    fields.tags = [];
  } else {
    fields.tags = String(fields.tags).split(',');
  }

  fetch('/api/filters', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}

function updateFilter(fields) {
  if (String(fields.usernames) === '') {
    fields.usernames = [];
  } else {
    fields.usernames = String(fields.usernames).split(',');
  }

  if (String(fields.tags) === '') {
    fields.tags = [];
  } else {
    fields.tags = String(fields.tags).split(',');
  }

  fetch(`/api/filters/${fields.id}`, {method: 'PUT', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}

function deleteFilter(fields) {
  fetch(`/api/filters/${fields.id}`, {method: 'DELETE'})
    .then(showResponse)
    .catch(showResponse);
}
