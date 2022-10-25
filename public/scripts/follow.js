/* eslint-disable @typescript-eslint/restrict-template-expressions */

/**
 * Fields is an object mapping the names of the form inputs to the values typed in
 * e.g. for createUser, fields has properites 'username' and 'password'
 */

function getFollowing(fields) {
  fetch(`/api/follow?followingOf=${fields.username}`)
    .then(showResponse)
    .catch(showResponse);
}

function getFollowers(fields) {
  fetch(`/api/follow?followersOf=${fields.username}`)
    .then(showResponse)
    .catch(showResponse);
}

function followSource(fields) {
  fetch('/api/follow', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}

function deleteFollow(fields) {
  fetch(`/api/follow/${fields.id}`, {method: 'DELETE'})
    .then(showResponse)
    .catch(showResponse);
}
