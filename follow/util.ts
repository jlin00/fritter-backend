import type {HydratedDocument} from 'mongoose';
import type {Follow, PopulatedFollow} from './model';

// Update this if you add a property to the Follow type!
type FollowResponse = {
  _id: string;
  follower: string;
  following: string;
};

/**
 * Transform a raw Follow object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Follow>} follow - A follow
 * @returns {FollowResponse} - The follow object formatted for the frontend
 */
const constructFollowResponse = (follow: HydratedDocument<Follow>): FollowResponse => {
  const followCopy: PopulatedFollow = {
    ...follow.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  return {
    ...followCopy,
    _id: followCopy._id.toString(),
    follower: followCopy.follower.username,
    following: 'tag' in followCopy.following ? followCopy.following.tag : followCopy.following.username
  };
};

export {
  constructFollowResponse
};
