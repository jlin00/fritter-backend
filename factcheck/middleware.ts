import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import {VoteCollection, ReferenceLinkCollection} from './collection';

/**
 * Check that a user has not already issued a vote for a freet
 */
const hasNotAlreadyVoted = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.freetId);
  const vote = validFormat ? await VoteCollection.findOneByFreetIdAndIssuerId(req.params.freetId, req.session.userId) : '';
  if (vote) {
    res.status(409).json({
      error: {
        message: 'You have already issued a vote for this freet.'
      }
    });
    return;
  }

  next();
};

/**
 * Check that a user has issued a vote for a freet
 */
const hasAlreadyVoted = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.freetId);
  const vote = validFormat ? await VoteCollection.findOneByFreetIdAndIssuerId(req.params.freetId, req.session.userId) : '';
  if (!vote) {
    res.status(404).json({
      error: {
        message: 'You have not issued a vote for this freet.'
      }
    });
    return;
  }

  next();
};

/**
 * Check that a URL is correctly formatted
 */
const isValidURL = async (req: Request, res: Response, next: NextFunction) => {
  const urlRegex = /(http|https):\/\/(www.)?[a-zA-Z0-9.\-/]{2,256}/;
  if (!urlRegex.test(req.body.link)) {
    res.status(413).json({
      error: {
        message: 'Link must be a valid URL.'
      }
    });
    return;
  }

  next();
};

/**
 * Check that reference link exists
 */
const isReferenceLinkExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.linkId);
  const refLink = validFormat ? await ReferenceLinkCollection.findOne(req.params.linkId) : '';
  if (!refLink) {
    res.status(404).json({
      error: {
        message: `Reference link with ID ${req.params.linkId} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Check that user is the one who issued reference link
 */
const isValidReferenceLinkModifier = async (req: Request, res: Response, next: NextFunction) => {
  const refLink = await ReferenceLinkCollection.findOne(req.params.linkId);
  const userId = refLink.issuerId._id;
  if (req.session.userId !== userId.toString()) {
    res.status(403).json({
      error: {
        message: 'Cannot modify other users\' reference links.'
      }
    });
    return;
  }

  next();
};

export {
  hasNotAlreadyVoted,
  hasAlreadyVoted,
  isValidURL,
  isReferenceLinkExists,
  isValidReferenceLinkModifier
};
