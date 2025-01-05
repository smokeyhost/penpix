import { useEffect, useState } from "react";
import axios from "axios";
import ClassCard from "./components/ClassCard";
import AddClass from "./components/AddClass";
import { TasksAtom } from '../../atoms/TasksAtom';
import { useRecoilValue } from "recoil";

const ClassPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const tasks = useRecoilValue(TasksAtom); // Get tasks from Recoil atom

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get("/classes/get-classes");
        setClasses(response.data);
        setLoading(false);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleDelete = (classId) => {
    setClasses((prevClasses) => prevClasses.filter((cls) => cls.id !== classId));
  };

  const getRecentTasks = (taskList) => {
    const recentTasks = taskList.map((taskId) => {
      const taskItem = tasks.find(t => t.id === taskId); 
      return taskItem ? taskItem.title : null; 
    });

    return recentTasks.filter(Boolean).slice(0, 4); 
  };

  return (
    <div className="w-full p-10 bg-[#EFEFEF] min-h-screen">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-10 justify-center sm:justify-start">
          {classes.length > 0 && classes.map((classData) => {
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

  );
};

export default ClassPage;
