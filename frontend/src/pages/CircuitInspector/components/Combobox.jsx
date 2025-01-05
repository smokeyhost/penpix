import Select from 'react-select';
import classnames from 'classnames';

const truncateLabel = (label, maxLength = 20) => {
  return label.length > maxLength ? `${label.slice(0, maxLength)}...` : label;
};

const customStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: '#FFFFFF',
    borderColor: '#686868',
    color: '#FFFFFF',
    fontSize: '13px',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#2F2F2F',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#2F2F2F',
    fontSize: '13px',
  }),
  option: (provided, state) => ({
    ...provided,
    color: state.isSelected ? '#FFFFFF' : '#FFFFFF',
    backgroundColor: state.isSelected ? '#686868' : '#2F2F2F',
    '&:hover': {
      backgroundColor: '#686868',
      color: '#FFFFFF',
    },
  }),
};

const ComboBox = ({ options, value, onOptionSelect }) => {
  const handleChange = (selectedOption) => {
    onOptionSelect(selectedOption);
  };

  const truncatedOptions = options.map(option => ({
    ...option,
    label: truncateLabel(option.label),
  }));

  return (
    <Select
      options={truncatedOptions}
      value={value ? { ...value, label: truncateLabel(value.label) } : value}
      onChange={handleChange}
      styles={customStyles}
      className={classnames('w-full')}
      classNamePrefix="react-select"
      isSearchable 
      noOptionsMessage={() => "No submissions"}
    />
  );
};

export default ComboBox;
