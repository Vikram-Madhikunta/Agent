import { Router } from "express";
import { body } from "express-validator";
import * as adminControllers from "../controllers/adminControllers.js";
import * as Middleware from "../middleware/auth.js";
import { isAdmin } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

router.post(
    "/create-User",Middleware.authUser,isAdmin,
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("name").isLength({ min: 3 }),
    body("mobile").isLength({ min: 10 }),
    body("password").isLength({ min: 6 }),
    adminControllers.createUser
);

router.get(
    "/getUsers", Middleware.authUser,isAdmin,
    adminControllers.getAllUsers
);

router.delete(
    "/delete-User/:id", Middleware.authUser,isAdmin,
    adminControllers.deleteUser
)

router.put(
    "/update-User/:id", Middleware.authUser, isAdmin,
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("name").isLength({ min: 3 }),
    body("mobile").isLength({ min: 10 }),
    body("password").isLength({ min: 6 }),
    adminControllers.updateUser
);



router.post(
    '/upload-list',
    Middleware.authUser,
    isAdmin,
    upload.single('file'),
    adminControllers.parseListFile
);

router.get(
    '/assigned-tasks/:id',
    Middleware.authUser,
    adminControllers.getTasksByAgent
)

export default router;
