import { useState } from "react";
import { FaRegCopy, FaCheck } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";

const CopyableLink = ({ link }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg shadow-md border">
      <span className="text-sm font-medium text-gray-700 truncate">{link}</span>

      <button
        className={`p-2 rounded-full ${
          copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
        }`}
        onClick={handleCopy}
        title="Copy to clipboard"
      >
        {copied ? <FaCheck /> : <FaRegCopy />}
      </button>

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
        title="Open link in new tab"
      >
        <FiExternalLink />
      </a>
    </div>
  );
};

export default CopyableLink;
