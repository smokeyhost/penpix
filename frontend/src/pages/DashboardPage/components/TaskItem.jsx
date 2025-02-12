import useClassData from "../../../hooks/useClassData";
import { formatDueDateTime, truncateText } from "../../../utils/helpers";

const TaskItem = ({ task, onHandleMenu }) => {
  const { classData, loading } = useClassData(Number(task?.class_id));
  const gradedFilesCount = task?.files?.filter(file => file.graded).length;
  const dueDate = new Date(task?.due_date);
  const currentDate = new Date();
  const isPastDue = currentDate > dueDate;

  if (loading || !task)
    return (
      <>
        <div className="pl-3 bg-gray-300 rounded h-6 w-32 animate-pulse"></div>
        <div className="col-span-2 bg-gray-300 rounded h-6 w-full animate-pulse"></div>
        <div className="mx-auto bg-gray-300 rounded-md w-16 h-8 animate-pulse"></div>
        <div className="bg-gray-300 rounded h-6 w-24 animate-pulse"></div>
        <div className="col-span-1 bg-gray-300 rounded h-6 w-20 animate-pulse"></div>
        <button className="text-right col-span-1 pr-4 animate-pulse">
          <div className="bg-gray-300 h-6 w-6 inline-block rounded"></div>
        </button>
      </>
    );

  return (
    <>
      <div className="text-left pl-3 font-semibold text-gray-500">
        {classData?.class_code} | {truncateText(classData?.class_group, 10)}
      </div>
      <div className="col-span-2 font-semibold text-left">
        {truncateText(task?.title, 15)}
      </div>
      <div className="text-center border border-gray-300 rounded-md w-16 py-1 mx-auto">
        <p>
          {gradedFilesCount}/{task?.total_submissions}
        </p>
      </div>
      <div className={`text-center ${isPastDue ? "text-red-500" : "text-gray-600"}`}>
        {formatDueDateTime(task?.due_date)}
      </div>
      <div className="text-center col-span-1 font-semibold">{task?.exam_type}</div>
      <button
        className="text-right col-span-1 pr-4"
        onClick={(event) => {
          event.stopPropagation();
          onHandleMenu(event, task);
        }}
      >
        <img
          className="inline-block"
          src="/icons/meatballs_menu.svg"
          alt="Menu icon"
        />
      </button>
    </>
  );
};

export default TaskItem;
