import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import axios from 'axios';
import useErrorHandler from '../../hooks/useErrorHandler';
import FilterCreateNav from './components/FilterCreateNav.jsx';
import TaskList from './components/TaskList.jsx';
import { UserAtom } from '../../atoms/UserAtom';
import { TasksAtom } from '../../atoms/TasksAtom.js';
import { ClassesAtom } from '../../atoms/ClassesAtom.js';
import useGetTasks from '../../hooks/useGetTasks.jsx';
import useGetClasses from '../../hooks/useGetClasses.jsx'
import EmptyTasksPlaceholder from './components/EmptyTaskPlaceholder.jsx';

const Dashboard = () => {
  const { userId } = useParams();
  const [currentUser, setCurrentUser] = useRecoilState(UserAtom);
  const tasks = useRecoilValue(TasksAtom);
  const classList = useRecoilValue(ClassesAtom);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const { handleError } = useErrorHandler();
  const getTasks = useGetTasks();
  const getClasses = useGetClasses();

  const refreshTasks = async () => {
    await getTasks();
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/auth/user/${userId}`);
        const fetchedUser = response.data.user;

        if (currentUser?.id !== fetchedUser?.id) {
          handleError('unauthorized', 'You are not authorized to access this page.');
          return;
        }

        setCurrentUser(fetchedUser);
        await getTasks()
        await getClasses()
      } catch (error) {
        if (error.response?.status === 401) {
          handleError('unauthorized', 'Your session has expired. Login again.');
        } else if (error.response?.status === 404) {
          handleError('404', 'The resource you are looking for could not be found.');
        } else {
          handleError('default', 'An unexpected error occurred.');
        }
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
