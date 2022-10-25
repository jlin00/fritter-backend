import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import * as factCheckValidator from './middleware';
import * as freetValidator from '../freet/middleware';
import * as userValidator from '../user/middleware';
import * as util from './util';
import {VoteCollection, ReferenceLinkCollection} from './collection';

const router = express.Router();

/**
 * Get votes for a freet.
 *
 * @name GET /api/credibility/:freetId/votes
 *
 * @return {VoteResponse[]} - The credibility votes of a given freet
 * @throws {404} - If the freetId is not valid
 */
router.get(
  '/:freetId/votes',
  [
    freetValidator.isFreetExists
  ],
  async (req: Request, res: Response) => {
    const votes = await VoteCollection.findAllByFreetId(req.params.freetId);
    const response = votes.map(util.constructVoteResponse);
    res.status(200).json(response);
  }
);

/**
 * Add a new credibility vote to given freet.
 *
 * @name POST /api/credibility/:freetId/votes
 *
 * @param {boolean} credible - Whether the vote is credible or uncredible
 * @return {VoteResponse} - The created vote
 * @throws {403} - If the user is not logged in
 * @throws {404} - If the freetId is invalid
 * @throws {409} - If the user has already issued a vote for the given freet
 */
router.post(
  '/:freetId/votes',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    factCheckValidator.hasNotAlreadyVoted
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const vote = await VoteCollection.addOne(req.params.freetId, userId, req.body.credible);

    res.status(201).json({
      message: 'Your vote was issued successfully.',
      vote: util.constructVoteResponse(vote)
    });
  }
);

/**
 * Delete a credibility vote from given freet
 *
 * @name DELETE /api/credibility/:freetId/votes
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in
 * @throws {404} - If the freetId is not valid or there is no vote from the user on given freet
 */
router.delete(
  '/:freetId/votes',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    factCheckValidator.hasAlreadyVoted
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    await VoteCollection.deleteOne(req.params.freetId, userId);

    res.status(200).json({
      message: 'Your vote was deleted successfully.'
    });
  }
);

/**
 * Get reference links for a freet.
 *
 * @name GET /api/credibility/:freetId/links
 *
 * @return {ReferenceLinkResponse[]} - The reference links of a given freet
 * @throws {404} - If the freetId is not valid
 */
router.get(
  '/:freetId/links',
  [
    freetValidator.isFreetExists
  ],
  async (req: Request, res: Response) => {
    const refLinks = await ReferenceLinkCollection.findAllByFreetId(req.params.freetId);
    const response = refLinks.map(util.constructReferenceLinkResponse);
    res.status(200).json(response);
  }
);

/**
 * Add a new reference link for given freet.
 *
 * @name POST /api/credibility/:freetId/links
 *
 * @param {string} link - The reference link
 * @return {referenceLinkResponse} - The created reference link
 * @throws {403} - If the user is not logged in
 * @throws {404} - If the freetId is invalid
 * @throws {413} - If link is poorly formatted
 */
router.post(
  '/:freetId/links',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    factCheckValidator.isValidURL
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const refLink = await ReferenceLinkCollection.addOne(req.params.freetId, userId, req.body.link);

    res.status(201).json({
      message: 'Your reference link was added successfully.',
      refLink: util.constructReferenceLinkResponse(refLink)
    });
  }
);

/**
 * Delete a reference link from given freet
 *
 * @name DELETE /api/credibility/links/:linkId
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or user is not the issuer of the reference link
 * @throws {404} - If the linkId is not valid
 */
router.delete(
  '/links/:linkId',
  [
    userValidator.isUserLoggedIn,
    factCheckValidator.isReferenceLinkExists,
    factCheckValidator.isValidReferenceLinkModifier
  ],
  async (req: Request, res: Response) => {
    await ReferenceLinkCollection.deleteOne(req.params.linkId);

    res.status(200).json({
      message: 'Your reference link was deleted successfully.'
    });
  }
);

export {router as factCheckRouter};
