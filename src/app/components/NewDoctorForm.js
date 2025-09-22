"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Loading from "./Loading";
import { showError } from "../utils/toast";
import { Checkbox } from "@/components/ui/checkbox";

function NewDoctorForm({
  setNewUserSection,
  setEntity,
  editDoctor,
  setEditDoctor,
}) {
  // const router = useRouter();
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        let result = await fetch("/api/department?name=1");
        result = await result.json();
        if (result.success) {
          setDepartments(result.departments);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    }
    fetchData();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      departments: [],
    },
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editDoctor) {
      let departmentsIds =
        editDoctor.departments?.map((dept) => dept._id) ||
        (editDoctor.department ? [editDoctor.department._id] : []);

      setValue("name", editDoctor.name);
      setValue("email", editDoctor.email);
      setValue("specialty", editDoctor.specialty);
      setValue("charge", editDoctor.charge);
      setValue("departments", departmentsIds);
    } else {
      reset();
    }
  }, [editDoctor, departments]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const body = editDoctor ? { ...data, _id: editDoctor._id } : data;
      let result = await fetch("/api/newDoctor", {
        method: editDoctor ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      result = await result.json();

      if (result.success) {
        if (editDoctor) {
          setEntity((prevDoctors) =>
            prevDoctors.map((doctor) =>
              doctor._id === result.doctor._id ? result.doctor : doctor
            )
          );
        } else {
          setEntity((prevDoctors) => [result.doctor, ...prevDoctors]);
        }
        setEditDoctor(null);
        setNewUserSection((prev) => !prev);
      } else {
        showError(result.message);
      }
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const departmentsValue = watch("departments");
  return (
    <div>
      <h2 className="font-bold text-2xl text-white">
        Details of {editDoctor ? "edit" : "new"}{" "}
        <span className="text-blue-500">Doctors</span>
      </h2>
      <hr className="border border-slate-800 w-full my-2" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-[95%] px-2 md:w-4/5 lg:w-3/4 mx-auto my-2"
      >
        <input
          id="name"
          type="text"
          placeholder={"Enter the Doctors's name"}
          {...register("name", { required: "Name is required" })}
          className="mt-1 block text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <div className=" py-1 text-sm text-red-500 text-start px-2">
          {errors.name ? "* " + errors.name.message : ""}
        </div>
        <input
          id="email"
          type="email"
          placeholder={"Enter the Doctor's email"}
          {...register("email", { required: "Email is required" })}
          className="mt-1 block text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <div className=" py-1 text-sm text-red-500 text-start px-2">
          {errors.email ? "* " + errors.email.message : ""}
        </div>
        <input
          id="specialty"
          type="text"
          placeholder={"Enter the Doctors's Specialty"}
          {...register("specialty", { required: "Specialty is required" })}
          className="mt-1 block text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <div className=" py-1 text-sm text-red-500 text-start px-2">
          {errors.specialty ? "* " + errors.specialty.message : ""}
        </div>
        <input
          id="charge"
          type="number"
          placeholder={"Doctors's Visiting Charge"}
          {...register("charge")}
          className="mt-1 block text-white w-full px-4 py-3 bg-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 ease-in-out"
        />
        <div className=" py-1 text-sm text-red-500 text-start px-2">
          {errors.charge ? "* " + errors.charge.message : ""}
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-2 text-gray-100">
            Select Department
          </label>
          <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
            {departments.length > 0 ? (
              departments.map((dept) => (
                <label
                  key={dept._id}
                  className="flex items-center gap-2 mb-1 cursor-pointer hover:bg-gray-800 px-1 rounded"
                >
                  <Checkbox
                    className="bg-gray-600 border-white"
                    checked={departmentsValue.includes(dept._id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setValue("departments", [
                          ...departmentsValue,
                          dept._id,
                        ]);
                      } else {
                        setValue(
                          "departments",
                          departmentsValue.filter((v) => v !== dept._id)
                        );
                      }
                    }}
                  />
                  {dept.name}
                </label>
              ))
            ) : (
              <div className="text-sm text-gray-600">No Departments</div>
            )}
          </div>
          {errors.departments && (
            <p className="text-red-500 text-sm mt-1">
              {errors.departments.message}
            </p>
          )}
        </div>

        <hr className="border border-slate-800 w-full my-2" />
        <div className="flex px-4 gap-3 justify-end">
          <div
            className="w-20 h-8 py-1 border border-slate-300 text-white dark:border-slate-700 rounded-lg font-semibold cursor-pointer"
            onClick={() => {
              setNewUserSection((prev) => !prev);
              setEditDoctor(null);
            }}
          >
            Cancel
          </div>
          <button
            type="submit"
            className="w-20 h-8 py-1 flex items-center justify-center gap-2 bg-red-500 rounded-lg font-semibold cursor-pointer text-white"
            disabled={submitting}
          >
            {submitting ? <Loading size={15} /> : <></>}
            {submitting ? "Wait..." : "Confirm"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewDoctorForm;
