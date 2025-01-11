import useClassData from '../../../hooks/useClassData'
import { formatDueDateTime } from "../../../utils/helpers";

const TaskItem = ({task}) => {
  const {classData, loading} = useClassData(Number(task.class_id))
  // const gradedFilesCount = task.files.filter(file => file.graded).length;
  const dueDate = new Date(task.due_date);
  const currentDate = new Date();
  const isPastDue = currentDate > dueDate;
  const studentListLength = classData?.student_list?.length || 0;

  if (loading) return
  return (
    <>
      <div className="text-left pl-3 font-semibold text-gray-500">{classData?.class_code} | {classData?.class_group}</div>
      <div className="col-span-2 font-semibold text-left">{task.title}</div>
      <div className="text-center border border-gray-300 rounded-md w-16 py-1 mx-auto">
        <p>{task.total_submissions}/{studentListLength}</p>
      </div>
      <div className={`text-center ${isPastDue ? "text-red-500" : "text-gray-600"}`}>{formatDueDateTime(task.due_date)}</div>
      <div className="text-center col-span-1 font-semibold">{task.exam_type}</div>
    </>
  )
}

export default TaskItem