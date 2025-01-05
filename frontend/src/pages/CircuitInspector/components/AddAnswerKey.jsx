const AddAnswerKey = ({onClose, onAddAnswerKey}) => {
  return (
    <div className='bg-secondaryBg p-4 rounded-lg w-[370px] flex flex-col gap-4'>
      <h1 className='font-semibold text-sm'>Detect Logic Gates:</h1>
      <div className="flex gap-4 text-sm">
        <input type="text" className="w-8 bg-primaryBg border border-borderGray rounded-md text-center" placeholder="Y1"/>
        <input type="text" className="flex-grow bg-primaryBg border border-borderGray rounded-md pl-1" placeholder="X1 OR X2"/>
      </div>
      <div className='flex justify-end text-sm gap-3'>
        <button className='bg-thirdBg p-2 rounded-lg' onClick={onClose}>Cancel</button>
        <button className='bg-primaryColor p-2 rounded-lg' onClick={onAddAnswerKey}>Save</button>
      </div>
    </div>
  )
}
export default AddAnswerKey