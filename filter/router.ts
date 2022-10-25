import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import FilterCollection from './collection';
import UserCollection from '../user/collection';
import * as filterValidator from './middleware';
import * as userValidator from '../user/middleware';
import * as taglistValidator from '../taglist/middleware';
import * as util from './util';
import type {User} from '../user/model';
import {retrieveTags} from '../taglist/router';
import type {Types} from 'mongoose';

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
    const userlist = await retrieveUsers(req.body.usernames);
    const taglist = await retrieveTags(req.body.tags);

    const filter = await FilterCollection.addOne(userId, req.body.name, userlist, taglist);
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
    const userlist = await retrieveUsers(req.body.usernames);
    const taglist = await retrieveTags(req.body.tags);

    const filter = await FilterCollection.updateOne(req.params.filterId, req.body.name, userlist, taglist);
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

/**
 * Given list of strings representing usernames, return user objects.
 *
 * @param {string[]} usernames - A list of usernames represented as strings
 * @returns {Types.ObjectId[]} - A list of ids associated with the user objects
 */
export const retrieveUsers = async (usernames: string[]): Promise<Types.ObjectId[]> => {
  const promises = [];

  for (const username of usernames) {
    promises.push(UserCollection.findOneByUsername(username));
  }

  const users: User[] = await Promise.all(promises);
  return users.map(u => u._id);
};

export {router as filterRouter};
