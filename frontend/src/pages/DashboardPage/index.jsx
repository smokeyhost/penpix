import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import FilterCreateNav from './components/FilterCreateNav.jsx';
import TaskList from './components/TaskList.jsx';
import { TasksAtom } from '../../atoms/TasksAtom.js';
import { ClassesAtom } from '../../atoms/ClassesAtom.js';
import useGetTasks from '../../hooks/useGetTasks.jsx';
import useGetClasses from '../../hooks/useGetClasses.jsx'
import EmptyTasksPlaceholder from './components/EmptyTaskPlaceholder.jsx';

const Dashboard = () => {
  const { userId } = useParams();
  const tasks = useRecoilValue(TasksAtom);
  const classList = useRecoilValue(ClassesAtom);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const getTasks = useGetTasks();
  const getClasses = useGetClasses();

  const refreshTasks = async () => {
    await getTasks();
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await getTasks()
        await getClasses()
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleFilterChange = (filter) => {
    setFilter(filter);
  };

  return (
    <div id="dashboard-page" className="flex flex-col w-full min-h-screen bg-white p-10 max-w-screen-xl mx-auto">
      <FilterCreateNav onFilterChange={handleFilterChange} />
      {!isLoading && tasks?.length === 0 ? (
        <EmptyTasksPlaceholder />
      ) : (
        <TaskList filter={filter} tasks={tasks} classList={classList} refreshTasks={refreshTasks} loading={isLoading}/>
      )}
    </div>
  );
};

export default Dashboard;
