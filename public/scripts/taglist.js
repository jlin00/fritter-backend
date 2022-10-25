/* eslint-disable @typescript-eslint/restrict-template-expressions */

/**
 * Fields is an object mapping the names of the form inputs to the values typed in
 * e.g. for createUser, fields has properites 'username' and 'password'
 */
function getTaglist(fields) {
  fetch(`/api/tags/${fields.id}`)
    .then(showResponse)
    .catch(showResponse);
}

function addTaglist(fields) {
  if (String(fields.tags) === '') {
    fields.tags = [];
  } else {
    fields.tags = String(fields.tags).split(',');
  }

  fetch(`/api/tags/${fields.id}`, {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}

function updateTaglist(fields) {
  fields.tags = String(fields.tags).split(',');
  fetch(`/api/tags/${fields.id}`, {method: 'PUT', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}

function deleteTaglist(fields) {
  fetch(`/api/tags/${fields.id}`, {method: 'DELETE'})
    .then(showResponse)
    .catch(showResponse);
}
