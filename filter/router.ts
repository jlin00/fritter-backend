import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import FilterCollection from './collection';
import UserCollection from '../user/collection';
import * as filterValidator from './middleware';
import * as userValidator from '../user/middleware';
import * as taglistValidator from '../taglist/middleware';
import * as util from './util';
import type {Freet} from '../freet/model';
import type {HydratedDocument, Types} from 'mongoose';
import {constructFreetResponse} from '../freet/util';
import FreetCollection from '../freet/collection';
import TaglistCollection from '../taglist/collection';
import TagCollection from '../tag/collection';

const router = express.Router();

/**
 * Get all filters created by user.
 *
 * @name GET /api/filters
 *
 * @return {FilterResponse[]} - An array of filters created by user
 * @throws {403} - If user is not logged in
 *
 */
/**
 * Get filter with specific name created by user.
 *
 * @name GET /api/filters?name=name
 *
 * @return {FilterResponse} - The filter object with given name created by user
 * @throws {403} - If user is not logged
 * @throws {400} - If name is not given
 * @throws {404} - If name is not a recognized filter name
 *
 */
router.get(
  '/',
  [
    userValidator.isUserLoggedIn
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if name query parameter was supplied
    if (req.query.name !== undefined) {
      next();
      return;
    }

    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const allFilters = await FilterCollection.findAllByUserId(userId);
    const response = allFilters.map(util.constructFilterResponse);
    res.status(200).json(response);
  },
  [
    filterValidator.isFilterNameExists
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const filter = await FilterCollection.findOneByUserIdAndName(userId, req.query.name as string);
    const response = util.constructFilterResponse(filter);
    res.status(200).json(response);
  }
);

/**
 * Create filter with given parameters.
 *
 * @name POST /api/filters
 *
 * @param {string} name - The name of the filter
 * @param {string[]} usernames - The usernames to filter for
 * @param {string[]} tags - The tags to filter for
 * @return {FilterResponse} - The created filter object
 * @throws {403} - If the user is not logged in
 * @throws {404} - If there are unrecognized usernames or poorly formatted tags
 * @throws {409} - If the user already has another filter with the same name
 * @throws {400} - If the filter name is poorly formatted
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    filterValidator.isValidFilterName,
    filterValidator.isFilterNameNotAlreadyInUse,
    filterValidator.isValidUsernameList,
    taglistValidator.isValidTaglist
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const users = await UserCollection.retrieveUsers(req.body.usernames);
    const userIds = users.map(u => u._id);
    const tags = await TagCollection.findOrCreateMany(req.body.tags);
    const tagIds = tags.map(t => t._id);

    const filter = await FilterCollection.addOne(userId, req.body.name, userIds, tagIds);
    res.status(200).json({
      message: 'Filter was created successfully.',
      filter: util.constructFilterResponse(filter)
    });
  }
);

/**
 * Update filter with new parameters.
 *
 * @name PUT /api/filters/:filterId
 *
 * @param {string} name - The new name of the filter
 * @param {string[]} usernames - The new usernames to filter for
 * @param {string[]} tags - The new tags to filter for
 * @return {FilterResponse} - The updated filter object
 * @throws {403} - If the user is not logged in or is not the creator of the filter
 * @throws {404} - If the filterId is invalid
 * @throws {404} - If there are unrecognized usernames or poorly formatted tags
 * @throws {409} - If the user already has another filter with the same name
 * @throws {400} - If the filter name is poorly formatted
 */
router.put(
  '/:filterId?',
  [
    userValidator.isUserLoggedIn,
    filterValidator.isFilterExists,
    filterValidator.isValidFilterModifier,
    filterValidator.isValidFilterName,
    filterValidator.isFilterNameNotAlreadyInUse,
    filterValidator.isValidUsernameList,
    taglistValidator.isValidTaglist
  ],
  async (req: Request, res: Response) => {
    const users = await UserCollection.retrieveUsers(req.body.usernames);
    const userIds = users.map(u => u._id);
    const tags = await TagCollection.findOrCreateMany(req.body.tags);
    const tagIds = tags.map(t => t._id);

    const filter = await FilterCollection.updateOne(req.params.filterId, req.body.name, userIds, tagIds);
    res.status(200).json({
      message: 'Filter was updated successfully.',
      filter: util.constructFilterResponse(filter)
    });
  }
);

