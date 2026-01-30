"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationStatus = exports.VisaType = exports.ServiceType = exports.InquiryStatus = exports.UserRole = void 0;
// User roles enum
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["AGENT"] = "AGENT";
})(UserRole || (exports.UserRole = UserRole = {}));
// Inquiry status enum
var InquiryStatus;
(function (InquiryStatus) {
    InquiryStatus["PENDING"] = "PENDING";
    InquiryStatus["IN_PROGRESS"] = "IN_PROGRESS";
    InquiryStatus["APPROVED"] = "APPROVED";
    InquiryStatus["REJECTED"] = "REJECTED";
    InquiryStatus["COMPLETED"] = "COMPLETED";
})(InquiryStatus || (exports.InquiryStatus = InquiryStatus = {}));
// Service types enum
var ServiceType;
(function (ServiceType) {
    ServiceType["VISA_APPLICATION"] = "VISA_APPLICATION";
    ServiceType["TOURISM_PACKAGE"] = "TOURISM_PACKAGE";
    ServiceType["CONSULTATION"] = "CONSULTATION";
    ServiceType["DOCUMENT_REVIEW"] = "DOCUMENT_REVIEW";
})(ServiceType || (exports.ServiceType = ServiceType = {}));
// Visa types enum
var VisaType;
(function (VisaType) {
    VisaType["B1_B2"] = "B1_B2";
    VisaType["F1"] = "F1";
    VisaType["J1"] = "J1";
    VisaType["H1B"] = "H1B";
    VisaType["L1"] = "L1";
    VisaType["O1"] = "O1";
    VisaType["OTHER"] = "OTHER";
})(VisaType || (exports.VisaType = VisaType = {}));
// Application status enum
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["DRAFT"] = "DRAFT";
    ApplicationStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ApplicationStatus["SUBMITTED"] = "SUBMITTED";
    ApplicationStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    ApplicationStatus["COMPLETED"] = "COMPLETED";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
//# sourceMappingURL=index.js.map