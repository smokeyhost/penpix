import { useState } from "react";
import ProfileSection from "./components/ProfileSection";
import AccountSetting from "./components/AccountSetting";
import NotificationSetting from "./components/NotificationSetting";
import AccountDisplay from "./components/AccountDisplay";
import { IoIosClose } from "react-icons/io";
import { UserAtom } from "../../atoms/UserAtom";
import { useRecoilValue } from "recoil"; // Import useSetRecoilState
import { useNavigate } from "react-router-dom";
import useToast from "../../hooks/useToast";
import axios from "axios";

const SettingsPage = () => {
  const currentUser = useRecoilValue(UserAtom);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [isChangeRecoveryEmail, setIsChangeRecoveryEmail] = useState(false);
  const navigate = useNavigate();
  const { toastSuccess } = useToast();

  const [profile, setProfile] = useState({
    id: currentUser?.id,
    name: currentUser?.name || "Default Name",  
    email: currentUser?.email || "default@example.com",  
    profileImageUrl: currentUser?.profile_image_url || "",
    contactNumber: currentUser?.contact_number || "000-000-0000",  
    recoveryEmail: currentUser?.recovery_email || "recovery@example.com"
  });

  const handleSaveRecoveryEmail = async (newRecoveryEmail) => {
    try {
      const response = await axios.put('/auth/update-user-info', {
        recoveryEmail: newRecoveryEmail
      });
      const updatedUserProfile = response.data.user;
      setProfile(prevProfile => ({ ...prevProfile, recoveryEmail: updatedUserProfile.recovery_email }));
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setIsChangeRecoveryEmail(false);
      toastSuccess("Recovery email updated successfully");
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleSavePassword = async (newPassword) => {
    try {
      await axios.post("/auth/change-password", {newPassword});
      setIsChangePassword(false);
      toastSuccess("Password changed successfully");
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleSetProfile = async (updatedProfile) => {
    try {
      const response = await axios.put('/auth/update-user-info', {
        name: updatedProfile.name,
        contactNumber: updatedProfile.contactNumber,
      });
      const updatedUserProfile = response.data.user;
      setProfile(prevProfile => ({ ...prevProfile, name: updatedUserProfile.name, contactNumber: updatedUserProfile.contact_number}));
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toastSuccess("Profile name updated successfully");
    } catch (error) {
      console.error(error.message);
    }
  };

  const handlepUloadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post('/auth/upload_profile_image', formData, {
        withCredentials: true, 
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const updatedUserProfile = response.data.user;
      setProfile(prevProfile => ({ ...prevProfile, profileImageUrl: updatedUserProfile.profile_image_url}));
      localStorage.setItem("user", JSON.stringify(updatedUserProfile));
      toastSuccess("Profile image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#EFEFEF] p-5">
      <div className="relative w-full h-full text-customBlack1 bg-white mb-10 rounded-lg p-10 max-md:p-5">
        <div className="absolute top-2 right-2 cursor-pointer">
          <IoIosClose size={35} onClick={() => navigate(`/dashboard/${profile.id}`)}/>
        </div>
        <h2 className="text-customGray2 text-3xl font-medium">Settings</h2>
        <div className="flex h-full w-full gap-2  max-md:gap-10 max-md:flex-col-reverse">
          <div className="ml-5 h-full overflow-y-auto pr-20 pb-10 pt-5 flex flex-col max-md:overflow-y-hidden max-md:h-fit max-sm:w-full">
            <div>
              <ProfileSection profile={profile} onSave={handleSetProfile} />
            </div>

            <div className="mt-7">
              <AccountSetting 
                profile={profile}
                isChangePassword={isChangePassword}
                isChangeRecoveryEmail={isChangeRecoveryEmail}
                onSaveRecoveryEmail={handleSaveRecoveryEmail}
                onSavePassword={handleSavePassword}
                onCancelPassword={() => setIsChangePassword(false)}
                onCancelRecoveryEmail={() => setIsChangeRecoveryEmail(false)}
                onChangePassword={() => setIsChangePassword(true)}
                onChangeRecoveryEmail={() => setIsChangeRecoveryEmail(true)}
              />
            </div>

            <div className="mt-7">
              <NotificationSetting />
            </div>
          </div>

          <div className="flex-1 border-l-4 border-customGray1 px-10 max-md:w-full max-md:border-none max-md:mt-10 w-[200px]">
            <AccountDisplay profile={profile} onUploadProfileImage={handlepUloadProfileImage}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;