/**
 * Delete a filter
 *
 * @name DELETE /api/filters/:filterId
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the creator of the filter
 * @throws {404} - If the filterId is invalid
 */
router.delete(
  '/:filterId?',
  [
    userValidator.isUserLoggedIn,
    filterValidator.isFilterExists,
    filterValidator.isValidFilterModifier
  ],
  async (req: Request, res: Response) => {
    await FilterCollection.deleteOne(req.params.filterId);
    res.status(200).json({
      message: 'Your filter was deleted successfully.'
    });
  }
);

const searchRouter = express.Router();

/**
 * Get freets matching filter.
 *
 * @name GET /api/content?name=name
 *
 * @return {FreetResponse[]} - An array of freets matching the filter
 * @throws {403} - If user is not logged in
 * @throws {400} - If name is not given
 * @throws {404} - If name is not a recognized filter name
 */
/**
 * Get freets matching parameters.
 *
 * @name GET /api/freets?authors=usernames&tags=tags
 *
 * @return {FreetResponse[]} - An array of freets matching the parameters
 * @throws {400} - If usernames or tags is not given
 * @throws {404} - If there are unrecognized usernames or poorly formatted tags
 */
searchRouter.get(
  '/',
  [
    userValidator.isUserLoggedIn,
    filterValidator.isFilterNameExists
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.query.usernames !== undefined || req.query.tags !== undefined) {
      next();
      return;
    }

    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const filter = await FilterCollection.findOneByUserIdAndName(userId, req.query.name as string);
    const {usernames, tags} = filter;
    const freets = await findFreetsByParameters(usernames, tags);
    const response = freets.map(constructFreetResponse);
    res.status(200).json(response);
  },
  [
    filterValidator.isValidParameters,
    filterValidator.isValidUsernameList,
    taglistValidator.isValidTaglist
  ],
  async (req: Request, res: Response) => {
    const usernames = (req.query.usernames as string) === '' ? [] : (req.query.usernames as string).split(',');
    const taglist = (req.query.tags as string) === '' ? [] : (req.query.tags as string).split(',');

    const users = await UserCollection.retrieveUsers(usernames);
    const userIds = users.map(u => u._id);
    const tags = await TagCollection.findOrCreateMany(taglist);
    const tagIds = tags.map(t => t._id);

    const freets = await findFreetsByParameters(userIds, tagIds);
    const response = freets.map(constructFreetResponse);
    res.status(200).json(response);
  }
);

/**
 * Get freets matching specified parameters.
 *
 * @param {string[]} usernames - The users to filter for
 * @param {string[]} tags - The tags to filter for
 * @returns {Promise<HydratedDocument<Freet>[]>} - The array of freets matching parameters, not de-duplicated
 */
export const findFreetsByParameters = async (usernames: Types.ObjectId[], tags: Types.ObjectId[]): Promise<Array<HydratedDocument<Freet>>> => {
  const promises = [];
  const taglists = await TaglistCollection.filterByTag(tags);
  for (const taglist of taglists) {
    promises.push(FreetCollection.findOne(taglist.freetId._id));
  }

  const resultsMatchingTag = await Promise.all(promises);
  const resultsMatchingAuthor = await FreetCollection.filterByAuthor(usernames);

  const freetIds = new Set();
  const output = [];

  for (const results of [resultsMatchingAuthor, resultsMatchingTag]) {
    for (const result of results) {
      if (!freetIds.has(result._id.toString())) {
        freetIds.add(result._id.toString());
        output.push(result);
      }
    }
  }

  return output;
};

export {router as filterRouter};
export {searchRouter};
