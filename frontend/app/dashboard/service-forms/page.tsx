"use client";

import { useState } from "react";

import {
  useCreateServiceForm,
  useServiceForms,
} from "@/hooks/useServiceForms";

export default function ServiceFormsPage() {

  const { data, isLoading } =
    useServiceForms();

  const createMutation =
    useCreateServiceForm();

  const forms =
    data?.data?.data || [];

  const [open, setOpen] =
    useState(false);

  const [formData, setFormData] =
    useState({

      service_id: "",
      title: "",
      description: "",
      is_active: true,
    });

  async function handleSubmit() {

    try {

      await createMutation.mutateAsync(
        formData
      );

      setOpen(false);

      setFormData({
        service_id: "",
        title: "",
        description: "",
        is_active: true,
      });

    } catch (error) {

      console.error(error);
    }
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-bold">
            Service Forms
          </h1>

          <p className="text-sm text-gray-500">
            Manage dynamic service forms
          </p>

        </div>

        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-black px-4 py-2 text-sm text-white"
        >
          Create Form
        </button>

      </div>

      <div className="overflow-hidden rounded-xl border bg-white">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3 text-left">
                ID
              </th>

              <th className="p-3 text-left">
                Title
              </th>

              <th className="p-3 text-left">
                Service
              </th>

              <th className="p-3 text-left">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {isLoading ? (

              <tr>
                <td
                  colSpan={4}
                  className="p-6 text-center"
                >
                  Loading...
                </td>
              </tr>

            ) : forms.length === 0 ? (

              <tr>
                <td
                  colSpan={4}
                  className="p-6 text-center"
                >
                  No forms found
                </td>
              </tr>

            ) : (

              forms.map((form: any) => (

                <tr
                  key={form.id}
                  className="border-t"
                >

                  <td className="p-3">
                    {form.id}
                  </td>

                  <td className="p-3">
                    {form.title}
                  </td>

                  <td className="p-3">
                    {form.service?.name}
                  </td>

                  <td className="p-3">

                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        form.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {form.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {open && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

          <div className="w-full max-w-lg rounded-xl bg-white p-6">

            <h2 className="mb-4 text-xl font-bold">
              Create Service Form
            </h2>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Service ID"
                value={formData.service_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    service_id: e.target.value,
                  })
                }
                className="w-full rounded border p-3"
              />

              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  })
                }
                className="w-full rounded border p-3"
              />

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                className="w-full rounded border p-3"
              />

              <div className="flex justify-end gap-3">

                <button
                  onClick={() => setOpen(false)}
                  className="rounded border px-4 py-2"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  className="rounded bg-black px-4 py-2 text-white"
                >
                  Save
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
