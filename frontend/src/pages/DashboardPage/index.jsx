import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import axios from 'axios';
import useErrorHandler from '../../hooks/useErrorHandler';
import FilterCreateNav from './components/FilterCreateNav.jsx';
import TaskList from './components/TaskList.jsx';
import { UserAtom } from '../../atoms/UserAtom';
import { TasksAtom } from '../../atoms/TasksAtom.js';
import useGetTasks from '../../hooks/useGetTasks.jsx';
import EmptyTasksPlaceholder from './components/EmptyTaskPlaceholder.jsx';
import { ImSpinner9 } from "react-icons/im";


const Dashboard = () => {
  const { userId } = useParams();
  const [currentUser, setCurrentUser] = useRecoilState(UserAtom);
  const tasks = useRecoilValue(TasksAtom);
  const [filter, setFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const { handleError } = useErrorHandler();
  const getTasks = useGetTasks();

  const refreshTasks = async () => {
    setIsLoading(true);
    await getTasks();
    setIsLoading(false);
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
    refreshTasks()
  }, [userId]);

  const handleFilterChange = (filter) => {
    setFilter(filter);
  };

  if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <ImSpinner9 className="animate-spin text-4xl text-black" />
        </div>
      );
    }

  return (
    <div id="dashboard-page" className="flex flex-col w-full h-screen bg-white p-10 max-w-screen-xl mx-auto overflow-y-auto">
      <FilterCreateNav onFilterChange={handleFilterChange} />
      {tasks?.length === 0 ? (
        <EmptyTasksPlaceholder />
      ) : (
        <TaskList filter={filter} tasks={tasks} refreshTasks={refreshTasks}/>
      )}
    </div>
  );
};

export default Dashboard;
