import type {HydratedDocument} from 'mongoose';
import type {Vote, PopulatedVote, ReferenceLink, PopulatedReferenceLink} from './model';

// Update this if you add a property to the Vote type!
type VoteResponse = {
  _id: string;
  freetId: string;
  issuer: string;
  credible: boolean;
};

/**
 * Transform a raw Vote object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Vote>} vote - A vote
 * @returns {VoteResponse} - The vote object formatted for the frontend
 */
const constructVoteResponse = (vote: HydratedDocument<Vote>): VoteResponse => {
  const voteCopy: PopulatedVote = {
    ...vote.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const {username} = voteCopy.issuerId;
  delete voteCopy.issuerId;
  return {
    ...voteCopy,
    _id: voteCopy._id.toString(),
    freetId: voteCopy.freetId._id.toString(),
    issuer: username,
    credible: voteCopy.credible
  };
};

// Update this if you add a property to the ReferenceLink type!
type ReferenceLinkResponse = {
  _id: string;
  freetId: string;
  issuer: string;
  link: string;
};

/**
 * Transform a raw ReferenceLink object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<ReferenceLink>} refLink - A reference link
 * @returns {ReferenceLinkResponse} - The reference link object formatted for the frontend
 */
const constructReferenceLinkResponse = (refLink: HydratedDocument<ReferenceLink>): ReferenceLinkResponse => {
  const refLinkCopy: PopulatedReferenceLink = {
    ...refLink.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  const {username} = refLinkCopy.issuerId;
  delete refLinkCopy.issuerId;
  return {
    ...refLinkCopy,
    _id: refLinkCopy._id.toString(),
    freetId: refLinkCopy.freetId._id.toString(),
    issuer: username,
    link: refLinkCopy.link
  };
};

export {
  constructVoteResponse,
  constructReferenceLinkResponse
};
