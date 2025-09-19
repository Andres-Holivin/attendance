import { NextFunction, Request, Response } from "express";

export const getAppSource = (req: Request, res: Response, next: NextFunction) => {
    req.appSource = req.headers['x-app-signature'] as "staff-portal" | "admin-portal" | undefined;
    next();
};