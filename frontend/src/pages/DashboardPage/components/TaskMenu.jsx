const TaskMenu = ({onDelete, onGetLink, onGetTemplate}) => {

  const handleDelete = (event) => {
    event.stopPropagation()
    onDelete()
  }

  const handleGetLink = (event) => {
    event.stopPropagation();
    onGetLink(event)
  };

  const handleGetTemplate = (event) =>{
    event.stopPropagation() 
    onGetTemplate(event)
  }
 

  return (
    <div className="absolute h-fit right-0 -bottom-32 bg-white border border-gray-300 shadow-lg rounded-md p-2 w-48 z-50 max-md:top-8 max-md:right-3">
      <ul className="space-y-2">
        <li>
          <button className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md" onClick={(event) => handleGetLink(event)}>
            Generate Link
          </button>
        </li>
        <li>
          <button className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md" onClick={(event) => handleGetTemplate(event)}>
            Get Template
          </button>
        </li>
        <li>
          <button className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-md" onClick={(event) => handleDelete(event)}>
            Remove Task
          </button>
        </li>
      </ul>
    </div>
  );
}

export default TaskMenu;
