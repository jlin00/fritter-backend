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
        message: `Taglist with freet ID ${req.params.freetId} does not exist.`
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
        message: `Taglist with freet ID ${req.params.freetId} already exists.`
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
  let tags;
  if (req.query.tags !== undefined) {
    tags = (req.query.tags as string) === '' ? [] : (req.query.tags as string).split(',');
  } else if (req.query.tags === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    tags = req.body.tags;
  }

  const tagRegex = /^\w+$/i;
  for (const tag of tags) {
    if (!tagRegex.test(tag)) {
      res.status(400).json({
        error: {
          message: 'Tag must be a nonempty alphanumeric string.'
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
