// ProfileSection.js
import { useState } from "react";
import ProfileInput from "./ProfileSetting";

const ProfileSection = ({ profile, onSave }) => {
  const [isEditProfile, setIsEditProfile] = useState(false);
  const [updatedProfile, setUpdatedProfile]  = useState(profile)

  const handleSaveProfile = () => {
    onSave(updatedProfile);
    setIsEditProfile(false); 
  };

  const handleInputChange = (e) =>{
    const { name, value } = e.target;
    setUpdatedProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value
    }));   
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">Profile</h2>
      <div className="ml-4">
          <div className="flex flex-col gap-3 h-[80px]">
            <div className="flex gap-4">
              <div className="flex flex-col gap-3">
                <label className="text-customGray2 text-lg">Name: </label>
                <label className="text-customGray2 text-lg">Email: </label>
                {/* <label className="text-customGray2 text-lg">Contact: </label> */}
              </div>
              {!isEditProfile ? 
              <div className="flex flex-col gap-3 text-lg">
                <p>{profile.name}</p>
                <p>{profile.email}</p>
                {/* <p>{profile.contactNumber}</p> */}
              </div> :
                <ProfileInput
                  profile={profile}
                  inputChange = {handleInputChange}
                />
              }
            </div>
          </div>
        {!isEditProfile ? <button
            className="bg-customGray1 w-[280px] py-2 rounded-sm mt-3"
            onClick={() => setIsEditProfile(true)}
          >
            Edit Profile
          </button>:
          <div className="flex gap-4 mt-3 w-full px-8">
            <button className="bg-customGray1 flex-1 py-2 rounded-sm" onClick={() => setIsEditProfile(false)}>Cancel</button>
            <button className="bg-[#34C759] flex-1 py-2 rounded-sm" onClick={handleSaveProfile}>Save</button>
          </div>
          }
      </div>
    </div>
  );
};

export default ProfileSection;
