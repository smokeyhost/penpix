import { useState } from "react";

const ProfileInput = ({profile, inputChange}) => {
  const [updatedProfile, setUpdatedProfile] = useState(profile);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
    inputChange(e)
  };
  return (
    <div className="flex flex-col gap-2 text-lg max-md:text-sm max-sm:w-[200px]">
        <input
          className="text-customGray2 px-2 border-2 border-customGray1 max-sm:w-[150px]"
          placeholder=""
          type="text"
          name="name"
          value={updatedProfile.name}
          onChange={handleInputChange}
        />
        <p>{profile.email}</p>
        {/* <input
          className="text-customGray2 px-2 border-2 border-customGray1"
          placeholder="Contact Number"
          type="text"
          name="contactNumber"
          value={updatedProfile.contactNumber}
          onChange={handleInputChange}
        /> */}
    </div>
  );
};

export default ProfileInput;
