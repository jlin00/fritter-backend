/* eslint-disable @typescript-eslint/restrict-template-expressions */

/**
 * Fields is an object mapping the names of the form inputs to the values typed in
 * e.g. for createUser, fields has properites 'username' and 'password'
 */

function getVotes(fields) {
  fetch(`/api/credibility/${fields.id}/votes`)
    .then(showResponse)
    .catch(showResponse);
}

function issueVote(fields) {
  console.log(fields.credible);
  fields.credible = fields.credible === 'true';
  console.log(fields.credible);
  fetch(`/api/credibility/${fields.id}/votes`, {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}

function deleteVote(fields) {
  fetch(`/api/credibility/${fields.id}/votes`, {method: 'DELETE'})
    .then(showResponse)
    .catch(showResponse);
}

function getRefs(fields) {
  fetch(`/api/credibility/${fields.id}/links`)
    .then(showResponse)
    .catch(showResponse);
}

function issueRef(fields) {
  fetch(`/api/credibility/${fields.id}/links`, {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}

function deleteRef(fields) {
  fetch(`/api/credibility/links/${fields.id}`, {method: 'DELETE'})
    .then(showResponse)
    .catch(showResponse);
}

