const UnifiedComponent = ({ relevantAnswerKey, circuitData }) => {
  const booleanExpressions = circuitData?.boolean_expressions || [];

  return (
    <div className="bg-white text-gray-800 text-base rounded-lg w-full max-h-[550px] flex flex-col overflow-hidden border border-gray-300 shadow-md">
      <div className="bg-gray-800 text-white text-md font-medium p-2 rounded-t-lg">
        Answer Keys & Boolean Results
      </div>

      <div className="flex flex-col gap-4 p-4 overflow-y-auto">
        <div className="mb-4">
          <h3 className="font-bold text-gray-700 mb-2">Answer Keys</h3>
          {relevantAnswerKey ? (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2 text-sm">
                {relevantAnswerKey.item}
              </h4>
              {relevantAnswerKey.keys.map((key, keyIndex) => (
                <div
                  key={keyIndex}
                  className="flex items-center gap-4 p-2 bg-gray-50 border border-gray-200 rounded-md"
                >
                  <span className="text-sm text-gray-600 flex-grow">
                    {key.expression}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center italic">
              No answer keys available for the selected file.
            </div>
          )}
        </div>

        <div>
          <h3 className="font-bold text-gray-700 mb-2">Boolean Results</h3>
          {booleanExpressions.length > 0 ? (
            booleanExpressions.map((expressionObj, index) => {
              const [label, expression] = Object.entries(expressionObj)[0];
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 p-2 bg-gray-50 border border-gray-200 rounded-md"
                >
                  <span className="font-semibold text-gray-700 bg-gray-200 px-4 py-2 rounded-md w-20 text-center">
                    {label}
                  </span>
                  <span className="text-sm text-gray-600 flex-grow">
                    {expression}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="text-gray-500 text-center italic">
              No Boolean expressions available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedComponent;
