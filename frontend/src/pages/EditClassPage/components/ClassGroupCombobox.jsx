import Select from 'react-select';

const Combobox = ({ options, placeholder, value, onChange }) => {
  const handleChange = (selectedOption) => {
    onChange(selectedOption);
  };

  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: '100%',
    }),
    control: (provided, state) => ({
      ...provided,
      width: '100%',
      borderRadius: '0.5rem',
      borderColor: '#D1D5DB',
      boxShadow: state.isFocused ? 'none' : provided.boxShadow,
      '&:hover': {
        borderColor: '#D1D5DB',
      },
    }),
  };

  return (
    <div className="w-full">
      <Select
        value={options.find(option => option.value === value)} // Ensures the value is selected
        onChange={handleChange}
        options={options}
        placeholder={placeholder}
        classNamePrefix="react-select"
        styles={customStyles}
        isClearable
        isSearchable
      />
    </div>
  );
};

export default Combobox;
