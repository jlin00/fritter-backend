import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Taglist, PopulatedTaglist} from './model';

// Update this if you add a property to the Taglist type!
type TaglistResponse = {
  _id: string;
  freetId: string;
  tags: string[];
};

/**
 * Transform a raw Taglist object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Taglist>} taglist - A taglist
 * @returns {TaglistResponse} - The taglist object formatted for the frontend
 */
const constructTaglistResponse = (taglist: HydratedDocument<Taglist>): TaglistResponse => {
  const taglistCopy: PopulatedTaglist = {
    ...taglist.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };
  return {
    ...taglistCopy,
    _id: taglistCopy._id.toString(),
    freetId: taglist.freetId.toString(),
    tags: taglist.tags
  };
};

export {
  constructTaglistResponse
};
