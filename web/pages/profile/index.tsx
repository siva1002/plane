import React, { useEffect, useState, ReactElement } from "react";
import { Controller, useForm } from "react-hook-form";
import { Disclosure, Transition } from "@headlessui/react";
import { observer } from "mobx-react-lite";
// services
import { FileService } from "services/file.service";
// hooks
import { useUser } from "hooks/store";
import useUserAuth from "hooks/use-user-auth";
import useToast from "hooks/use-toast";
// layouts
import { ProfileSettingsLayout } from "layouts/settings-layout";
// components
import { ImagePickerPopover, UserImageUploadModal } from "components/core";
import { DeactivateAccountModal } from "components/account";
// ui
import { Button, CustomSelect, CustomSearchSelect, Input, Spinner } from "@plane/ui";
// icons
import { ChevronDown, User2 } from "lucide-react";
// types
import type { IUser } from "@plane/types";
import type { NextPageWithLayout } from "lib/types";
// constants
import { USER_ROLES } from "constants/workspace";
import { TIME_ZONES } from "constants/timezones";

const defaultValues: Partial<IUser> = {
  avatar: "",
  cover_image: "",
  first_name: "",
  last_name: "",
  display_name: "",
  email: "",
  role: "Product / Project Manager",
  user_timezone: "Asia/Kolkata",
};

const fileService = new FileService();

