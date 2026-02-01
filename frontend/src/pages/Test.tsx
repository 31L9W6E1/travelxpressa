import { useState } from "react";

const Test = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Test Component</h1>
      <p>Count: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Increment
      </button>
      <p className="mt-4 text-sm text-gray-600">
        If you can see this component and click the button, the application is working.
      </p>
    </div>
  );
};

export default Test;