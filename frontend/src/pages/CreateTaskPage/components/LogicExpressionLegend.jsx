const LogicExpressionLegend = () => {
  return (
    <div className=" absolute
      left-full top-1/2 -translate-y-1/2 ml-4
      w-[350px] max-sm:w-[250px]
      p-4 bg-white border border-gray-300 rounded-lg shadow-lg
      opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50
      max-sm:left-1/2 max-sm:top-full max-sm:ml-0 max-sm:mt-2 max-sm:-translate-x-1/2 max-sm:translate-y-0 max-sm:-translate-y-0">
      <h3 className="font-semibold text-gray-800 mb-2 text-base sm:text-lg">Logic Expression Legend</h3>
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm sm:text-base text-blue-700">~</span>
          <span className="text-gray-700 text-xs sm:text-sm">NOT (Negation)</span>
          <span className="ml-2 text-gray-500 text-xs sm:text-sm">e.g. <span className="font-mono">~A</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm sm:text-base text-blue-700">|</span>
          <span className="text-gray-700 text-xs sm:text-sm">OR (Disjunction)</span>
          <span className="ml-2 text-gray-500 text-xs sm:text-sm">e.g. <span className="font-mono">A | B</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm sm:text-base text-blue-700">&</span>
          <span className="text-gray-700 text-xs sm:text-sm">AND (Conjunction)</span>
          <span className="ml-2 text-gray-500 text-xs sm:text-sm">e.g. <span className="font-mono">A & B</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm sm:text-base text-blue-700">^</span>
          <span className="text-gray-700 text-xs sm:text-sm">XOR (Exclusive OR)</span>
          <span className="ml-2 text-gray-500 text-xs sm:text-sm">e.g. <span className="font-mono">A ^ B</span></span>
        </div>
      </div>
      <div className="mb-2">
        <h4 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Combinations:</h4>
        <ul className="list-disc list-inside text-gray-700 text-xs sm:text-sm space-y-1">
          <li>
            <span className="font-mono">~(A & B)</span> <span className="text-gray-500">NAND (Not AND)</span>
          </li>
          <li>
            <span className="font-mono">~(A | B)</span> <span className="text-gray-500">NOR (Not OR)</span>
          </li>
          <li>
            <span className="font-mono">A & ~B</span> <span className="text-gray-500">A AND (NOT B)</span>
          </li>
          <li>
            <span className="font-mono">~A | B</span> <span className="text-gray-500">NOT A OR B</span>
          </li>
          <li>
            <span className="font-mono">A ^ B</span> <span className="text-gray-500">A XOR B</span>
          </li>
          <li>
            <span className="font-mono">~(A ^ B)</span> <span className="text-gray-500">XNOR (Not XOR)</span>
          </li>
        </ul>
      </div>
      <div className="mb-2">
        <h4 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Inputs:</h4>
        <p className="text-gray-700 text-xs sm:text-sm">Inputs should be labeled <span className="font-mono">A, B, C, ... G</span></p>
      </div>
      <div>
        <h4 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Example:</h4>
        <p className="text-gray-700 text-xs sm:text-sm font-mono">A ^ B | (C & ~A)</p>
      </div>
    </div>
  );
};

export default LogicExpressionLegend;