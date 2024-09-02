"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const tour_1 = __importDefault(require("./routes/tour"));
const user_1 = __importDefault(require("./routes/user"));
const app = (0, express_1.default)();
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
app.use(express_1.default.json());
app.use(express_1.default.static(`${__dirname}/public`));
app.use("/api/v1/tours", tour_1.default);
app.use("/api/v1/users", user_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map