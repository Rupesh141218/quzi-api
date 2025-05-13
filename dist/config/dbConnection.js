"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const constant_1 = require("./constant");
const db_connection_uri = constant_1.MONGODB_URI;
const dbConnection = async () => {
    await mongoose_1.default
        .connect(db_connection_uri, {})
        .then(() => console.log('Connected to database'))
        .catch((err) => console.log('Connection Error', err));
};
exports.dbConnection = dbConnection;
