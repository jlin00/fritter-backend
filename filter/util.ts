import type {HydratedDocument} from 'mongoose';
import type {Filter, PopulatedFilter} from './model';

// Update this if you add a property to the Filter type!
type FilterResponse = {
  _id: string;
  creator: string;
  name: string;
  usernames: string[];
  tags: string[];
};

/**
 * Transform a raw Fitler object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Filter>} filter - A filter
 * @returns {FilterResponse} - The filter object formatted for the frontend
 */
const constructFilterResponse = (filter: HydratedDocument<Filter>): FilterResponse => {
  const filterCopy: PopulatedFilter = {
    ...filter.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  return {
    ...filterCopy,
    _id: filterCopy._id.toString(),
    creator: filterCopy.creator.username,
    usernames: filterCopy.usernames.map(u => u.username),
    tags: filterCopy.tags.map(t => t.tag)
  };
};

export {
  constructFilterResponse
};
