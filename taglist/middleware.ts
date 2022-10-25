import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import TaglistCollection from './collection';

/**
 * Checks if a taglist for freet with freetId exists
 */
const isTaglistExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.freetId);
  const taglist = validFormat ? await TaglistCollection.findOne(req.params.freetId) : '';
  if (!taglist) {
    res.status(404).json({
      error: {
        taglist: `Taglist with freet ID ${req.params.freetId} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks that no taglist for freet with freetId exists
 */
const noTaglistExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.freetId);
  const taglist = validFormat ? await TaglistCollection.findOne(req.params.freetId) : '';
  if (taglist) {
    res.status(409).json({
      error: {
        taglist: `Taglist with freet ID ${req.params.freetId} already exists.`
      }
    });
    return;
  }

  next();
};

/**
 * Check that each tag in the taglist is valid, it matches the tag regex
 */
const isValidTaglist = async (req: Request, res: Response, next: NextFunction) => {
  const tagRegex = /^\w+$/i;
  for (const tag of req.body.tags) {
    if (!tagRegex.test(tag)) {
      res.status(400).json({
        error: {
          tag: 'Tag must be a nonempty alphanumeric string.'
        }
      });
      return;
    }
  }

  next();
};

export {
  isTaglistExists,
  noTaglistExists,
  isValidTaglist
};
