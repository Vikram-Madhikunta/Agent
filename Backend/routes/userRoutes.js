import { Router } from "express";
import {body} from "express-validator";
import * as userControllers from "../controllers/userControllers.js";

const router = Router();

router.post("/login",body("email").isEmail().withMessage("Please enter a valid email"),
            body("password").isLength({min : 6}) , 
            userControllers.getLogin);

router.post("/register", body("email").isEmail().withMessage("Please enter a valid email"),
            body("password").isLength({min : 6}) , 
            userControllers.registerUser);

router.get("/logout", userControllers.logoutUser);


export default router;