const ProfileSettingsPage: NextPageWithLayout = observer(() => {
  // states
  const [isRemoving, setIsRemoving] = useState(false);
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false);
  const [deactivateAccountModal, setDeactivateAccountModal] = useState(false);
  // form info
  const {
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<IUser>({ defaultValues });
  // toast alert
  const { setToastAlert } = useToast();
  // store hooks
  const { currentUser: myProfile, updateCurrentUser, currentUserLoader } = useUser();
  // custom hooks
  const {} = useUserAuth({ user: myProfile, isLoading: currentUserLoader });

  useEffect(() => {
    reset({ ...defaultValues, ...myProfile });
  }, [myProfile, reset]);

  const onSubmit = async (formData: IUser) => {
    const payload: Partial<IUser> = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      avatar: formData.avatar,
      cover_image: formData.cover_image,
      role: formData.role,
      display_name: formData.display_name,
      user_timezone: formData.user_timezone,
    };

    await updateCurrentUser(payload)
      .then(() => {
        setToastAlert({
          type: "success",
          title: "Success!",
          message: "Profile updated successfully.",
        });
      })
      .catch(() =>
        setToastAlert({
          type: "error",
          title: "Error!",
          message: "There was some error in updating your profile. Please try again.",
        })
      );
  };

  const handleDelete = (url: string | null | undefined, updateUser: boolean = false) => {
    if (!url) return;

    setIsRemoving(true);

    fileService.deleteUserFile(url).then(() => {
      if (updateUser)
        updateCurrentUser({ avatar: "" })
          .then(() => {
            setToastAlert({
              type: "success",
              title: "Success!",
              message: "Profile picture removed successfully.",
            });
            setIsRemoving(false);
          })
          .catch(() => {
            setToastAlert({
              type: "error",
              title: "Error!",
              message: "There was some error in deleting your profile picture. Please try again.",
            });
          })
          .finally(() => setIsRemoving(false));
    });
  };

  const timeZoneOptions = TIME_ZONES.map((timeZone) => ({
    value: timeZone.value,
    query: timeZone.label + " " + timeZone.value,
    content: timeZone.label,
  }));

  if (!myProfile)
    return (
      <div className="grid h-full w-full place-items-center px-4 sm:px-0">
        <Spinner />
      </div>
    );

  return (
    <>
      <Controller
        control={control}
        name="avatar"
        render={({ field: { onChange, value } }) => (
          <UserImageUploadModal
            isOpen={isImageUploadModalOpen}
            onClose={() => setIsImageUploadModalOpen(false)}
            isRemoving={isRemoving}
            handleDelete={() => handleDelete(myProfile?.avatar, true)}
            onSuccess={(url) => {
              onChange(url);
              handleSubmit(onSubmit)();
              setIsImageUploadModalOpen(false);
            }}
            value={value && value.trim() !== "" ? value : null}
          />
        )}
      />
      <DeactivateAccountModal isOpen={deactivateAccountModal} onClose={() => setDeactivateAccountModal(false)} />
      <div className="mx-auto flex h-full w-full flex-col space-y-10 overflow-y-auto pt-16 px-8 pb-8 lg:w-3/5">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex w-full flex-col gap-8">
            <div className="relative h-44 w-full">
              <img
                src={watch("cover_image") ?? "https://images.unsplash.com/photo-1506383796573-caf02b4a79ab"}
                className="h-44 w-full rounded-lg object-cover"
                alt={myProfile?.first_name ?? "Cover image"}
              />
              <div className="absolute -bottom-6 left-8 flex items-end justify-between">
                <div className="flex gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-custom-background-90">
                    <button type="button" onClick={() => setIsImageUploadModalOpen(true)}>
                      {!watch("avatar") || watch("avatar") === "" ? (
                        <div className="h-16 w-16 rounded-md bg-custom-background-80 p-2">
                          <User2 className="h-full w-full text-custom-text-200" />
                        </div>
                      ) : (
                        <div className="relative h-16 w-16 overflow-hidden">
                          <img
                            src={watch("avatar")}
                            className="absolute left-0 top-0 h-full w-full rounded-lg object-cover"
                            onClick={() => setIsImageUploadModalOpen(true)}
                            alt={myProfile.display_name}
                            role="button"
                          />
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-3 right-3 flex">
                <Controller
                  control={control}
                  name="cover_image"
                  render={({ field: { value, onChange } }) => (
                    <ImagePickerPopover
                      label={"Change cover"}
                      onChange={(imageUrl) => onChange(imageUrl)}
                      control={control}
                      value={value ?? "https://images.unsplash.com/photo-1506383796573-caf02b4a79ab"}
                    />
                  )}
                />
              </div>
            </div>

            <div className="item-center mt-4 flex justify-between px-8">
              <div className="flex flex-col">
                <div className="item-center flex text-lg font-semibold text-custom-text-100">
                  <span>{`${watch("first_name")} ${watch("last_name")}`}</span>
                </div>
                <span className="text-sm tracking-tight">{watch("email")}</span>
              </div>

              {/* <Link href={`/profile/${myProfile.id}`}>
              <span className="flex item-center gap-1 text-sm text-custom-primary-100 underline font-medium">
                <ExternalLink className="h-4 w-4" />
                Activity Overview
              </span>
            </Link> */}
            </div>

            <div className="grid grid-cols-1 gap-6 px-8 lg:grid-cols-2 2xl:grid-cols-3">
              <div className="flex flex-col gap-1">
                <h4 className="text-sm">
                  First name<span className="text-red-500">*</span>
                </h4>
                <Controller
                  control={control}
                  name="first_name"
                  rules={{
                    required: "First name is required.",
                  }}
                  render={({ field: { value, onChange, ref } }) => (
                    <Input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={value}
                      onChange={onChange}
                      ref={ref}
                      hasError={Boolean(errors.first_name)}
                      placeholder="Enter your first name"
                      className={`w-full rounded-md ${errors.first_name ? "border-red-500" : ""}`}
                    />
                  )}
                />
                {errors.first_name && <span className="text-xs text-red-500">Please enter first name</span>}
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="text-sm">Last name</h4>

                <Controller
                  control={control}
                  name="last_name"
                  render={({ field: { value, onChange, ref } }) => (
                    <Input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={value}
                      onChange={onChange}
                      ref={ref}
                      hasError={Boolean(errors.last_name)}
                      placeholder="Enter your last name"
                      className="w-full rounded-md"
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="text-sm">
                  Email<span className="text-red-500">*</span>
                </h4>
                <Controller
                  control={control}
                  name="email"
                  rules={{
                    required: "Email is required.",
                  }}
                  render={({ field: { value, ref } }) => (
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={value}
                      ref={ref}
                      hasError={Boolean(errors.email)}
                      placeholder="Enter your email"
                      className={`w-full rounded-md cursor-not-allowed !bg-custom-background-80 ${
                        errors.email ? "border-red-500" : ""
                      }`}
                      disabled
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="text-sm">
                  Role<span className="text-red-500">*</span>
                </h4>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: "Role is required." }}
                  render={({ field: { value, onChange } }) => (
                    <CustomSelect
                      value={value}
                      onChange={onChange}
                      label={value ? value.toString() : "Select your role"}
                      buttonClassName={errors.role ? "border-red-500" : "border-none"}
                      className="rounded-md border-[0.5px] !border-custom-border-200"
                      optionsClassName="w-full"
                      input
                    >
                      {USER_ROLES.map((item) => (
                        <CustomSelect.Option key={item.value} value={item.value}>
                          {item.label}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  )}
                />
                {errors.role && <span className="text-xs text-red-500">Please select a role</span>}
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="text-sm">
                  Display name<span className="text-red-500">*</span>
                </h4>
                <Controller
                  control={control}
                  name="display_name"
                  rules={{
                    required: "Display name is required.",
                    validate: (value) => {
                      if (value.trim().length < 1) return "Display name can't be empty.";

                      if (value.split("  ").length > 1) return "Display name can't have two consecutive spaces.";

                      if (value.replace(/\s/g, "").length < 1)
                        return "Display name must be at least 1 characters long.";

                      if (value.replace(/\s/g, "").length > 20)
                        return "Display name must be less than 20 characters long.";

                      return true;
                    },
                  }}
                  render={({ field: { value, onChange, ref } }) => (
                    <Input
                      id="display_name"
                      name="display_name"
                      type="text"
                      value={value}
                      onChange={onChange}
                      ref={ref}
                      hasError={Boolean(errors.display_name)}
                      placeholder="Enter your display name"
                      className={`w-full ${errors.display_name ? "border-red-500" : ""}`}
                    />
                  )}
                />
                {errors.display_name && <span className="text-xs text-red-500">Please enter display name</span>}
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="text-sm">
                  Timezone<span className="text-red-500">*</span>
                </h4>

                <Controller
                  name="user_timezone"
                  control={control}
                  rules={{ required: "Time zone is required" }}
                  render={({ field: { value, onChange } }) => (
                    <CustomSearchSelect
                      value={value}
                      label={value ? TIME_ZONES.find((t) => t.value === value)?.label ?? value : "Select a timezone"}
                      options={timeZoneOptions}
                      onChange={onChange}
                      optionsClassName="w-full"
                      buttonClassName={errors.user_timezone ? "border-red-500" : "border-none"}
                      className="rounded-md border-[0.5px] !border-custom-border-200"
                      input
                    />
                  )}
                />
                {errors.role && <span className="text-xs text-red-500">Please select a time zone</span>}
              </div>

              <div className="flex items-center justify-between py-2">
                <Button variant="primary" type="submit" loading={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </div>
          </div>
        </form>
        <Disclosure as="div" className="border-t border-custom-border-100 px-8">
          {({ open }) => (
            <>
              <Disclosure.Button as="button" type="button" className="flex w-full items-center justify-between py-4">
                <span className="text-lg tracking-tight">Deactivate account</span>
                <ChevronDown className={`h-5 w-5 transition-all ${open ? "rotate-180" : ""}`} />
              </Disclosure.Button>
              <Transition
                show={open}
                enter="transition duration-100 ease-out"
                enterFrom="transform opacity-0"
                enterTo="transform opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform opacity-100"
                leaveTo="transform opacity-0"
              >
                <Disclosure.Panel>
                  <div className="flex flex-col gap-8">
                    <span className="text-sm tracking-tight">
                      The danger zone of the profile page is a critical area that requires careful consideration and
                      attention. When deactivating an account, all of the data and resources within that account will be
                      permanently removed and cannot be recovered.
                    </span>
                    <div>
                      <Button variant="danger" onClick={() => setDeactivateAccountModal(true)}>
                        Deactivate account
                      </Button>
                    </div>
                  </div>
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
      </div>
    </>
  );
});

ProfileSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <ProfileSettingsLayout>{page}</ProfileSettingsLayout>;
};

export default ProfileSettingsPage;
