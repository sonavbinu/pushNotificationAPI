"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvVariable = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Validate and get env variable 
const getEnvVariable = (name) => {
    const value = process.env[name];
    if (!value) {
        console.error(`Error: Environment variable '${name}' is not defined.`);
        process.exit(1);
    }
    return value;
};
exports.getEnvVariable = getEnvVariable;
