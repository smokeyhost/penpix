import { useEffect, useState } from "react";
import axios from "axios";
import ClassCard from "./components/ClassCard";
import AddClass from "./components/AddClass";
import { TasksAtom } from "../../atoms/TasksAtom";
import { useRecoilValue } from "recoil";

const ClassPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const tasks = useRecoilValue(TasksAtom);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get("/classes/get-classes");
        setClasses(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching classes:", error);
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleDelete = (classId) => {
    setClasses((prevClasses) =>
      prevClasses.filter((cls) => cls.id !== classId)
    );
  };

  const getRecentTasks = (taskList) => {
    const recentTasks = taskList.map((taskId) => {
      const taskItem = tasks.find((t) => t.id === taskId);
      return taskItem ? taskItem.title : null;
    });
    return recentTasks.filter(Boolean).slice(0, 4);
  };

  return (
    <div className="min-h-screen overflow-y-auto">
      <div className="w-full p-10 bg-[#EFEFEF] h-full">
        {loading ? (
          <div className="flex flex-wrap gap-10 justify-center sm:justify-start">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="group relative shadow-xl rounded-lg w-full sm:w-[250px] lg:w-[300px] 
                          h-auto sm:h-[270px] lg:h-[300px] p-4 sm:p-5 bg-white animate-pulse"
              >
                <div className="mb-4">
                  <div className="bg-gray-300 h-4 w-24 rounded mb-2"></div>
                  <div className="bg-gray-300 h-6 w-32 rounded"></div>
                </div>
                <div className="mb-4">
                  <div className="bg-gray-300 h-4 w-16 rounded"></div>
                </div>
                <div>
                  <div className="bg-gray-300 h-3 w-full rounded mb-1"></div>
                  <div className="bg-gray-300 h-3 w-5/6 rounded mb-1"></div>
                  <div className="bg-gray-300 h-3 w-2/3 rounded"></div>
                </div>
              </div>
            ))}
            <div className="w-full sm:w-[250px] lg:w-[300px] p-4">
              <AddClass />
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-10 justify-center sm:justify-start">
            {classes.length > 0 &&
              classes.map((classData) => {
                const recentTasks = getRecentTasks(classData.task_list);
                return (
                  <ClassCard
                    key={classData.id}
                    classData={classData}
                    onDelete={handleDelete}
                    recentTasks={recentTasks}
                  />
                );
              })}
            <AddClass />
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassPage;
