import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ZodError, ZodType } from "zod";

declare module "express-serve-static-core" {
    interface Request {
        validated?: {
            body?: unknown;
            params?: unknown;
            query?: unknown;
        };
    }
}

export function validate(schemas: {
    body?: ZodType<any>;
    params?: ZodType<any>;
    query?: ZodType<any>;
}) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.validated = {};

            if (schemas.body) {
                req.validated.body = schemas.body.parse(req.body);
            }
            if (schemas.params) {
                req.validated.params = schemas.params.parse(req.params);
            }
            if (schemas.query) {
                req.validated.query = schemas.query.parse(req.query);
            }

            next();
        } catch (err) {
            if (err instanceof ZodError) {
                return res.status(400).json({
                    message: "Validation failed",
                    issues: err.issues,
                });
            }
            return next(err);
        }
    };
}

/**
 * Middleware to check validation results
 */
export const checkValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
        return;
    }

    next();
};