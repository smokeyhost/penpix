import { truncateText } from '../../../utils/helpers'

const ClassCard = ({ classData, onClick, groupCount, groupPreview }) => {
  return (
    <div
      className="group relative shadow-xl rounded-lg w-full sm:w-[250px] lg:w-[300px] h-auto sm:h-[270px] lg:h-[300px] p-4 sm:p-5 cursor-pointer transform hover:scale-105 duration-200 bg-white overflow-hidden"
      onClick={onClick}
    >
      <div className="mb-2">
        <h3 className="font-bold text-2xl sm:text-3xl text-customBlack1">{classData.class_code}</h3>
        <span className="block text-xs sm:text-sm text-gray-500 font-medium">Course Code</span>
      </div>

      <div className="mb-4">
        <span className="inline-block bg-gray-100 text-gray-700 rounded px-2 py-1 text-xs sm:text-sm font-semibold">
          {groupCount} {groupCount === 1 ? "Group" : "Groups"}
        </span>
      </div>

      {/* Group Preview Section */}
      <div className="mt-5">
        <h4 className="text-xs sm:text-sm font-semibold mb-1">Groups Preview</h4>
        <ul className="text-gray-500 list-disc list-inside pl-5 flex flex-col gap-1">
          {groupPreview && groupPreview.length > 0 ? (
            groupPreview.map((group, idx) => (
              <li key={idx}>
                Group {group.class_group}
                {group.class_schedule && (
                  <span className="ml-2 text-xs text-gray-400">
                    ({truncateText(group.class_schedule, 20)})
                  </span>
                )}
              </li>
            ))
          ) : (
            <li>No groups available</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ClassCard;