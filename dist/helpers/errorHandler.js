"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.undefinedMethodHandler = exports.errorHandler = exports.ErrorHandler = void 0;
var ErrorHandler = /** @class */ (function (_super) {
    __extends(ErrorHandler, _super);
    function ErrorHandler(status, code) {
        var _this = _super.call(this) || this;
        _this.status = status;
        _this.code = code;
        return _this;
    }
    return ErrorHandler;
}(Error));
exports.ErrorHandler = ErrorHandler;
exports.errorHandler = function (err, req, res, next) {
    if ("status" in err && "code" in err) {
        var status_1 = err.status, code = err.code;
        res.status(status_1).send(code);
    }
    else if ("status" in err) {
        var status_2 = err.status;
        res.sendStatus(status_2);
    }
    else {
        res.status(500).send("undefiend_error_occured");
    }
};
exports.undefinedMethodHandler = function (req, res, next) {
    res.status(405).send("undefined_method");
};
