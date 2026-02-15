"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentServiceType = exports.PaymentProvider = exports.PaymentStatus = exports.ApplicationStatus = exports.VisaType = exports.ServiceType = exports.InquiryStatus = exports.UserRole = void 0;
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
    ServiceType["TRANSLATION_SERVICE"] = "TRANSLATION_SERVICE";
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
    ApplicationStatus["PAYMENT_PENDING"] = "PAYMENT_PENDING";
    ApplicationStatus["SUBMITTED"] = "SUBMITTED";
    ApplicationStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    ApplicationStatus["COMPLETED"] = "COMPLETED";
    ApplicationStatus["REJECTED"] = "REJECTED";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
// Payment types
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PROCESSING"] = "PROCESSING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["CANCELLED"] = "CANCELLED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
    PaymentStatus["PARTIALLY_REFUNDED"] = "PARTIALLY_REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["QPAY"] = "QPAY";
    PaymentProvider["KHAN_BANK"] = "KHAN_BANK";
    PaymentProvider["MONPAY"] = "MONPAY";
    PaymentProvider["SOCIALPAY"] = "SOCIALPAY";
    PaymentProvider["BANK_TRANSFER"] = "BANK_TRANSFER";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
var PaymentServiceType;
(function (PaymentServiceType) {
    PaymentServiceType["VISA_APPLICATION"] = "VISA_APPLICATION";
    PaymentServiceType["CONSULTATION"] = "CONSULTATION";
    PaymentServiceType["DOCUMENT_REVIEW"] = "DOCUMENT_REVIEW";
    PaymentServiceType["RUSH_PROCESSING"] = "RUSH_PROCESSING";
})(PaymentServiceType || (exports.PaymentServiceType = PaymentServiceType = {}));
//# sourceMappingURL=index.js.map