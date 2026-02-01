import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
const Test = () => {
    const [count, setCount] = useState(0);
    return (_jsxs("div", { className: "p-8 text-center", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Test Component" }), _jsxs("p", { children: ["Count: ", count] }), _jsx("button", { onClick: () => setCount(count + 1), className: "px-4 py-2 bg-blue-500 text-white rounded", children: "Increment" }), _jsx("p", { className: "mt-4 text-sm text-gray-600", children: "If you can see this component and click the button, the application is working." })] }));
};
export default Test;
