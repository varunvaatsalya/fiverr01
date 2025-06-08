import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { showError } from "@/app/utils/toast";

export default function NewMfgVendorForm({
  type,
  data,
  setData,
  triggerLabel = "Add",
}) {
  const isEdit = Boolean(data?._id);
  const [open, setOpen] = useState(false);
  const [submiting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      contact: "",
      address: "",
      medicalRepresentator: {
        name: "",
        contact: "",
      },
      bankDetails: [
        {
          accountHolderName: "",
          bankName: "",
          accountNo: "",
          ifsc: "",
          branch: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "bankDetails",
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name || "",
        contact: data.contact || "",
        address: data.address || "",
        medicalRepresentator: {
          name: data.medicalRepresentator?.name || "",
          contact: data.medicalRepresentator?.contact || "",
        },
        bankDetails: data.bankDetails?.length
          ? data.bankDetails
          : [
              {
                accountHolderName: "",
                bankName: "",
                accountNo: "",
                ifsc: "",
                branch: "",
              },
            ],
      });
    }
  }, [data, reset]);

  const onSubmit = async (formData) => {
    setSubmitting(true);
    const method = isEdit ? "PUT" : "POST";
    const url = `/api/medicineMetaData?${type}=1`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        ...(isEdit ? { id: data._id } : {}),
      }),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        setData((prev) => {
          if (isEdit) {
            return prev.map((item) =>
              item._id === result.response._id ? result.response : item
            );
          } else {
            return [result.response, ...prev];
          }
        });
        setOpen(false);
      }
    } else {
      showError("Something went wrong");
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto text-black">
        <DialogTitle className="text-2xl font-semibold">
          {isEdit ? "Edit" : "Add"} {type}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? `Update the ${type} details below.`
            : `Fill in the ${type} details to add.`}
        </DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...register("name", { required: true })} />
            {errors.name && (
              <p className="text-red-500 text-sm">Name is required</p>
            )}

            {type === "vendor" && (
              <>
                <Label>Contact</Label>
                <Input type="number" {...register("contact")} />
              </>
            )}

            {type === "vendor" && (
              <>
                <Label>Address</Label>
                <Input {...register("address")} />
              </>
            )}

            {type === "manufacturer" && (
              <>
                <Label>Medical Rep Name</Label>
                <Input {...register("medicalRepresentator.name")} />

                <Label>Medical Rep Contact</Label>
                <Input {...register("medicalRepresentator.contact")} />
              </>
            )}
          </div>

          <div className="space-y-4 mt-4">
            <h3 className="text-lg font-semibold">Bank Details</h3>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-2 gap-2 border p-3 rounded-md bg-gray-50"
              >
                <Input
                  placeholder="Account Holder Name"
                  {...register(`bankDetails.${index}.accountHolderName`)}
                />
                <Input
                  placeholder="Bank Name"
                  {...register(`bankDetails.${index}.bankName`)}
                />
                <Input
                  type="number"
                  placeholder="Account Number"
                  {...register(`bankDetails.${index}.accountNo`)}
                />
                <Input
                  placeholder="IFSC"
                  {...register(`bankDetails.${index}.ifsc`)}
                />
                <Input
                  placeholder="Branch"
                  {...register(`bankDetails.${index}.branch`)}
                />
                {fields.length > 1 && (
                  <Button
                    variant="destructive"
                    onClick={() => remove(index)}
                    type="button"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}

            <Button
              variant="secondary"
              type="button"
              onClick={() =>
                append({
                  accountHolderName: "",
                  bankName: "",
                  accountNo: "",
                  ifsc: "",
                  branch: "",
                })
              }
            >
              + Add Bank
            </Button>
          </div>

          <Button className="mt-4 w-full" type="submit">
            {submiting ? "Wait..." : (isEdit ? "Update " : "Create ") + type}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
