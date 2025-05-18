import { useEffect, useState } from "react";
import axios from "axios";
import ClassCard from "./components/ClassCard";
import AddClass from "./components/AddClass";
// You can use any icon library, here is a simple emoji for demo
import { FaTrash } from "react-icons/fa";
import useToast from "../../hooks/useToast";
import { useConfirm } from "../../contexts/ConfirmContext"


const ClassPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const {toastSuccess} = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get("/classes/get-classes");
        setClasses(response.data);
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const groupByCourseCode = (classes) => {
    const grouped = {};
    classes.forEach(cls => {
      if (!grouped[cls.class_code]) {
        grouped[cls.class_code] = [];
      }
      grouped[cls.class_code].push(cls);
    });
    return grouped;
  };

  const handleCourseCardClick = (course_code) => {
    setSelectedCourse(course_code);
    setModalOpen(true);
  };

  const handleDeleteGroup = async (e, classData) => {
      e.stopPropagation();
      const verificationText = `${classData.class_code}_${classData.class_schedule}_remove`;
  
      const message =`Deleting the class will remove all the tasks associated to it. Please type "${verificationText}" to confirm deletion.`
      const result = await confirm(message, true, verificationText);
      if (!result) return
  
      try {
        const response = await axios.delete(`/classes/delete-class/${classData.id}`);
        if (response.status === 200) {
          toastSuccess(`Class ${classData.class_code} was deleted successfully.`)
          const refreshed = await axios.get("/classes/get-classes");
          setClasses(refreshed.data);

          const grouped = groupByCourseCode(refreshed.data);
          if (!grouped[selectedCourse] || grouped[selectedCourse].length === 0) {
            setModalOpen(false);
          }
        }
      } catch (error) {
        console.error("Error deleting class:", error);
        alert("Failed to delete the class. Please try again.");
      }
    };

  const groupedClasses = groupByCourseCode(classes);

  return (
    <div className="w-full p-10 bg-[#EFEFEF] min-h-screen">
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
          {Object.entries(groupedClasses).map(([course_code, group]) => (
            <div key={course_code} className="w-full sm:w-[250px] lg:w-[300px]">
              <ClassCard
                classData={{
                  class_code: course_code,
                }}
                groupCount={group.length}
                groupPreview={group.slice(0, 3)} 
                onClick={() => handleCourseCardClick(course_code)}
              />
            </div>
          ))}
          <AddClass />
        </div>
      )}
      {modalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Groups for {selectedCourse}</h2>
            <ul>
              {groupedClasses[selectedCourse].map(cls => (
                <li
                  key={cls.id}
                  className="mb-2 p-2 rounded hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  onClick={() => {
                    setModalOpen(false);
                    window.location.href = `/edit-class/${cls.id}`;
                  }}
                >
                  <div>
                    <span>Group {cls.class_group}</span>
                    <span className="text-xs text-gray-500 ml-2">{cls.class_schedule}</span>
                  </div>
                  <button
                    className="ml-4 text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded"
                    onClick={e => handleDeleteGroup(e, cls)}
                    title="Remove group"
                  >
                    <FaTrash/>
                  </button>
                </li>
              ))}
            </ul>
            <button className="mt-4 px-4 py-2 bg-gray-200 rounded" onClick={() => setModalOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassPage;